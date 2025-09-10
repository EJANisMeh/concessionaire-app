import React, { useEffect } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
	Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useMenuBackend } from '../../context/GlobalContext'

const debug = false

const AddMenuItemScreen: React.FC = ({ navigation }: any) => {
	const menuBackend = useMenuBackend()

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: 'images',
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		})
		if (!result.canceled && result.assets && result.assets.length > 0) {
			menuBackend.setCurrentItemImageUri(result.assets[0].uri)
		}
	}

	const handleNext = () => {
		// TODO: Pass imageUri and name to next screen
		navigation.navigate('AddMenuItemSizes')
	}

	let beforeRemoveListener: (() => void) | null = null

	const confirmCancel = () => {
		Alert.alert(
			'Cancel Menu Item?',
			'Are you sure you want to cancel adding this menu item? All unsaved changes will be lost.',
			[
				{ text: 'No', style: 'cancel' },
				{
					text: 'Yes',
					onPress: () => {
						menuBackend.resetCurrentItem()
						if (beforeRemoveListener) beforeRemoveListener()
						navigation.goBack()
					},
					style: 'destructive',
				},
			]
		)
	}

	useEffect(() => {
		debug && console.log('AddMenuItemScreen rendered')

		const beforeRemove = (e: any) => {
			e.preventDefault()
			Alert.alert(
				'Cancel Menu Item?',
				'Are you sure you want to cancel adding this menu item? All unsaved changes will be lost.',
				[
					{ text: 'No', style: 'cancel', onPress: () => {} },
					{
						text: 'Yes',
						onPress: () => {
							menuBackend.resetCurrentItem()
							navigation.dispatch(e.data.action)
						},
						style: 'destructive',
					},
				]
			)
		}

		const unsubscribe = navigation.addListener('beforeRemove', beforeRemove)
		beforeRemoveListener = unsubscribe
		return unsubscribe
	}, [navigation, menuBackend])

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Add Menu Item</Text>
			<View style={styles.centerContent}>
				<TouchableOpacity
					style={styles.imageSelector}
					onPress={pickImage}>
					{menuBackend.currentItemImageUri ? (
						<Image
							source={{ uri: menuBackend.currentItemImageUri }}
							style={styles.image}
						/>
					) : (
						<Text style={styles.imagePlaceholder}>Select Image</Text>
					)}
				</TouchableOpacity>
				<TextInput
					style={styles.input}
					placeholder="Menu Item Name"
					value={menuBackend.currentItemName}
					onChangeText={menuBackend.setCurrentItemName}
				/>
			</View>
			<View style={styles.buttonRow}>
				<TouchableOpacity
					style={styles.cancelButton}
					onPress={confirmCancel}>
					<Text style={styles.cancelText}>Cancel</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.nextButton,
						{ opacity: menuBackend.currentItemName ? 1 : 0.5 },
					]}
					onPress={handleNext}
					disabled={!menuBackend.currentItemName}>
					<Text style={styles.nextText}>Next</Text>
				</TouchableOpacity>
			</View>
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
		width: 160, // increase from 120
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
	input: {
		backgroundColor: '#333',
		color: '#fff',
		borderRadius: 8,
		padding: 12,
		fontSize: 18, // increase font size
		marginBottom: 24,
		width: '80%', // make input wider
		alignSelf: 'center',
	},
	centerContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonRow: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingBottom: 16,
		marginTop: 32,
		marginBottom: 16,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: '#d32f2f',
		borderRadius: 8,
		paddingVertical: 14,
		marginLeft: 8,
		alignItems: 'center',
	},
	cancelText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	nextButton: {
		flex: 1,
		backgroundColor: '#b71c1c',
		borderRadius: 8,
		paddingVertical: 14,
		marginRight: 8,
		alignItems: 'center',
	},
	nextText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
})

export default AddMenuItemScreen
