import { useEffect, useRef } from 'react'
import { useMenuBackend } from '../../../context/GlobalContext'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	Alert,
} from 'react-native'

const debug = false

const AddMenuItemSizesScreen: React.FC = ({ navigation }: any) => {
	const menuBackend = useMenuBackend()
	const scrollRef = useRef<any>(null)
	// store y positions for each size row inside the ScrollView content
	const sizeRowYs = useRef<number[]>([])

	const scrollToIndex = (index: number) => {
		const y = sizeRowYs.current[index] ?? 0
		const offset = Platform.OS === 'android' ? 140 : 20
		// small guard: ensure scrollRef exists
		try {
			scrollRef.current?.scrollTo({
				y: Math.max(0, y - offset),
				animated: true,
			})
		} catch (err) {
			// ignore
		}
	}

	const handleAddSize = () => {
		if (!menuBackend.size || !menuBackend.price) return
		menuBackend.setSizes([
			...menuBackend.sizes,
			{ size: menuBackend.size, price: menuBackend.price },
		])
		menuBackend.setSize('')
		menuBackend.setPrice('')
	}

	const confirmRemoveSize = (idx: number) => {
		Alert.alert(
			'Remove size?',
			'Are you sure you want to remove this size and price?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Remove',
					onPress: () => handleRemoveSize(idx),
					style: 'destructive',
				},
			]
		)
	}

	const handleRemoveSize = (idx: number) => {
		menuBackend.setSizes(
			menuBackend.sizes.filter(
				(_: { size: string; price: string }, i: number) => i !== idx
			)
		)
	}

	const handleEditSize = (
		idx: number,
		field: 'size' | 'price',
		value: string
	) => {
		menuBackend.setSizes(
			menuBackend.sizes.map(
				(item: { size: string; price: string }, i: number) =>
					i === idx ? { ...item, [field]: value } : item
			)
		)
	}

	const handleMoveUp = (idx: number) => {
		if (idx === 0) return
		const newSizes = [...menuBackend.sizes]
		const temp = newSizes[idx - 1]
		newSizes[idx - 1] = newSizes[idx]
		newSizes[idx] = temp
		menuBackend.setSizes(newSizes)
	}

	const handleMoveDown = (idx: number) => {
		if (idx === menuBackend.sizes.length - 1) return
		const newSizes = [...menuBackend.sizes]
		const temp = newSizes[idx + 1]
		newSizes[idx + 1] = newSizes[idx]
		newSizes[idx] = temp
		menuBackend.setSizes(newSizes)
	}

	const hasEmptyFields = menuBackend.sizes.some(
		(item: { size: string; price: string }) => !item.size || !item.price
	)

	const handleNext = () => {
		if (menuBackend.sizes.length === 0 || hasEmptyFields) {
			return
		}
		const sizeNames = menuBackend.sizes.map(
			(s: { size: string; price: string }) => s.size
		)
		navigation.navigate('AddMenuItemVariationsScreen', {
			sizes: sizeNames,
		})
	}

	useEffect(() => {
		debug && console.log('AddMenuItemSizesScreen rendered')
	})

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
			<ScrollView
				ref={scrollRef}
				contentContainerStyle={styles.container}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				removeClippedSubviews={false}>
				<View>
					<Text style={styles.title}>Add Sizes and Prices for</Text>
					<Text style={styles.subtitle}>Sizes and Prices:</Text>
				</View>

				<View style={{ flex: 1, width: '100%' }}>
					{menuBackend.sizes && menuBackend.sizes.length > 0 ? (
						menuBackend.sizes.map((item: any, index: number) => (
							<View
								style={styles.sizeRow}
								key={index.toString()}
								onLayout={(e) => {
									// record vertical position of this row inside content
									sizeRowYs.current[index] = e.nativeEvent.layout.y
								}}>
								<TextInput
									style={styles.sizeInput}
									value={item.size}
									onChangeText={(text) => handleEditSize(index, 'size', text)}
									onFocus={() => scrollToIndex(index)}
								/>
								<TextInput
									style={styles.priceInput}
									value={item.price}
									onChangeText={(text) => handleEditSize(index, 'price', text)}
									keyboardType="numeric"
									onFocus={() => scrollToIndex(index)}
								/>
								<TouchableOpacity
									style={styles.removeButton}
									onPress={() => confirmRemoveSize(index)}>
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
										index === menuBackend.sizes.length - 1
											? { opacity: 0.4 }
											: null,
									]}
									onPress={() => handleMoveDown(index)}
									disabled={index === menuBackend.sizes.length - 1}>
									<Text style={styles.moveButtonText}>↓</Text>
								</TouchableOpacity>
							</View>
						))
					) : (
						<View style={{ height: 16 }} />
					)}
				</View>

				<View style={{ width: '100%' }}>
					<View
						style={styles.sizeRow}
						onLayout={(e) => {
							// make sure the add-row is tracked at the end
							const idx = menuBackend.sizes.length
							sizeRowYs.current[idx] = e.nativeEvent.layout.y
						}}>
						<TextInput
							style={styles.sizeInput}
							placeholder="Size"
							value={menuBackend.size}
							onChangeText={menuBackend.setSize}
							onFocus={() => {
								// scroll to bottom where the add controls live
								scrollRef.current?.scrollToEnd({ animated: true })
							}}
						/>
						<TextInput
							style={styles.priceInput}
							placeholder="₱ Price"
							value={menuBackend.price}
							onChangeText={menuBackend.setPrice}
							keyboardType="numeric"
							onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
						/>
						<TouchableOpacity
							style={styles.addButton}
							onPress={handleAddSize}>
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
								styles.nextButton,
								{
									opacity:
										menuBackend.sizes.length > 0 && !hasEmptyFields ? 1 : 0.5,
								},
							]}
							onPress={handleNext}
							disabled={menuBackend.sizes.length === 0 || hasEmptyFields}>
							<Text style={styles.buttonText}>Next</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
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
	subtitle: { color: '#fff', marginBottom: 8, fontSize: 16 },
	sizeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
	sizeInput: {
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
	nextButton: {
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

export default AddMenuItemSizesScreen
