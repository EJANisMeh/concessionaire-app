import React, { useState } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AppStackParamList } from '../../navigation/AppStack'

interface Addon {
	name: string
	price: string
}

type Props = NativeStackScreenProps<AppStackParamList, 'AddMenuItemAddonScreen'>

const AddMenuItemAddonScreen: React.FC<Props> = ({ navigation }) => {
	const [addons, setAddons] = useState<Addon[]>([])
	const [addonName, setAddonName] = useState('')
	const [addonPrice, setAddonPrice] = useState('')

	const handleAddAddon = () => {
		if (!addonName.trim() || !addonPrice.trim()) return
		setAddons([...addons, { name: addonName.trim(), price: addonPrice.trim() }])
		setAddonName('')
		setAddonPrice('')
	}

	const handleRemoveAddon = (idx: number) => {
		setAddons(addons.filter((_, i) => i !== idx))
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Add Addons for Menu Item</Text>
			<View style={{ flex: 1 }}>
				<FlatList
					data={addons}
					keyExtractor={(_, idx) => idx.toString()}
					keyboardShouldPersistTaps="handled"
					renderItem={({ item, index }) => (
						<View style={styles.addonRow}>
							<TextInput
								style={styles.addonInput}
								value={item.name}
								editable={false}
							/>
							<TextInput
								style={styles.priceInput}
								value={item.price}
								editable={false}
							/>
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => handleRemoveAddon(index)}>
								<Text style={styles.removeButtonText}>⦻</Text>
							</TouchableOpacity>
						</View>
					)}
					ListEmptyComponent={<View style={{ height: 16 }} />}
					style={{ flex: 1 }}
				/>
			</View>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
				<View style={styles.addonRow}>
					<TextInput
						style={styles.addonInput}
						placeholder="Addon Name"
						value={addonName}
						onChangeText={setAddonName}
					/>
					<TextInput
						style={styles.priceInput}
						placeholder="₱ Price"
						value={addonPrice}
						onChangeText={setAddonPrice}
						keyboardType="numeric"
					/>
					<TouchableOpacity
						style={styles.addButton}
						onPress={handleAddAddon}>
						<Text style={styles.addButtonText}>＋</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.bottomButtons}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => navigation.goBack()}>
						<Text style={styles.buttonText}>Back</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.submitButton}
						onPress={() => {
							// TODO: Next step
						}}>
						<Text style={styles.buttonText}>Finish</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#222',
		position: 'relative',
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#fff',
		alignSelf: 'center',
		marginBottom: 8,
	},
	addonRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	addonInput: {
		flex: 2,
		backgroundColor: '#333',
		color: '#fff',
		borderRadius: 8,
		padding: 10,
		marginRight: 8,
	},
	priceInput: {
		flex: 2,
		backgroundColor: '#333',
		color: '#fff',
		borderRadius: 8,
		padding: 10,
		marginRight: 8,
	},
	addButton: {
		backgroundColor: '#444',
		borderRadius: 20,
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
	},
	addButtonText: { color: '#fff', fontSize: 22 },
	removeButton: {
		backgroundColor: '#444',
		borderRadius: 20,
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 8,
	},
	removeButtonText: { color: '#fff', fontSize: 18 },
	bottomButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 32,
		marginBottom: 16,
	},
	submitButton: {
		flex: 1,
		backgroundColor: '#b71c1c',
		borderRadius: 8,
		paddingVertical: 14,
		marginRight: 8,
		alignItems: 'center',
	},
	backButton: {
		flex: 1,
		backgroundColor: '#d32f2f',
		borderRadius: 8,
		paddingVertical: 14,
		marginLeft: 8,
		alignItems: 'center',
	},
	buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})

export default AddMenuItemAddonScreen
