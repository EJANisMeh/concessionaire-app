import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
	Alert,
	ScrollView,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAuthBackend, useMenuBackend } from '../../../context/GlobalContext'

const debug = false

const EditMenuItemScreen: React.FC = ({ navigation, route }: any) => {
	const authBackend = useAuthBackend()
	const menuBackend = useMenuBackend()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [item, setItem] = useState<any>(null)
	const [initialItem, setInitialItem] = useState<any>(null)
	const bypassRef = useRef<boolean>(false)

	useEffect(() => {
		const loadItem = async () => {
			try {
				const menuItemId = route.params?.menuItemId
				const menuId = await menuBackend.getMenuId(
					authBackend.user.concessionId
				)
				const items = await menuBackend.getItems(menuId)
				const itemFound = items.find((i: any) => i.id === menuItemId)
				setItem(itemFound)
				setInitialItem(itemFound)
				debug && console.log('Fetched item from backend:', itemFound)
			} catch (err) {
				setError('Failed to load menu item.')
			} finally {
				setLoading(false)
			}
		}
		loadItem()
	}, [route.params])

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

	const handleChange = (field: string, value: any) => {
		setItem({ ...item, [field]: value })
	}

	const handleSave = async () => {
		try {
			setLoading(true)
			setProgressMsg && setProgressMsg('Preparing to save...')
			// resolve menuId then call backend.updateItem with progress callback
			const menuId = await menuBackend.getMenuId(authBackend.user.concessionId)
			if (!menuId) throw new Error('Menu ID not found')
			// Normalize image: backend expects a local path in imageUri or a
			// non-http imageUrl; to be explicit, move any local imageUri into
			// imageUrl so backend upload logic runs predictably.
			let payload = { ...item }
			if ((payload as any).imageUri) {
				payload = { ...payload, imageUrl: (payload as any).imageUri }
				delete (payload as any).imageUri
			}
			await menuBackend.updateItem(menuId, item.id, payload, (msg: string) => {
				setProgressMsg(msg)
			})
			// After update, re-fetch the item so we have the final data
			try {
				const refreshedItems = await menuBackend.getItems(menuId)
				const refreshed = refreshedItems.find((i: any) => i.id === item.id)
				if (refreshed) {
					setItem(refreshed)
					setInitialItem(refreshed)
				}
			} catch (err) {
				// ignore; we still navigate back
			}
			Alert.alert('Success', 'Menu item updated.')
			// Bypass confirmation handlers for the programmatic navigation
			bypassRef.current = true
			navigation.goBack()
		} catch (err) {
			console.error('Save error', err)
			Alert.alert('Error', 'Failed to update menu item.')
		} finally {
			setLoading(false)
			setProgressMsg && setProgressMsg('')
		}
	}

	// progress message shown during save
	const [progressMsg, setProgressMsg] = useState<string>('')

	// Confirm save helper: prevent accidental saves while editing
	const confirmSave = useCallback(() => {
		return new Promise<boolean>((resolve) => {
			Alert.alert(
				'Save changes?',
				'Are you sure you want to save your changes?',
				[
					{ text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
					{ text: 'Save', style: 'default', onPress: () => resolve(true) },
				],
				{ cancelable: true }
			)
		})
	}, [])

	// Determine whether there are unsaved changes compared to initial load
	const hasUnsavedChanges = useCallback(() => {
		if (!initialItem || !item) return false
		try {
			return JSON.stringify(initialItem) !== JSON.stringify(item)
		} catch (err) {
			return true
		}
	}, [initialItem, item])

	// Confirm discard helper: used when user attempts to navigate back
	const confirmDiscard = useCallback(() => {
		return new Promise<boolean>((resolve) => {
			if (!hasUnsavedChanges()) return resolve(true)
			Alert.alert(
				'Discard changes?',
				'You have unsaved changes. Are you sure you want to go back and lose them?',
				[
					{ text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
					{
						text: 'Discard',
						style: 'destructive',
						onPress: () => resolve(true),
					},
				],
				{ cancelable: true }
			)
		})
	}, [hasUnsavedChanges])

	// Validation: ensure image present, at least one of sizes/variations/addons exists,
	// and all fields for existing entries are filled (no empty strings).
	const isItemValid = (it: any) => {
		if (!it) return false
		// image required
		if (!it.imageUri && !it.imageUrl) return false
		// require at least one row in sizes, variations, and addons
		const hasSizes = it.sizes && it.sizes.length > 0
		const hasVariations = it.variations && it.variations.length > 0
		const hasAddons = it.addons && it.addons.length > 0
		if (!hasSizes || !hasVariations || !hasAddons) return false
		// name
		if (!it.name || String(it.name).trim().length === 0) return false
		// sizes must have name and price
		if (it.sizes && it.sizes.length > 0) {
			for (const s of it.sizes) {
				if (!s || !s.size || String(s.size).trim().length === 0) return false
				if (
					!s ||
					s.price === undefined ||
					s.price === null ||
					String(s.price).trim().length === 0
				)
					return false
			}
		}
		// variations: name + all prices filled
		if (it.variations && it.variations.length > 0) {
			for (const v of it.variations) {
				if (!v || !v.name || String(v.name).trim().length === 0) return false
				if (v.prices) {
					for (const key of Object.keys(v.prices)) {
						if (
							v.prices[key] === undefined ||
							v.prices[key] === null ||
							String(v.prices[key]).trim().length === 0
						)
							return false
					}
				}
			}
		}
		// addons: name + price
		if (it.addons && it.addons.length > 0) {
			for (const a of it.addons) {
				if (!a || !a.name || String(a.name).trim().length === 0) return false
				if (
					a.price === undefined ||
					a.price === null ||
					String(a.price).trim().length === 0
				)
					return false
			}
		}
		return true
	}

	const saveEnabled = isItemValid(item) && !loading && hasUnsavedChanges()

	// Return structured validation info for per-field messages
	const getValidationErrors = (it: any) => {
		const errors: any = {
			imageMissing: false,
			nameMissing: false,
			sizes: [],
			variations: [],
			addons: [],
			optionsMissing: false,
			sizesMissing: false,
			variationsMissing: false,
			addonsMissing: false,
		}
		if (!it) return errors
		if (!it.imageUri && !it.imageUrl) errors.imageMissing = true
		if (!it.name || String(it.name).trim().length === 0)
			errors.nameMissing = true
		if (it.sizes && it.sizes.length > 0) {
			it.sizes.forEach((s: any) => {
				errors.sizes.push({
					sizeMissing: !s || !s.size || String(s.size).trim().length === 0,
					priceMissing:
						!s ||
						s.price === undefined ||
						s.price === null ||
						String(s.price).trim().length === 0,
				})
			})
		}
		if (it.variations && it.variations.length > 0) {
			it.variations.forEach((v: any) => {
				const priceIssues: any = {}
				if (v.prices) {
					Object.keys(v.prices).forEach((k) => {
						priceIssues[k] =
							v.prices[k] === undefined ||
							v.prices[k] === null ||
							String(v.prices[k]).trim().length === 0
					})
				}
				errors.variations.push({
					nameMissing: !v || !v.name || String(v.name).trim().length === 0,
					priceIssues,
				})
			})
		}
		if (it.addons && it.addons.length > 0) {
			it.addons.forEach((a: any) => {
				errors.addons.push({
					nameMissing: !a || !a.name || String(a.name).trim().length === 0,
					priceMissing:
						a.price === undefined ||
						a.price === null ||
						String(a.price).trim().length === 0,
				})
			})
		}
		// options: require sizes or variations
		const hasSizes = it.sizes && it.sizes.length > 0
		const hasVariations = it.variations && it.variations.length > 0
		const hasAddons = it.addons && it.addons.length > 0
		if (!hasSizes) errors.sizesMissing = true
		if (!hasVariations) errors.variationsMissing = true
		if (!hasAddons) errors.addonsMissing = true
		if (!hasSizes || !hasVariations || !hasAddons) errors.optionsMissing = true
		return errors
	}

	const validation = getValidationErrors(item)

	// Intercept navigation away (header back / swipe back)
	useEffect(() => {
		const beforeRemove = (e: any) => {
			// If we're intentionally bypassing the confirmation (we set bypassRef
			// before programmatic navigation), allow the navigation to continue.
			if (bypassRef.current) {
				bypassRef.current = false
				return
			}
			// Prevent default behavior and show confirm when needed
			e.preventDefault()
			;(async () => {
				const discard = await confirmDiscard()
				if (discard) {
					// mark bypass so the beforeRemove handler doesn't re-prompt
					bypassRef.current = true
					navigation.dispatch(e.data.action)
				}
			})()
		}
		const unsubscribe = navigation.addListener('beforeRemove', beforeRemove)
		return unsubscribe
	}, [navigation, confirmDiscard])

	// Intercept Android hardware back button
	useEffect(() => {
		const onBackPress = () => {
			// Show confirm discard, if user confirms, allow default back
			;(async () => {
				const discard = await confirmDiscard()
				if (discard) {
					bypassRef.current = true
					navigation.goBack()
				}
			})()
			// prevent default now; we'll navigate programmatically if needed
			return true
		}
		// only add BackHandler on Android
		// dynamic import to avoid bundling issues on iOS
		try {
			const { BackHandler, Platform } = require('react-native')
			if (Platform.OS === 'android') {
				const sub = BackHandler.addEventListener(
					'hardwareBackPress',
					onBackPress
				)
				return () => {
					if (sub && typeof sub.remove === 'function') sub.remove()
					else if (typeof BackHandler.removeEventListener === 'function')
						BackHandler.removeEventListener('hardwareBackPress', onBackPress)
				}
			}
		} catch (err) {
			// ignore if BackHandler not available
		}
	}, [confirmDiscard, navigation])

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
		<ScrollView contentContainerStyle={styles.container}>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					marginBottom: 12,
				}}>
				<TouchableOpacity
					onPress={async () => {
						const discard = await confirmDiscard()
						if (discard) {
							bypassRef.current = true
							navigation.goBack()
						}
					}}
					style={{
						marginRight: 12,
						backgroundColor: '#444',
						padding: 8,
						borderRadius: 8,
					}}>
					<Text style={{ color: '#fff', fontSize: 16 }}>{'← Back'}</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Edit Menu Item</Text>
			</View>
			<TouchableOpacity
				style={styles.imageSelector}
				onPress={pickImage}>
				{validation.imageMissing && (
					<View style={{ position: 'absolute', top: -22 }}>
						<Text style={{ color: '#f88', fontSize: 12 }}>Image required</Text>
					</View>
				)}
				{item.imageUri || item.imageUrl ? (
					<Image
						key={item.imageUri || item.imageUrl}
						source={{ uri: item.imageUri || item.imageUrl }}
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
				placeholder="Item name"
				placeholderTextColor="#888"
				onChangeText={(text) => handleChange('name', text)}
			/>
			{validation.nameMissing && (
				<Text style={{ color: '#f88', marginTop: -16, marginBottom: 12 }}>
					Name is required
				</Text>
			)}
			{/* Sizes & Prices */}
			<Text style={styles.label}>Sizes & Prices:</Text>
			{item.sizes && item.sizes.length > 0 ? (
				<View>
					{item.sizes.map((sz: any, idx: number) => (
						<View
							key={idx}
							style={{ marginBottom: 8 }}>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
								}}>
								<TextInput
									style={[
										styles.input,
										{
											flex: 1,
											marginRight: 8,
											marginBottom: 0,
											height: 48,
											width: 'auto',
											textAlignVertical: 'center',
											paddingVertical: 12,
										},
									]}
									value={sz.size}
									placeholder="Size name"
									placeholderTextColor="#888"
									onChangeText={(text) => {
										const newSizes = [...item.sizes]
										newSizes[idx].size = text
										setItem({ ...item, sizes: newSizes })
									}}
								/>
								<TextInput
									style={[
										styles.input,
										{
											flex: 1,
											marginRight: 8,
											marginBottom: 0,
											height: 48,
											width: 'auto',
											textAlignVertical: 'center',
											paddingVertical: 12,
										},
									]}
									value={String(sz.price)}
									placeholder="Price"
									placeholderTextColor="#888"
									keyboardType="numeric"
									onChangeText={(text) => {
										const newSizes = [...item.sizes]
										newSizes[idx].price = text
										setItem({ ...item, sizes: newSizes })
									}}
								/>
								<TouchableOpacity
									style={{
										marginLeft: 8,
										backgroundColor: '#444',
										borderRadius: 20,
										width: 36,
										height: 36,
										alignItems: 'center',
										justifyContent: 'center',
										alignSelf: 'center',
									}}
									onPress={() => {
										// Ask for confirmation before deleting a size
										Alert.alert(
											'Delete size',
											'Are you sure you want to remove this size? This action cannot be undone.',
											[
												{ text: 'Cancel', style: 'cancel' },
												{
													text: 'Delete',
													style: 'destructive',
													onPress: () => {
														const newSizes = item.sizes.filter(
															(_: any, i: number) => i !== idx
														)
														setItem({ ...item, sizes: newSizes })
													},
												},
											]
										)
									}}>
									<Text style={{ color: '#d32f2f', fontSize: 18 }}>⦻</Text>
								</TouchableOpacity>
							</View>
						</View>
					))}
					<TouchableOpacity
						style={{
							backgroundColor: '#444',
							borderRadius: 8,
							padding: 10,
							alignItems: 'center',
							marginBottom: 16,
						}}
						onPress={() => {
							setItem({
								...item,
								sizes: [...item.sizes, { size: '', price: '' }],
							})
						}}>
						<Text style={{ color: '#fff', fontSize: 16 }}>＋ Add Size</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View>
					<Text style={{ color: '#888', marginBottom: 8 }}>
						No sizes added.
					</Text>
					<TouchableOpacity
						style={{
							backgroundColor: '#444',
							borderRadius: 8,
							padding: 10,
							alignItems: 'center',
							marginBottom: 16,
						}}
						onPress={() => {
							setItem({ ...item, sizes: [{ size: '', price: '' }] })
						}}>
						<Text style={{ color: '#fff', fontSize: 16 }}>＋ Add Size</Text>
					</TouchableOpacity>
				</View>
			)}
			{/* Variations */}
			<Text style={styles.label}>Variations:</Text>
			{item.variations && item.variations.length > 0 ? (
				<View>
					{item.variations.map((variation: any, vIdx: number) => (
						<View
							key={vIdx}
							style={{
								marginBottom: 18,
								backgroundColor: '#333',
								borderRadius: 12,
								padding: 12,
								shadowColor: '#000',
								shadowOpacity: 0.2,
								shadowRadius: 4,
								position: 'relative',
							}}>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'space-between',
								}}>
								<View
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										flex: 1,
									}}>
									<Text
										style={{
											color: '#fff',
											fontWeight: 'bold',
											fontSize: 16,
											marginRight: 8,
										}}>
										Variation:
									</Text>
									<TextInput
										style={{
											backgroundColor: '#444',
											color: '#fff',
											borderRadius: 10,
											paddingHorizontal: 14,
											height: 44,
											flex: 1,
											fontSize: 16,
											textAlignVertical: 'center',
											marginVertical: 2,
										}}
										value={variation.name}
										placeholder="Name"
										placeholderTextColor="#ccc"
										onChangeText={(text) => {
											const newVars = [...item.variations]
											newVars[vIdx] = { ...newVars[vIdx], name: text }
											setItem({ ...item, variations: newVars })
										}}
									/>
								</View>
								<TouchableOpacity
									style={{
										backgroundColor: '#444',
										borderRadius: 20,
										width: 36,
										height: 36,
										alignItems: 'center',
										justifyContent: 'center',
										marginLeft: 12,
									}}
									onPress={() => {
										// Confirm before deleting a variation
										Alert.alert(
											'Delete variation',
											'Are you sure you want to remove this variation? This action cannot be undone.',
											[
												{ text: 'Cancel', style: 'cancel' },
												{
													text: 'Delete',
													style: 'destructive',
													onPress: () => {
														const newVars = item.variations.filter(
															(_: any, i: number) => i !== vIdx
														)
														setItem({ ...item, variations: newVars })
													},
												},
											]
										)
									}}>
									<Text style={{ color: '#d32f2f', fontSize: 18 }}>⦻</Text>
								</TouchableOpacity>
							</View>
							{variation.prices &&
								Object.keys(variation.prices).map((sizeKey, sIdx) => (
									<View
										key={sIdx}
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											marginBottom: 8,
											marginLeft: 8,
										}}>
										<Text style={{ color: '#fff', width: 80, fontSize: 15 }}>
											{sizeKey}
										</Text>
										<TextInput
											style={{
												backgroundColor: '#444',
												color: '#fff',
												borderRadius: 10,
												paddingHorizontal: 14,
												paddingVertical: 10,
												fontSize: 16,
												flex: 1,
												marginLeft: 8,
												height: 44,
												textAlignVertical: 'center',
												marginVertical: 4,
											}}
											value={String(variation.prices[sizeKey])}
											placeholder={`Price for ${sizeKey}`}
											placeholderTextColor="#888"
											keyboardType="numeric"
											onChangeText={(text) => {
												const newVars = [...item.variations]
												newVars[vIdx].prices[sizeKey] = text
												setItem({ ...item, variations: newVars })
											}}
										/>
									</View>
								))}
						</View>
					))}
					<TouchableOpacity
						style={{
							backgroundColor: '#444',
							borderRadius: 8,
							padding: 10,
							alignItems: 'center',
							marginBottom: 16,
						}}
						onPress={() => {
							const sizes = item.sizes
								? item.sizes.map((sz: any) => sz.size)
								: []
							const prices: { [size: string]: string } = {}
							sizes.forEach((size: string) => {
								prices[size] = ''
							})
							setItem({
								...item,
								variations: [...item.variations, { name: '', prices }],
							})
						}}>
						<Text style={{ color: '#fff', fontSize: 16 }}>
							＋ Add Variation
						</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View>
					<Text style={{ color: '#888', marginBottom: 8 }}>
						No variations added.
					</Text>
					<TouchableOpacity
						style={{
							backgroundColor: '#444',
							borderRadius: 8,
							padding: 10,
							alignItems: 'center',
							marginBottom: 16,
						}}
						onPress={() => {
							const sizes = item.sizes
								? item.sizes.map((sz: any) => sz.size)
								: []
							const prices: { [size: string]: string } = {}
							sizes.forEach((size: string) => {
								prices[size] = ''
							})
							setItem({ ...item, variations: [{ name: '', prices }] })
						}}>
						<Text style={{ color: '#fff', fontSize: 16 }}>
							＋ Add Variation
						</Text>
					</TouchableOpacity>
				</View>
			)}
			{/* Addons */}
			<Text style={styles.label}>Addons:</Text>
			{item.addons && item.addons.length > 0 ? (
				<View>
					{item.addons.map((addon: any, aIdx: number) => (
						<View
							key={aIdx}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								marginBottom: 8,
							}}>
							<TextInput
								style={[
									styles.input,
									{
										flex: 1,
										marginRight: 8,
										marginBottom: 0,
										height: 48,
										width: 'auto',
										textAlignVertical: 'center',
										paddingVertical: 12,
									},
								]}
								value={addon.name}
								placeholder="Addon name"
								placeholderTextColor="#888"
								onChangeText={(text) => {
									const newAddons = [...item.addons]
									newAddons[aIdx].name = text
									setItem({ ...item, addons: newAddons })
								}}
							/>
							<TextInput
								style={[
									styles.input,
									{
										flex: 1,
										marginRight: 8,
										marginBottom: 0,
										height: 48,
										width: 'auto',
										textAlignVertical: 'center',
										paddingVertical: 12,
									},
								]}
								value={String(addon.price)}
								placeholder="Addon price"
								placeholderTextColor="#888"
								keyboardType="numeric"
								onChangeText={(text) => {
									const newAddons = [...item.addons]
									newAddons[aIdx].price = text
									setItem({ ...item, addons: newAddons })
								}}
							/>
							<TouchableOpacity
								style={{
									marginLeft: 8,
									backgroundColor: '#444',
									borderRadius: 20,
									width: 36,
									height: 36,
									alignItems: 'center',
									justifyContent: 'center',
									alignSelf: 'center',
								}}
								onPress={() => {
									// Confirm before deleting an addon
									Alert.alert(
										'Delete addon',
										'Are you sure you want to remove this addon? This action cannot be undone.',
										[
											{ text: 'Cancel', style: 'cancel' },
											{
												text: 'Delete',
												style: 'destructive',
												onPress: () => {
													const newAddons = item.addons.filter(
														(_: any, i: number) => i !== aIdx
													)
													setItem({ ...item, addons: newAddons })
												},
											},
										]
									)
								}}>
								<Text style={{ color: '#d32f2f', fontSize: 18 }}>⦻</Text>
							</TouchableOpacity>
						</View>
					))}
					<TouchableOpacity
						style={{
							backgroundColor: '#444',
							borderRadius: 8,
							padding: 10,
							alignItems: 'center',
							marginBottom: 16,
						}}
						onPress={() => {
							setItem({
								...item,
								addons: [...item.addons, { name: '', price: '' }],
							})
						}}>
						<Text style={{ color: '#fff', fontSize: 16 }}>＋ Add Addon</Text>
					</TouchableOpacity>
				</View>
			) : (
				<View>
					<Text style={{ color: '#888', marginBottom: 8 }}>
						No addons added.
					</Text>
					<TouchableOpacity
						style={{
							backgroundColor: '#444',
							borderRadius: 8,
							padding: 10,
							alignItems: 'center',
							marginBottom: 16,
						}}
						onPress={() => {
							setItem({ ...item, addons: [{ name: '', price: '' }] })
						}}>
						<Text style={{ color: '#fff', fontSize: 16 }}>＋ Add Addon</Text>
					</TouchableOpacity>
				</View>
			)}
			{/* Only show the global validation message when the item is actually invalid
			   (missing image/fields/options). Don't show it when Save is disabled
			   solely because there are no unsaved changes. */}
			{!isItemValid(item) && !loading && (
				<View style={{ marginTop: 12 }}>
					{validation.optionsMissing ? (
						<View>
							{validation.sizesMissing && (
								<Text style={{ color: '#f88' }}>
									Please add at least one size.
								</Text>
							)}
							{validation.variationsMissing && (
								<Text style={{ color: '#f88' }}>
									Please add at least one variation.
								</Text>
							)}
							{validation.addonsMissing && (
								<Text style={{ color: '#f88' }}>
									Please add at least one addon.
								</Text>
							)}
						</View>
					) : (
						<Text style={{ color: '#f88' }}>
							Please fill out all the fields.
						</Text>
					)}
				</View>
			)}
			{progressMsg ? (
				<View style={{ marginTop: 12 }}>
					<Text style={{ color: '#fff', marginBottom: 6 }}>{progressMsg}</Text>
				</View>
			) : null}
			<TouchableOpacity
				style={[
					styles.saveButton,
					!saveEnabled ? styles.saveButtonDisabled : {},
					{ opacity: saveEnabled ? 1 : 0.7 },
				]}
				onPress={async () => {
					if (!saveEnabled) return
					const ok = await confirmSave()
					if (ok) handleSave()
				}}
				disabled={!saveEnabled}>
				<Text style={styles.saveText}>Save</Text>
			</TouchableOpacity>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#222',
		padding: 20,
	},
	title: {
		color: '#fff',
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 18,
	},
	imageSelector: {
		backgroundColor: '#333',
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		height: 120,
		width: 120,
		alignSelf: 'center',
		marginBottom: 18,
	},
	image: {
		width: 120,
		height: 120,
		borderRadius: 12,
	},
	imagePlaceholder: {
		color: '#aaa',
		fontSize: 16,
	},
	label: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 8,
		marginTop: 12,
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
	saveButtonDisabled: {
		backgroundColor: '#555',
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
