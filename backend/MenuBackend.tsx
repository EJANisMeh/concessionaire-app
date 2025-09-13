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
		item: Partial<MenuItem>
	) => Promise<void>
	deleteItem: (menuId: string, itemId: string) => Promise<void>
	getMenuId: (concessionId: string) => Promise<string | null>
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

	// Helper to upload image if needed
	const uploadImageToCloudinary = async (
		imageUri: string | null,
		onProgress?: (msg: string) => void
	): Promise<string | null> => {
		debug && console.log('Saving image to database')
		if (!imageUri || imageUri.startsWith('http')) return imageUri
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
			if (data.secure_url) {
				onProgress && onProgress('Image uploaded!')
				return data.secure_url
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
			const menuRef = collection(db, 'menu')
			const q = query(menuRef, where('concessionId', '==', concessionId))
			const snapshot = await getDocs(q)
			if (snapshot.empty) return null
			return snapshot.docs[0].id
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
		item
	) => {
		debug && console.log('updateItem debug:', { menuId, itemId, item })
		const itemRef = doc(db, 'menu', menuId, 'items', itemId)
		await updateDoc(itemRef, item)
	}

	const deleteItem: MenuBackendType['deleteItem'] = async (menuId, itemId) => {
		const itemRef = doc(db, 'menu', menuId, 'items', itemId)
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
		if (
			imageUrl &&
			typeof imageUrl === 'string' &&
			imageUrl.startsWith('http') === false
		) {
			const uploadedUrl = await uploadImageToCloudinary(imageUrl, onProgress)
			if (uploadedUrl) {
				imageUrl = uploadedUrl
				setCurrentItemImageUri(uploadedUrl)
			}
		}
		onProgress && onProgress('Saving item to database...')
		const item = {
			...buildMenuItem(),
			imageUrl: imageUrl || '',
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
