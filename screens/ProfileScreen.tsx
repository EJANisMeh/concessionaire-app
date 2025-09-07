import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { useAuthBackend } from '../context/GlobalContext'

const ProfileScreen = () => {
	const { user } = useAuthBackend()
	const [name, setName] = useState(user?.name || '')
	const [email, setEmail] = useState(user?.email || '')
	const [password, setPassword] = useState('')
	const [contact, setContact] = useState(user?.contact || '')
	const [loading, setLoading] = useState(false)

	const handleSave = async () => {
		setLoading(true)
		// TODO: Implement update logic (call backend/context to update Firestore)
		Alert.alert('Profile Updated', 'Your changes have been saved.')
		setLoading(false)
	}

	return (
		<View style={{ padding: 20 }}>
			<Text style={{ fontSize: 24, marginBottom: 24 }}>Edit Profile</Text>
			<TextInput
				placeholder="Name"
				value={name}
				onChangeText={setName}
				editable={!loading}
				style={{ marginBottom: 16, borderWidth: 1, padding: 8 }}
			/>
			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				editable={!loading}
				style={{ marginBottom: 16, borderWidth: 1, padding: 8 }}
			/>
			<TextInput
				placeholder="New Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				editable={!loading}
				style={{ marginBottom: 16, borderWidth: 1, padding: 8 }}
			/>
			<TextInput
				placeholder="Contact Details"
				value={contact}
				onChangeText={setContact}
				editable={!loading}
				style={{ marginBottom: 16, borderWidth: 1, padding: 8 }}
			/>
			<Button
				title={loading ? 'Saving...' : 'Save'}
				onPress={handleSave}
				disabled={loading}
			/>
		</View>
	)
}

export default ProfileScreen
