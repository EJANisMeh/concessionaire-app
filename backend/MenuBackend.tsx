import { useState } from 'react'
import { db } from '../firebase'
import {
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
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
	saveCurrentItem: (menuId: string) => Promise<string>
	resetCurrentItem: () => void
}

const debug = true

export const Menu = (): MenuBackendType => {
	// Helper to upload image if needed
	const uploadImageToCloudinary = async (
		imageUri: string | null
	): Promise<string | null> => {
		if (!imageUri || imageUri.startsWith('http')) return imageUri
		try {
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
				return data.secure_url
			} else {
				debug && console.log('Cloudinary upload error:', data)
				return null
			}
		} catch (err) {
			debug &&
				console.log('MenuBackend: Failed to upload image to Cloudinary', err)
			return null
		}
	}
	const [currentItemName, setCurrentItemName]: [
		MenuBackendType['currentItemName'],
		MenuBackendType['setCurrentItemName']
	] = useState<string>('')
	const [currentItemImageUri, setCurrentItemImageUri]: [
		MenuBackendType['currentItemImageUri'],
		MenuBackendType['setCurrentItemImageUri']
	] = useState<string | null>(null)
	const [sizes, setSizes]: [
		MenuBackendType['sizes'],
		MenuBackendType['setSizes']
	] = useState<{ size: string; price: string }[]>([])
	const [size, setSize]: [MenuBackendType['size'], MenuBackendType['setSize']] =
		useState<string>('')
	const [price, setPrice]: [
		MenuBackendType['price'],
		MenuBackendType['setPrice']
	] = useState<string>('')
	const [variations, setVariations]: [
		MenuBackendType['variations'],
		MenuBackendType['setVariations']
	] = useState<VariationInput[]>([])
	const [variationName, setVariationName]: [
		MenuBackendType['variationName'],
		MenuBackendType['setVariationName']
	] = useState<string>('')
	const [addons, setAddons]: [
		MenuBackendType['addons'],
		MenuBackendType['setAddons']
	] = useState<{ name: string; price: string }[]>([])
	const [addonName, setAddonName]: [
		MenuBackendType['addonName'],
		MenuBackendType['setAddonName']
	] = useState<string>('')
	const [addonPrice, setAddonPrice]: [
		MenuBackendType['addonPrice'],
		MenuBackendType['setAddonPrice']
	] = useState<string>('')

	const getItems: MenuBackendType['getItems'] = async (menuId) => {
		const itemsRef = collection(db, 'menu', menuId, 'items')
		const snapshot = await getDocs(itemsRef)
		return snapshot.docs.map(
			(doc) =>
				({
					...doc.data(),
					id: doc.id,
				} as MenuItem & { id: string })
		)
	}

	const getMenuId: MenuBackendType['getMenuId'] = async (concessionId) => {
		// Query the 'menu' collection for a document with matching concessionId
		try {
			const menuRef = collection(db, 'menu')
			// Firestore query: where('concessionId', '==', concessionId)
			// Import 'query' and 'where' from firestore if not already
			// @ts-ignore
			const { query, where, getDocs } = await import('firebase/firestore')
			const q = query(menuRef, where('concessionId', '==', concessionId))
			const snapshot = await getDocs(q)
			if (snapshot.empty) return null
			// Return the first menu document's id
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
		debug &&
			console.log(
				'updateItem debug: menuId =',
				menuId,
				'itemId =',
				itemId,
				'item =',
				item
			)
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

	// Save current item to Firestore
	const saveCurrentItem: MenuBackendType['saveCurrentItem'] = async (
		menuId
	) => {
		debug && console.log('Saving current item to menu')
		// Upload image to Cloudinary if needed
		let imageUrl = currentItemImageUri
		if (imageUrl && !imageUrl.startsWith('http')) {
			const uploadedUrl = await uploadImageToCloudinary(imageUrl)
			if (uploadedUrl) {
				setCurrentItemImageUri(uploadedUrl)
				imageUrl = uploadedUrl
			}
		}
		const item = {
			...buildMenuItem(),
			imageUrl: imageUrl || '',
		}
		return await addItem(menuId, item)
	}

	const resetCurrentItem: MenuBackendType['resetCurrentItem'] = () => {
		setCurrentItemName('')
		setCurrentItemImageUri(null)
		setSizes([])
		setSize('')
		setPrice('')
		setVariations([])
		setAddons([])
		setAddonName('')
		setAddonPrice('')
	}

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
