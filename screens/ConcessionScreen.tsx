import React, { useState, useEffect, useCallback } from 'react'
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	Modal,
	Pressable,
	Alert,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthBackend, useMenuBackend } from '../context/GlobalContext'
const { useNavigation } = require('@react-navigation/native')

type MenuItem = {
	id: string
	name: string
	image: string
	available: boolean
}

const debug = false

const ConcessionScreen = () => {
	const [loading, setLoading] = useState(false)
	const [menu, setMenu] = useState<MenuItem[]>([])
	const authBackend = useAuthBackend()
	const menuBackend = useMenuBackend()
	// Fetch menu items from Firestore
	const fetchMenuItems = useCallback(async () => {
		if (!authBackend.user?.concessionId) return
		const menuId = await menuBackend.getMenuId(authBackend.user.concessionId)
		if (!menuId) return
		const items = await menuBackend.getItems(menuId)
		// Map backend items to local MenuItem type (add id)
		setMenu(
			items.map((item: any, idx: number) => ({
				id: item.id || String(idx),
				name: item.name,
				image: item.imageUrl,
				available: item.availability ?? false,
			}))
		)
	}, [authBackend.user, menuBackend])

	useEffect(() => {
		fetchMenuItems()
	}, [fetchMenuItems])
	const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
	const [modalVisible, setModalVisible] = useState(false)
	const navigation = useNavigation()
	const handleAddItem = () => {
		navigation.navigate('AddMenuItem')
		// After adding, refetch menu items when returning to this screen
	}

	const handleMenuPress = (item: any) => {
		setSelectedItem(item)
		setModalVisible(true)
	}

	const handleCloseModal = () => {
		setModalVisible(false)
		setSelectedItem(null)
	}

	// Placeholder actions
	const handleRemove = () => {
		if (!selectedItem) return
		setMenu(menu.filter((item) => item.id !== selectedItem.id))
		handleCloseModal()
	}

	const handleToggleAvailability = () => {
		if (!selectedItem) return
		const actionText = selectedItem.available
			? 'mark this item as Out of Stock'
			: 'mark this item as Available'
		Alert.alert(
			'Confirm Availability Change',
			`Are you sure you want to ${actionText}?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: selectedItem.available
						? 'Mark as Out of Stock'
						: 'Mark as Available',
					style: 'destructive',
					onPress: () => {
						// Immediately close modal before async update
						handleCloseModal()
						setLoading(true)
						;(async () => {
							debug &&
								console.log(
									'Concession: Toggling availability for item:',
									selectedItem.id
								)
							try {
								debug && console.log('Concession: Getting menu Id')
								const menuId = await menuBackend.getMenuId(
									authBackend.user.concessionId
								)
								if (!menuId) throw new Error('No menu found')
								// Find the item in menu array
								debug && console.log('Concession: Finding item in local state')
								const itemIdx = menu.findIndex(
									(item) => item.id === selectedItem.id
								)
								if (itemIdx === -1) throw new Error('Item not found')
								// Update backend
								debug &&
									console.log(
										'Concession: Updating item availability in backend'
									)
								await menuBackend.updateItem(menuId, selectedItem.id, {
									availability: !selectedItem.available,
								})
								debug && console.log('Concession: Backend update successful')
								// Update local state
								debug && console.log('Concession: Updating local state')
								setMenu(
									menu.map((item) =>
										item.id === selectedItem.id
											? { ...item, available: !item.available }
											: item
									)
								)
							} catch (err) {
								Alert.alert('Error', 'Failed to update availability.')
							} finally {
								setLoading(false)
							}
						})()
					},
				},
			]
		)
	}

	const handleEdit = () => {
		if (!selectedItem) return
		console.log('Editing item:', selectedItem.id)
		handleCloseModal()
		navigation.navigate('EditMenuItem', { menuItemId: selectedItem.id })
	}

	return (
		<View style={{ flex: 1, padding: 20 }}>
			{loading && (
				<View
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(255,255,255,0.5)',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 10,
					}}>
					<Text style={{ fontSize: 18 }}>Updating...</Text>
				</View>
			)}
			<Text style={{ fontSize: 24, marginBottom: 16 }}>Concession Menu</Text>
			<FlatList
				data={menu}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							marginBottom: 16,
							backgroundColor: '#fff',
							borderRadius: 8,
							padding: 8,
							elevation: 2,
						}}>
						<Image
							source={{ uri: item.image }}
							style={{
								width: 48,
								height: 48,
								borderRadius: 8,
								marginRight: 16,
							}}
						/>
						<View style={{ flex: 1 }}>
							<Text style={{ fontSize: 18 }}>{item.name}</Text>
							<Text
								style={{
									color: item.available ? 'green' : 'red',
									fontSize: 14,
								}}>
								{item.available ? 'Available' : 'Out of Stock'}
							</Text>
						</View>
						<TouchableOpacity onPress={() => handleMenuPress(item)}>
							<MaterialCommunityIcons
								name="dots-vertical"
								size={28}
								color="#333"
							/>
						</TouchableOpacity>
					</View>
				)}
			/>
			{/* Add Item Button */}
			<View style={{ position: 'absolute', bottom: 32, alignSelf: 'center' }}>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={handleAddItem}
					style={{
						width: 60,
						height: 60,
						borderRadius: 30,
						backgroundColor: '#1976D2',
						justifyContent: 'center',
						alignItems: 'center',
						elevation: 6,
					}}>
					<MaterialCommunityIcons
						name="plus"
						size={32}
						color="#fff"
					/>
				</TouchableOpacity>
			</View>
			<Modal
				visible={modalVisible}
				transparent
				animationType="fade"
				onRequestClose={handleCloseModal}>
				<Pressable
					style={{
						flex: 1,
						backgroundColor: 'rgba(0,0,0,0.3)',
					}}
					onPress={handleCloseModal}>
					<View
						style={{
							position: 'absolute',
							bottom: 40,
							left: 20,
							right: 20,
							backgroundColor: '#fff',
							borderRadius: 12,
							padding: 16,
							elevation: 5,
						}}>
						<Text
							style={{
								fontSize: 18,
								marginBottom: 12,
							}}>
							{selectedItem?.name}
						</Text>
						<TouchableOpacity
							onPress={handleEdit}
							style={{ marginBottom: 12 }}>
							<Text style={{ fontSize: 16 }}>Edit</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={handleToggleAvailability}
							style={{ marginBottom: 12 }}>
							<Text style={{ fontSize: 16 }}>
								{selectedItem?.available
									? 'Mark as Out of Stock'
									: 'Mark as Available'}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={handleRemove}>
							<Text style={{ fontSize: 16, color: 'red' }}>Remove</Text>
						</TouchableOpacity>
					</View>
				</Pressable>
			</Modal>
		</View>
	)
}

export default ConcessionScreen
