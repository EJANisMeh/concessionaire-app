import React from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	Alert,
} from 'react-native'
import { useAuthBackend, useMenuBackend } from '../../context/GlobalContext'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AppStackParamList } from '../../navigation/AppStack'
import { auth } from '@/firebase'

interface Addon {
	name: string
	price: string
}

type Props = NativeStackScreenProps<AppStackParamList, 'AddMenuItemAddonScreen'>

const debug = true

const AddMenuItemAddonScreen: React.FC<Props> = ({ navigation }) => {
	const authBackend = useAuthBackend()
	const menuBackend = useMenuBackend()
	const addons = menuBackend.addons
	const setAddons = menuBackend.setAddons
	const addonName = menuBackend.addonName
	const setAddonName = menuBackend.setAddonName
	const addonPrice = menuBackend.addonPrice
	const setAddonPrice = menuBackend.setAddonPrice

	const handleAddAddon = () => {
		const safeName =
			typeof menuBackend.addonName === 'string' ? menuBackend.addonName : ''
		const safePrice =
			typeof menuBackend.addonPrice === 'string' ? menuBackend.addonPrice : ''
		if (!safeName.trim() || !safePrice.trim()) return
		setAddons([...addons, { name: safeName.trim(), price: safePrice.trim() }])
		setAddonName('')
		setAddonPrice('')
	}

	const handleRemoveAddon = (idx: number) => {
		Alert.alert(
			'Remove Addon?',
			'Are you sure you want to remove this addon?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Remove',
					style: 'destructive',
					onPress: () =>
						setAddons(addons.filter((_: any, i: number) => i !== idx)),
				},
			]
		)
	}

	const handleMoveUp = (idx: number) => {
		if (idx === 0) return
		const newAddons = [...addons]
		const temp = newAddons[idx - 1]
		newAddons[idx - 1] = newAddons[idx]
		newAddons[idx] = temp
		setAddons(newAddons)
	}

	const handleMoveDown = (idx: number) => {
		if (idx === addons.length - 1) return
		const newAddons = [...addons]
		const temp = newAddons[idx + 1]
		newAddons[idx + 1] = newAddons[idx]
		newAddons[idx] = temp
		setAddons(newAddons)
	}

	const handleFinish = () => {
		Alert.alert(
			'Finish Adding Menu Item?',
			'Are you sure you want to finish? This will save the menu item.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Finish',
					style: 'destructive',
					onPress: async () => {
						debug && console.log('AddOnScreen: Submittiing menu item')
						try {
							debug && console.log('AddOnScreen: Getting menu Id')
							const menuId = await menuBackend.getMenuId(
								authBackend.user.concessionId
							)
							if (!menuId) {
								Alert.alert('Error', 'No menu found for this concessionaire.')
								return
							}

							debug && console.log('AddOnScreen: Submittiing menu item')
							await menuBackend.saveCurrentItem(menuId)
							menuBackend.resetCurrentItem()
							navigation.navigate('MainTabs', { screen: 'Concession' })
						} catch (err) {
							Alert.alert('Error', 'Failed to save menu item.')
						}
					},
				},
			]
		)
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
								editable={true}
								onChangeText={(text) => {
									const updated = [...addons]
									updated[index] = { ...updated[index], name: text }
									setAddons(updated)
								}}
							/>
							<TextInput
								style={styles.priceInput}
								value={item.price}
								editable={true}
								keyboardType="numeric"
								onChangeText={(text) => {
									const updated = [...addons]
									updated[index] = { ...updated[index], price: text }
									setAddons(updated)
								}}
							/>
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => handleRemoveAddon(index)}>
								<Text style={styles.removeButtonText}>⦻</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.moveButton,
									index === 0 ? { opacity: 0.4 } : null,
								]}
								onPress={() => handleMoveUp(index)}
								disabled={index === 0}>
								<Text style={styles.moveButtonText}>↑</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.moveButton,
									index === addons.length - 1 ? { opacity: 0.4 } : null,
								]}
								onPress={() => handleMoveDown(index)}
								disabled={index === addons.length - 1}>
								<Text style={styles.moveButtonText}>↓</Text>
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
						style={[
							styles.submitButton,
							{
								opacity:
									addons.length === 0 ||
									addons.every((a: Addon) => a.name.trim() && a.price.trim())
										? 1
										: 0.5,
							},
						]}
						onPress={handleFinish}
						disabled={
							addons.length > 0 &&
							addons.some((a: Addon) => !a.name.trim() || !a.price.trim())
						}>
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
	removeButtonText: { color: '#d32f2f', fontSize: 18 },
	moveButton: {
		backgroundColor: '#444',
		borderRadius: 20,
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 4,
	},
	moveButtonText: { color: '#fff', fontSize: 18 },
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
