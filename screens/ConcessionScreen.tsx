import React, { useState } from 'react'
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	Modal,
	Pressable,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
const { useNavigation } = require('@react-navigation/native')

type MenuItem = {
	id: string
	name: string
	image: string
	available: boolean
}

const initialMenu: MenuItem[] = [
	{
		id: '1',
		name: 'Hotdog',
		image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
		available: true,
	},
	{
		id: '2',
		name: 'Soda',
		image: 'https://cdn-icons-png.flaticon.com/512/3075/3075979.png',
		available: false,
	},
]

const ConcessionScreen = () => {
	const [menu, setMenu] = useState<MenuItem[]>(initialMenu)
	const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
	const [modalVisible, setModalVisible] = useState(false)
	const navigation = useNavigation()
	const handleAddItem = () => {
		navigation.navigate('AddMenuItem')
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
		setMenu(
			menu.map((item) =>
				item.id === selectedItem.id
					? { ...item, available: !item.available }
					: item
			)
		)
		handleCloseModal()
	}
	const handleEdit = () => {
		// TODO: Navigate to edit screen
		handleCloseModal()
	}

	return (
		<View style={{ flex: 1, padding: 20 }}>
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
