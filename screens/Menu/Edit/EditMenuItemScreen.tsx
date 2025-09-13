import React, { useEffect, useState } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
	Alert,
	FlatList,
	KeyboardAvoidingView,
	Platform,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAuthBackend, useMenuBackend } from '../../../context/GlobalContext'

const debug = true

// TODO: Accept menuItemId as a prop or from navigation params
const EditMenuItemScreen: React.FC = ({ navigation, route }: any) => {
	const authBackend = useAuthBackend()
	const menuBackend = useMenuBackend()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [item, setItem] = useState<any>(null)

	// Fetch menu item details on mount
	useEffect(() => {
		const fetchItem = async () => {
			try {
				// TODO: Replace with actual menuItemId from route.params
				const menuItemId = route.params?.menuItemId
				const menuId = await menuBackend.getMenuId(
					authBackend.user.concessionId
				)
				const items = await menuBackend.getItems(menuId)
				const itemFound = items.find((i: any) => i.id === menuItemId)
				setItem(itemFound)
				console.log('Fetched item:', itemFound)
			} catch (err) {
				setError('Failed to load menu item.')
			} finally {
				setLoading(false)
			}
		}
		fetchItem()
	}, [route.params])

	// Image picker
	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: 'images',
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		})
		if (!result.canceled && result.assets && result.assets.length > 0) {
			setItem({ ...item, imageUri: result.assets[0].uri })
		}
	}

	// Handlers for editing fields
	const handleChange = (field: string, value: any) => {
		setItem({ ...item, [field]: value })
	}

	// TODO: Handlers for editing sizes, variations, addons

	// Save changes
	const handleSave = async () => {
		try {
			setLoading(true)
			await menuBackend.updateItem(item.id, item)
			Alert.alert('Success', 'Menu item updated.')
			navigation.goBack()
		} catch (err) {
			Alert.alert('Error', 'Failed to update menu item.')
		} finally {
			setLoading(false)
		}
	}

	if (loading)
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Loading...</Text>
			</View>
		)
	if (error)
		return (
			<View style={styles.container}>
				<Text style={styles.title}>{error}</Text>
			</View>
		)
	if (!item)
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Menu item not found.</Text>
			</View>
		)

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Edit Menu Item</Text>
			<TouchableOpacity
				style={styles.imageSelector}
				onPress={pickImage}>
				{item.imageUri ? (
					<Image
						source={{ uri: item.imageUri }}
						style={styles.image}
					/>
				) : (
					<Text style={styles.imagePlaceholder}>Edit Image</Text>
				)}
			</TouchableOpacity>
			<Text style={styles.label}>Name:</Text>
			<TextInput
				style={styles.input}
				value={item.name}
				onChangeText={(text) => handleChange('name', text)}
			/>
			{/* TODO: Sizes & Prices, Variations, Addons sections */}
			<TouchableOpacity
				style={styles.saveButton}
				onPress={handleSave}>
				<Text style={styles.saveText}>Save</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#222',
		padding: 24,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#fff',
		marginBottom: 12,
		alignSelf: 'center',
	},
	imageSelector: {
		alignSelf: 'center',
		marginBottom: 32,
		width: 160,
		height: 160,
		borderRadius: 80,
		backgroundColor: '#f0f0f0',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	image: {
		width: 160,
		height: 160,
		borderRadius: 80,
	},
	imagePlaceholder: {
		color: '#888',
		fontSize: 16,
	},
	label: {
		color: '#fff',
		fontSize: 16,
		marginBottom: 4,
		marginTop: 8,
	},
	input: {
		backgroundColor: '#333',
		color: '#fff',
		borderRadius: 8,
		padding: 12,
		fontSize: 18,
		marginBottom: 24,
		width: '100%',
		alignSelf: 'center',
	},
	saveButton: {
		backgroundColor: '#b71c1c',
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: 'center',
		marginTop: 24,
	},
	saveText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
})

export default EditMenuItemScreen
