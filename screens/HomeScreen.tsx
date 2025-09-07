import React from 'react'
import { View, Text, StyleSheet, Button, Alert } from 'react-native'
import { useAuthBackend } from '../context/GlobalContext'

const HomeScreen: React.FC = ({ navigation }: any) => {
	const { logout } = useAuthBackend()

	const handleLogout = async () => {
		Alert.alert('Logout', 'Are you sure you want to logout?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Logout',
				style: 'destructive',
				onPress: async () => await logout(),
			},
		])
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome to SCaFOMA-UB!</Text>
			<Text style={styles.subtitle}>This is your test landing screen.</Text>
			<Button
				title="Logout"
				onPress={handleLogout}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f5f6fa',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 16,
		color: '#2d3436',
	},
	subtitle: {
		fontSize: 18,
		marginBottom: 32,
		color: '#636e72',
	},
})

export default HomeScreen
