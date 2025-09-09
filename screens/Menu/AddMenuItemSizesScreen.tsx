import { useState } from 'react'
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'

interface SizePrice {
	size: string
	price: string
}

const AddMenuItemSizesScreen = () => {
	const [sizes, setSizes] = useState<SizePrice[]>([])
	const [size, setSize] = useState('')
	const [price, setPrice] = useState('')
	const navigation = useNavigation()

	const handleAddSize = () => {
		if (!size || !price) return
		setSizes([...sizes, { size, price }])
		setSize('')
		setPrice('')
	}

	const handleRemoveSize = (idx: number) => {
		setSizes(sizes.filter((_, i) => i !== idx))
	}

	return (
		<View style={styles.container}>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps="handled"
				style={{ flex: 1 }}>
				<Text style={styles.title}>Add Sizes and Prices for</Text>
				<Text style={styles.subtitle}>Sizes and Prices:</Text>
				<FlatList
					data={sizes}
					keyExtractor={(_, idx) => idx.toString()}
					renderItem={({ item, index }) => (
						<View style={styles.sizeRow}>
							<TextInput
								style={styles.sizeInput}
								value={item.size}
								editable={false}
							/>
							<TextInput
								style={styles.priceInput}
								value={item.price}
								editable={false}
							/>
							<TouchableOpacity
								style={styles.removeButton}
								onPress={() => handleRemoveSize(index)}>
								<Text style={styles.removeButtonText}>⦻</Text>
							</TouchableOpacity>
						</View>
					)}
					ListEmptyComponent={<View style={{ height: 16 }} />}
					style={{ marginBottom: 16 }}
				/>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
					<View style={styles.sizeRow}>
						<TextInput
							style={styles.sizeInput}
							placeholder="Size"
							value={size}
							onChangeText={setSize}
						/>
						<TextInput
							style={styles.priceInput}
							placeholder="₱ Price"
							value={price}
							onChangeText={setPrice}
							keyboardType="numeric"
						/>
						<TouchableOpacity
							style={styles.addButton}
							onPress={handleAddSize}>
							<Text style={styles.addButtonText}>＋</Text>
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			</ScrollView>
			<View style={styles.bottomButtonsAbsolute}>
				<TouchableOpacity
					style={styles.nextButton}
					onPress={() => {
						/* TODO: Next step */
					}}>
					<Text style={styles.buttonText}>Next</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}>
					<Text style={styles.buttonText}>Back</Text>
				</TouchableOpacity>
			</View>
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
	removeButtonText: { color: '#fff', fontSize: 18 },
	bottomButtonsAbsolute: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 16,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
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
