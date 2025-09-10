import React from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useMenuBackend } from '../../context/GlobalContext'

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

	const handleCancel = () => {
		navigation.goBack()
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Add Menu Item</Text>
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
			<View style={styles.buttonRow}>
				<TouchableOpacity
					style={styles.cancelButton}
					onPress={handleCancel}>
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
		backgroundColor: '#fff',
		padding: 24,
		justifyContent: 'center',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 32,
		alignSelf: 'center',
	},
	imageSelector: {
		alignSelf: 'center',
		marginBottom: 32,
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: '#f0f0f0',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	image: {
		width: 120,
		height: 120,
		borderRadius: 60,
	},
	imagePlaceholder: {
		color: '#888',
		fontSize: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 40,
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 32,
	},
	cancelButton: {
		backgroundColor: '#eee',
		paddingVertical: 14,
		paddingHorizontal: 32,
		borderRadius: 8,
	},
	cancelText: {
		color: '#333',
		fontSize: 16,
	},
	nextButton: {
		backgroundColor: '#1976D2',
		paddingVertical: 14,
		paddingHorizontal: 32,
		borderRadius: 8,
	},
	nextText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
})

export default AddMenuItemScreen
