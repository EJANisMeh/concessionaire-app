import { useState } from 'react'
import { db } from '../firebase'
import { useMediaLibraryPermission } from '../hooks/useMediaLibraryPermission'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system'
import { downloadAsync } from 'expo-file-system/legacy'
import * as MediaLibrary from 'expo-media-library'
import {
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	query,
	where,
} from 'firebase/firestore'
import { DELETE_ASSET_ENDPOINT, DELETE_ASSET_API_KEY } from '../backend/config'

// For Firestore
export interface Variation {
	name: string
	prices: { [size: string]: number }
}

// For backend state (input)
export interface VariationInput {
	name: string
	prices: { [size: string]: string }
}

export interface MenuItem {
	id?: string
	name: string
	imageUrl: string
	// Cloudinary public id (stored separately for reliable deletes)
	imagePublicId?: string
	sizes: { size: string; price: number }[]
	variations: Variation[]
	addons: { name: string; price: number }[]
	availability: boolean
}

export interface MenuBackendType {
	getItems: (menuId: string) => Promise<MenuItem[]>
	addItem: (menuId: string, item: MenuItem) => Promise<string>
	updateItem: (
		menuId: string,
		itemId: string,
		item: Partial<MenuItem>,
		onProgress?: (msg: string) => void
	) => Promise<void>
	deleteItem: (menuId: string, itemId: string) => Promise<void>
	getMenuId: (concessionId?: any) => Promise<string | null>
	currentItemName: string
	setCurrentItemName: (name: string) => void
	currentItemImageUri: string | null
	setCurrentItemImageUri: (uri: string | null) => void
	sizes: { size: string; price: string }[]
	setSizes: (sizes: { size: string; price: string }[]) => void
	size: string
	setSize: (size: string) => void
	price: string
	setPrice: (price: string) => void
	variations: VariationInput[]
	setVariations: (variations: VariationInput[]) => void
	variationName: string
	setVariationName: (name: string) => void
	addons: { name: string; price: string }[]
	setAddons: (addons: { name: string; price: string }[]) => void
	addonName: string
	setAddonName: (name: string) => void
	addonPrice: string
	setAddonPrice: (price: string) => void
	saveCurrentItem: (
		menuId: string,
		onProgress?: (msg: string) => void
	) => Promise<string>
	resetCurrentItem: () => void
}

const debug = true

