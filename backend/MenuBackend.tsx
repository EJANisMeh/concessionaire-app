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
	resetCurrentItem: () => void
}

export const Menu = (): MenuBackendType => {
	const [currentItemName, setCurrentItemName] = useState<string>('')
	const [currentItemImageUri, setCurrentItemImageUri] = useState<string | null>(
		null
	)
	const [sizes, setSizes] = useState<{ size: string; price: string }[]>([])
	const [size, setSize] = useState<string>('')
	const [price, setPrice] = useState<string>('')
	const [variations, setVariations] = useState<VariationInput[]>([])
	const [variationName, setVariationName] = useState<string>('')
	const [addons, setAddons] = useState<{ name: string; price: string }[]>([])
	const [addonName, setAddonName] = useState<string>('')
	const [addonPrice, setAddonPrice] = useState<string>('')

	const resetCurrentItem = () => {
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

	const getItems = async (menuId: string): Promise<MenuItem[]> => {
		const itemsRef = collection(db, 'menu', menuId, 'items')
		const snapshot = await getDocs(itemsRef)
		return snapshot.docs.map((doc) => doc.data() as MenuItem)
	}

	const addItem = async (menuId: string, item: MenuItem): Promise<string> => {
		const itemsRef = collection(db, 'menu', menuId, 'items')
		const docRef = await addDoc(itemsRef, item)
		return docRef.id
	}

	const updateItem = async (
		menuId: string,
		itemId: string,
		item: Partial<MenuItem>
	): Promise<void> => {
		const itemRef = doc(db, 'menu', menuId, 'items', itemId)
		await updateDoc(itemRef, item)
	}

	const deleteItem = async (menuId: string, itemId: string): Promise<void> => {
		const itemRef = doc(db, 'menu', menuId, 'items', itemId)
		await deleteDoc(itemRef)
	}

	return {
		getItems,
		addItem,
		updateItem,
		deleteItem,
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
		resetCurrentItem,
	}
}
