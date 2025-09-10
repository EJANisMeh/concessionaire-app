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

interface MenuItem {
	name: string
	imageUrl: string
	sizes: { size: string; price: number }[]
	variations: { name: string; prices: { [size: string]: number } }[]
	addons: { name: string; price: number }[]
}

interface MenuBackendType {
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
}

export const MenuBackend = (): MenuBackendType => {
	const [currentItemName, setCurrentItemName] = useState<string>('')
	const [currentItemImageUri, setCurrentItemImageUri] = useState<string | null>(
		null
	)

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
	}
}
