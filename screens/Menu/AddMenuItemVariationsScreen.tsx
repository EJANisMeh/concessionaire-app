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
	Alert,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AppStackParamList } from '../../navigation/AppStack'
import { useMenuBackend } from '../../context/GlobalContext'
import type { VariationInput } from '../../backend/MenuBackend'

type Props = NativeStackScreenProps<
	AppStackParamList,
	'AddMenuItemVariationsScreen'
>

const AddMenuItemVariationsScreen: React.FC<Props> = ({
	navigation,
	route,
}) => {
	const { sizes } = route.params
	const menuBackend = useMenuBackend()
	const variationName = menuBackend.variationName
	const setVariationName = menuBackend.setVariationName
	const variations: VariationInput[] = menuBackend.variations
	const setVariations = menuBackend.setVariations

	// Move variation up
	const handleMoveUp = (idx: number) => {
		if (idx === 0) return
		const newVariations = [...variations]
		const temp = newVariations[idx - 1]
		newVariations[idx - 1] = newVariations[idx]
		newVariations[idx] = temp
		setVariations(newVariations)
	}

	// Move variation down
	const handleMoveDown = (idx: number) => {
		if (idx === variations.length - 1) return
		const newVariations = [...variations]
		const temp = newVariations[idx + 1]
		newVariations[idx + 1] = newVariations[idx]
		newVariations[idx] = temp
		setVariations(newVariations)
	}
	// Add a new variation
	const handleAddVariation = () => {
		if (!variationName.trim()) return
		const newVariation: VariationInput = {
			name: variationName.trim(),
			prices: sizes.reduce(
				(acc: { [size: string]: string }, size: string) => ({
					...acc,
					[size]: '',
				}),
				{}
			),
		}
		setVariations([...variations, newVariation])
		setVariationName('')
	}

	// Remove a variation
	const handleRemoveVariation = (idx: number) => {
		// Show confirmation before removing
		Alert.alert(
			'Remove Variation?',
			'Are you sure you want to remove this variation?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Remove',
					style: 'destructive',
					onPress: () => {
						setVariations(variations.filter((_, i) => i !== idx))
					},
				},
			]
		)
	}

	// Edit price for a variation/size
	const handleEditPrice = (
		variationIdx: number,
		size: string,
		price: string
	) => {
		setVariations(
			variations.map((variation, idx) =>
				idx === variationIdx
					? { ...variation, prices: { ...variation.prices, [size]: price } }
					: variation
			)
		)
	}

	// Validation: if any variation exists, all prices must be filled
	const hasEmptyPrices =
		variations.length > 0 &&
		variations.some((variation) =>
			sizes.some(
				(size: string) =>
					!variation.prices[size] || variation.prices[size].trim() === ''
			)
		)

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Add Variations for</Text>
			<View style={{ flex: 1 }}>
				<FlatList
					data={variations}
					keyExtractor={(_, idx) => idx.toString()}
					keyboardShouldPersistTaps="handled"
					renderItem={({ item, index }) => (
						<View style={styles.variationCard}>
							<View style={styles.variationHeader}>
								<Text style={styles.variationName}>{item.name}</Text>
								<TouchableOpacity onPress={() => handleRemoveVariation(index)}>
									<Text style={styles.removeVariationText}>⦻</Text>
								</TouchableOpacity>
								<View style={styles.moveButtonRow}>
									<TouchableOpacity
										style={[styles.moveButton, index === 0 && { opacity: 0.4 }]}
										onPress={() => handleMoveUp(index)}
										disabled={index === 0}>
										<Text style={styles.moveButtonText}>↑</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[
											styles.moveButton,
											index === variations.length - 1 && { opacity: 0.4 },
										]}
										onPress={() => handleMoveDown(index)}
										disabled={index === variations.length - 1}>
										<Text style={styles.moveButtonText}>↓</Text>
									</TouchableOpacity>
								</View>
							</View>
							{sizes.map((size) => (
								<View
									style={styles.sizeRow}
									key={size}>
									<Text style={styles.sizeLabel}>{size}:</Text>
									<TextInput
										style={styles.priceInput}
										placeholder="₱ Price"
										value={item.prices[size]}
										onChangeText={(text) => handleEditPrice(index, size, text)}
										keyboardType="numeric"
									/>
								</View>
							))}
						</View>
					)}
					ListEmptyComponent={<View style={{ height: 16 }} />}
					style={{ flex: 1 }}
				/>
			</View>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
				<View style={styles.addVariationRow}>
					<TextInput
						style={styles.variationInput}
						placeholder="Variation Name"
						value={variationName}
						onChangeText={setVariationName}
					/>
					<TouchableOpacity
						style={styles.addButton}
						onPress={handleAddVariation}>
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
						style={[styles.nextButton, { opacity: !hasEmptyPrices ? 1 : 0.5 }]}
						onPress={() => {
							if (!hasEmptyPrices) {
								navigation.navigate('AddMenuItemAddonScreen')
							}
						}}
						disabled={hasEmptyPrices}>
						<Text style={styles.buttonText}>Next</Text>
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
	variationCard: {
		backgroundColor: '#333',
		borderRadius: 10,
		padding: 12,
		marginBottom: 12,
	},
	variationHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	variationName: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	removeVariationText: {
		color: '#d32f2f',
		fontSize: 18,
		fontWeight: 'bold',
	},
	sizeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	sizeLabel: {
		color: '#fff',
		marginRight: 8,
		width: 70,
	},
	priceInput: {
		flex: 1,
		backgroundColor: '#444',
		color: '#fff',
		borderRadius: 8,
		padding: 10,
	},
	addVariationRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
	},
	variationInput: {
		flex: 1,
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
	moveButtonRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 8,
		gap: 4,
	},
	moveButton: {
		backgroundColor: '#444',
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginHorizontal: 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	moveButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
})

export default AddMenuItemVariationsScreen