export const Menu = (): MenuBackendType => {
	// State hooks
	const [currentItemName, setCurrentItemName] =
		useState<MenuBackendType['currentItemName']>('')
	const [currentItemImageUri, setCurrentItemImageUri] =
		useState<MenuBackendType['currentItemImageUri']>(null)
	const [sizes, setSizes] = useState<MenuBackendType['sizes']>([])
	const [size, setSize] = useState<MenuBackendType['size']>('')
	const [price, setPrice] = useState<MenuBackendType['price']>('')
	const [variations, setVariations] = useState<MenuBackendType['variations']>(
		[]
	)
	const [variationName, setVariationName] =
		useState<MenuBackendType['variationName']>('')
	const [addons, setAddons] = useState<MenuBackendType['addons']>([])
	const [addonName, setAddonName] = useState<MenuBackendType['addonName']>('')
	const [addonPrice, setAddonPrice] =
		useState<MenuBackendType['addonPrice']>('')
	// Media library permission hook
	const { checkAndRequestPermission } = useMediaLibraryPermission()

	// Helper to delete Cloudinary assets.
	// Strategy:
	// 1) Try Firebase callable (across common regions)
	// 2) If not deployed or unavailable (e.g. Spark plan), fall back to an
	//    authenticated HTTP endpoint (e.g. a Vercel serverless function) you
	//    can deploy separately. This avoids requiring Blaze billing on Firebase.
	//
	// DELETE_ASSET_ENDPOINT and DELETE_ASSET_API_KEY are imported from
	// `backend/config.ts` so they can be provided via Expo extras or
	// environment variables at build time.

	// Helper: extract Cloudinary public_id from a Cloudinary URL. Handles
	// optional transformation segments (e.g. /w_200,h_200/), optional version
	// segments (e.g. /v12345/), and nested folders. Returns decoded public_id
	// or undefined if it cannot be parsed.
	const extractCloudinaryPublicId = (
		url: string | undefined
	): string | undefined => {
		if (!url) return undefined
		try {
			// Cloudinary URLs look like: .../upload/<transformations>/v12345/folder/name.jpg
			// We want to skip any transformation segments between /upload/ and the
			// optional /v<number>/, then capture the remainder up to the file
			// extension or query string.
			const m = url.match(
				/\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+?)(?:\.[A-Za-z0-9]+)?(?:$|\?)/
			)
			if (!m || !m[1]) return undefined
			return decodeURIComponent(m[1])
		} catch (e) {
			return undefined
		}
	}

	const callDeleteCloudinaryAsset = async (publicId: string) => {
		// If an HTTP fallback endpoint is configured, prefer it. This avoids
		// calling Firebase callables (which may not be deployed) and simplifies
		// local development where the HTTP endpoint is available.
		if (DELETE_ASSET_ENDPOINT && DELETE_ASSET_API_KEY) {
			try {
				if (debug) {
					console.log('[callDelete] Using HTTP fallback', DELETE_ASSET_ENDPOINT)
					console.log('[callDelete] Deleting publicId:', publicId)
				}
				const res = await fetch(DELETE_ASSET_ENDPOINT, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-delete-api-key': DELETE_ASSET_API_KEY,
					},
					body: JSON.stringify({ publicId }),
				})
				const text = await res.text()
				if (!res.ok) {
					// include body in the thrown error for better diagnostics
					throw new Error(`HTTP delete fallback failed: ${res.status} ${text}`)
				}
				// If the endpoint returned OK but returned a JSON 'result' that indicates not found,
				// surface it via a debug log so callers can see it.
				try {
					const parsed = JSON.parse(text)
					if (debug) console.log('[callDelete] HTTP fallback response:', parsed)
				} catch (e) {
					if (debug)
						console.log('[callDelete] HTTP fallback response text:', text)
				}
				return
			} catch (httpErr) {
				// If HTTP fallback fails for any reason, fall back to callable below
				if (debug)
					console.log(
						'[callDelete] HTTP fallback failed, will try callable',
						httpErr
					)
			}
		}

		// Try calling Firebase callable across common regions as a final attempt
		try {
			const functionsModule = await import('firebase/functions')
			const { getFunctions, httpsCallable } = functionsModule
			const regionsToTry = [undefined, 'us-central1', 'europe-west1']
			let lastErr: any = null
			for (const region of regionsToTry) {
				try {
					if (debug)
						console.log(
							'[callDelete] Trying callable region:',
							region || 'default'
						)
					const funcs = region
						? getFunctions(undefined, region)
						: getFunctions()
					const callable = httpsCallable(funcs, 'deleteCloudinaryAsset')
					await callable({ publicId })
					if (debug)
						console.log(
							'[callDelete] Callable succeeded for region:',
							region || 'default'
						)
					return
				} catch (err) {
					lastErr = err
					// Provide better diagnostics without exposing secrets
					const code = (err as any)?.code || (err as any)?.status
					const message = (err as any)?.message || ''
					if (debug)
						console.log(
							'[callDelete] Callable error for region:',
							region || 'default',
							{ code, message }
						)
					// If the callable returned not-found for this region, try the next one
					if (typeof code === 'string' && code.includes('not-found')) continue
					if (
						typeof message === 'string' &&
						message.includes('Cloud Functions API has not been used')
					)
						continue
					throw err
				}
			}
			throw lastErr
		} catch (callableErr) {
			// If callable also failed, surface the error to the caller but attempt
			// the HTTP fallback if configured (covers cases where callable fails
			// in the client but the HTTP endpoint is available in config).
			if (debug)
				console.log('[callDelete] Callable overall failure:', callableErr)
			const code =
				(callableErr as any)?.code || (callableErr as any)?.status || null
			const message = (callableErr as any)?.message || String(callableErr)
			// If HTTP fallback is configured, try it as a last resort
			if (DELETE_ASSET_ENDPOINT && DELETE_ASSET_API_KEY) {
				if (debug)
					console.log(
						'[callDelete] Attempting HTTP fallback after callable failure'
					)
				try {
					const res = await fetch(DELETE_ASSET_ENDPOINT, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'x-delete-api-key': DELETE_ASSET_API_KEY,
						},
						body: JSON.stringify({ publicId }),
					})
					const text = await res.text()
					if (!res.ok) {
						throw new Error(
							`HTTP delete fallback (after callable failure) failed: ${res.status} ${text}`
						)
					}
					try {
						const parsed = JSON.parse(text)
						if (debug)
							console.log(
								'[callDelete] HTTP fallback (after callable) response:',
								parsed
							)
					} catch (e) {
						if (debug)
							console.log(
								'[callDelete] HTTP fallback (after callable) response text:',
								text
							)
					}
					return
				} catch (httpErr) {
					if (debug)
						console.log(
							'[callDelete] HTTP fallback also failed after callable failure:',
							httpErr
						)
					// Throw the original callable error to preserve the original failure context
					throw callableErr
				}
			}
			// No HTTP fallback available or it failed: rethrow the callable error
			throw callableErr
		}
	}

	// Helper to upload image if needed
	const uploadImageToCloudinary = async (
		imageUri: string | null,
		onProgress?: (msg: string) => void
	): Promise<{ url: string; publicId?: string } | null> => {
		debug && console.log('Saving image to database')
		if (!imageUri) return null
		// If the image is already a remote URL, attempt to extract its publicId
		// and return it so callers can reuse the existing metadata without
		// re-uploading.
		if (imageUri.startsWith('http')) {
			const existingPublicId = extractCloudinaryPublicId(imageUri)
			return { url: imageUri, publicId: existingPublicId }
		}
		try {
			onProgress && onProgress('Uploading image to database...')
			const CLOUDINARY_URL =
				'https://api.cloudinary.com/v1_1/db6gcoyum/image/upload'
			const UPLOAD_PRESET = 'SCaFOMA-UB'
			const formData = new FormData()
			formData.append('file', {
				uri: imageUri,
				type: 'image/jpeg',
				name: `menu-image-${Date.now()}.jpg`,
			} as any)
			formData.append('upload_preset', UPLOAD_PRESET)
			const response = await fetch(CLOUDINARY_URL, {
				method: 'POST',
				body: formData,
			})
			const data = await response.json()
			if (data && data.secure_url) {
				onProgress && onProgress('Image uploaded!')
				// data.public_id is provided by Cloudinary on upload
				return {
					url: data.secure_url as string,
					publicId: data.public_id as string,
				}
			} else {
				debug && console.log('Cloudinary upload error:', data)
				onProgress && onProgress('Cloudinary upload error')
				return null
			}
		} catch (err) {
			debug &&
				console.log('MenuBackend: Failed to upload image to Cloudinary', err)
			onProgress && onProgress('Failed to upload image to Cloudinary')
			return null
		}
	}

	const getItems: MenuBackendType['getItems'] = async (menuId) => {
		try {
			const itemsRef = collection(db, 'menu', menuId, 'items')
			const snapshot = await getDocs(itemsRef)
			const items: MenuItem[] = snapshot.docs.map((doc: any) => ({
				...doc.data(),
				id: doc.id,
			}))
			return items
		} catch (err) {
			debug && console.log('MenuBackend: Firestore fetch error', err)
			return []
		}
	}

	const getMenuId: MenuBackendType['getMenuId'] = async (concessionId) => {
		try {
			// If no concessionId provided, there is no menu to look up
			if (!concessionId) return null
			// Normalize concessionId: it may be a DocumentReference, a path, or an id
			let normalizedId = concessionId
			try {
				if (
					concessionId &&
					typeof concessionId === 'object' &&
					(concessionId as any).id
				)
					normalizedId = (concessionId as any).id
				else if (typeof concessionId === 'string' && concessionId.includes('/'))
					normalizedId = (concessionId.split('/').pop() as string) || ''
			} catch (e) {
				// fallback to original
			}
			const menuRef = collection(db, 'menu')
			// Try several forms depending on how concessionId was stored in menu docs:
			// 1) plain id string (e.g. 'xBJnkj...')
			// 2) path string with or without leading slash (e.g. '/concessions/xBJnkj...' or 'concessions/xBJnkj...')
			// 3) a Firestore DocumentReference to the concession document
			const attempts: Array<any> = []
			// 1: id as stored directly
			attempts.push(normalizedId)
			// 2: path forms
			attempts.push(`/concessions/${normalizedId}`)
			attempts.push(`concessions/${normalizedId}`)
			// 3: document reference
			try {
				const concessionRef = doc(db, 'concessions', normalizedId)
				attempts.push(concessionRef)
			} catch (e) {
				// ignore
			}
			for (const val of attempts) {
				try {
					const q = query(menuRef, where('concessionId', '==', val as any))
					const snapshot = await getDocs(q)
					if (!snapshot.empty) return snapshot.docs[0].id
				} catch (e) {
					// ignore and try next
					if (debug) console.log('getMenuId attempt failed for', val, e)
				}
			}
			// nothing matched
			return null
		} catch (err) {
			debug && console.log('getMenuId debug: Error getting menuId:', err)
			return null
		}
	}

	const addItem: MenuBackendType['addItem'] = async (menuId, item) => {
		const itemsRef = collection(db, 'menu', menuId, 'items')
		const docRef = await addDoc(itemsRef, item)
		return docRef.id
	}

	const updateItem: MenuBackendType['updateItem'] = async (
		menuId,
		itemId,
		item,
		onProgress
	) => {
		debug && console.log('updateItem debug:', { menuId, itemId, item })
		const itemRef = doc(db, 'menu', menuId, 'items', itemId)

		// Flow: if the incoming image differs and is local, upload the new image
		// first, then delete the old Cloudinary asset, and finally update Firestore
		// with the new image URL/public id. If upload fails, abort the update so we
		// don't change the DB prematurely.
		let abortUpdate = false
		try {
			const { getDoc } = await import('firebase/firestore')
			const snap = await getDoc(itemRef)
			let currentImageUrl: string | undefined = undefined
			let currentImagePublicId: string | undefined = undefined
			if (snap.exists()) {
				currentImageUrl = snap.data().imageUrl
				currentImagePublicId = snap.data().imagePublicId
			}

			// Normalize incoming image reference
			let incomingImage: string | undefined = undefined
			if (item && (item as any).imageUri) incomingImage = (item as any).imageUri
			else if (item && (item as any).imageUrl)
				incomingImage = (item as any).imageUrl

			const incomingIsLocal =
				incomingImage &&
				typeof incomingImage === 'string' &&
				!incomingImage.startsWith('http')

			if (incomingIsLocal) {
				// Upload new image first
				onProgress && onProgress('Uploading new image to Cloudinary...')
				const uploaded = await uploadImageToCloudinary(
					incomingImage || null,
					onProgress
				)
				if (!uploaded) {
					onProgress && onProgress('Image upload failed')
					abortUpdate = true
					throw new Error('Image upload failed')
				}
				// Attach uploaded info to payload
				item = {
					...item,
					imageUrl: uploaded.url,
					...(uploaded.publicId ? { imagePublicId: uploaded.publicId } : {}),
				}
				if ((item as any).imageUri) delete (item as any).imageUri
				onProgress && onProgress('Image uploaded')

				// Now delete the previous asset if it exists
				const existingPublicId =
					currentImagePublicId || extractCloudinaryPublicId(currentImageUrl)
				if (existingPublicId) {
					try {
						if (debug)
							console.log('[updateItem] Deleting previous asset after upload', {
								existingPublicId,
								currentImageUrl,
								currentImagePublicId,
							})
						await callDeleteCloudinaryAsset(existingPublicId)
					} catch (err) {
						// Non-fatal: log and continue, but include structured error fields
						const code = (err as any)?.code || (err as any)?.status || null
						const message = (err as any)?.message || String(err)
						debug &&
							console.log('[updateItem] Post-upload delete failed', {
								code,
								message,
								err,
							})
					}
				}
			}
		} catch (err) {
			debug && console.log('updateItem image handling error', err)
			if (abortUpdate) throw err
		}

		// Finally update the document
		await updateDoc(itemRef, item)
	}

	const deleteItem: MenuBackendType['deleteItem'] = async (menuId, itemId) => {
		// Get the item document reference
		const itemRef = doc(db, 'menu', menuId, 'items', itemId)
		let imageUrl: string | undefined = undefined
		let storedImagePublicId: string | undefined = undefined
		try {
			// Get the item document itself
			const { getDoc } = await import('firebase/firestore')
			const itemDocSnap = await getDoc(itemRef)
			if (itemDocSnap.exists()) {
				imageUrl = itemDocSnap.data().imageUrl
				storedImagePublicId = itemDocSnap.data().imagePublicId
			}
		} catch (err) {
			debug && console.log('Error fetching item document for delete:', err)
		}

		// Delete image from Cloudinary if it is a Cloudinary URL
		if (
			imageUrl &&
			typeof imageUrl === 'string' &&
			imageUrl.startsWith('http')
		) {
			try {
				if (debug) {
					const publicId =
						storedImagePublicId || extractCloudinaryPublicId(imageUrl)
					const effectivePublicId = storedImagePublicId || publicId
					console.log('[deleteItem] Attempting delete with values:', {
						imageUrl,
						storedImagePublicId,
						parsedPublicId: extractCloudinaryPublicId(imageUrl),
						effectivePublicId,
					})
				}
				// Extract public_id and use the shared helper which tries
				// Firebase callable first and then the HTTP fallback if configured.
				const publicId =
					storedImagePublicId || extractCloudinaryPublicId(imageUrl)
				if (publicId) {
					try {
						if (debug)
							console.log('[deleteItem] Deleting Cloudinary asset for item', {
								publicId,
							})
						await callDeleteCloudinaryAsset(publicId)
					} catch (err) {
						const code = (err as any)?.code || (err as any)?.status || null
						const message = (err as any)?.message || String(err)
						debug &&
							console.log(
								'[deleteItem] Failed to delete Cloudinary asset for item delete',
								{
									publicId,
									code,
									message,
									err,
								}
							)
					}
				}
			} catch (err) {
				debug && console.log('Failed to delete image from Cloudinary:', err)
			}
		}
		await deleteDoc(itemRef)
	}

	// Data structurer
	const buildMenuItem = (): MenuItem => {
		debug && console.log('Building menu item')
		return {
			name: currentItemName,
			imageUrl: currentItemImageUri || '',
			sizes: sizes.map((s) => ({ size: s.size, price: Number(s.price) })),
			variations: variations.map((v) => ({
				name: v.name,
				prices: Object.fromEntries(
					Object.entries(v.prices).map(([size, price]) => [size, Number(price)])
				),
			})),
			addons: addons.map((a) => ({ name: a.name, price: Number(a.price) })),
			availability: false,
		}
	}

	const saveCurrentItem: MenuBackendType['saveCurrentItem'] = async (
		menuId,
		onProgress
	) => {
		debug && console.log('Saving current item to menu')
		// Permission check before cache update
		const hasPermission = await checkAndRequestPermission()
		if (!hasPermission) {
			debug &&
				console.log(
					'Media library permission not granted. Skipping cache update.'
				)
		}
		onProgress && onProgress('Preparing to save item...')
		// Upload image to Cloudinary if needed
		let imageUrl = currentItemImageUri
		let uploadedPublicId: string | undefined = undefined
		if (
			imageUrl &&
			typeof imageUrl === 'string' &&
			imageUrl.startsWith('http') === false
		) {
			const uploadedUrl = await uploadImageToCloudinary(imageUrl, onProgress)
			if (uploadedUrl) {
				imageUrl = uploadedUrl.url
				// store public id locally so we persist it with the item
				if ((uploadedUrl as any).publicId) {
					uploadedPublicId = (uploadedUrl as any).publicId
				}
				setCurrentItemImageUri(uploadedUrl.url)
			}
		}
		onProgress && onProgress('Saving item to database...')
		const item = {
			...buildMenuItem(),
			imageUrl: imageUrl || '',
			...(uploadedPublicId ? { imagePublicId: uploadedPublicId } : {}),
		}
		const id = await addItem(menuId, item)
		onProgress && onProgress('Item saved!')
		return id
	}

	const resetCurrentItem: MenuBackendType['resetCurrentItem'] = () => {
		setCurrentItemName('')
		setCurrentItemImageUri(null)
		setSizes([])
		setSize('')
		setPrice('')
		setVariations([])
		setVariationName('')
		setAddons([])
		setAddonName('')
		setAddonPrice('')
	}

	// Return backend API
	return {
		getItems,
		addItem,
		updateItem,
		deleteItem,
		getMenuId,
		currentItemName,
		setCurrentItemName,
		currentItemImageUri,
		setCurrentItemImageUri,
		sizes,
		setSizes,
		size,
		setSize,
		price,
		setPrice,
		variations,
		setVariations,
		variationName,
		setVariationName,
		addons,
		setAddons,
		addonName,
		setAddonName,
		addonPrice,
		setAddonPrice,
		saveCurrentItem,
		resetCurrentItem,
	}
}
