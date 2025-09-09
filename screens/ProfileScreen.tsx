import React, { useState } from 'react'
import {
	View,
	Text,
	TextInput,
	Button,
	Alert,
	TouchableOpacity,
	Image,
} from 'react-native'
import { useAuthBackend } from '../context/GlobalContext'

const PROFILE_PLACEHOLDER =
	'https://cdn-icons-png.flaticon.com/512/149/149071.png' // or use a local asset

const ProfileScreen = () => {
	const { user, logout } = useAuthBackend()
	const [firstName, setFirstName] = useState(user?.firstName || '')
	const [lastName, setLastName] = useState(user?.lastName || '')
	const [contact, setContact] = useState(user?.contact || '')
	const [profileImage, setProfileImage] = useState(
		user?.profileImage || PROFILE_PLACEHOLDER
	)
	const [loading, setLoading] = useState(false)

	const handleEditImage = async () => {
		// TODO: Implement image picker logic
		Alert.alert('Edit Profile Image', 'Image picker logic goes here.')
	}

	const handleSave = async () => {
		setLoading(true)
		// TODO: Implement update logic (call backend/context to update Firestore)
		Alert.alert('Profile Updated', 'Your changes have been saved.')
		setLoading(false)
	}

	return (
		<View style={{ padding: 20, alignItems: 'center' }}>
			<Text style={{ fontSize: 24, marginBottom: 24 }}>Edit Profile</Text>
			<TouchableOpacity
				onPress={handleEditImage}
				disabled={loading}>
				<Image
					source={{ uri: profileImage }}
					style={{
						width: 100,
						height: 100,
						borderRadius: 50,
						marginBottom: 16,
						backgroundColor: '#eee',
					}}
				/>
				<Text
					style={{ color: '#B71C1C', textAlign: 'center', marginBottom: 16 }}>
					Edit Image
				</Text>
			</TouchableOpacity>
			<TextInput
				placeholder="First Name"
				value={firstName}
				onChangeText={setFirstName}
				editable={!loading}
				style={{ marginBottom: 16, borderWidth: 1, padding: 8, width: '100%' }}
			/>
			<TextInput
				placeholder="Last Name"
				value={lastName}
				onChangeText={setLastName}
				editable={!loading}
				style={{ marginBottom: 16, borderWidth: 1, padding: 8, width: '100%' }}
			/>
			<TextInput
				placeholder="Contact Details"
				value={contact}
				onChangeText={setContact}
				editable={!loading}
				style={{ marginBottom: 16, borderWidth: 1, padding: 8, width: '100%' }}
			/>
			<Button
				title={loading ? 'Saving...' : 'Save'}
				onPress={handleSave}
				disabled={loading}
			/>
			<Button
				title="Logout"
				onPress={logout}
				color="#B71C1C"
				disabled={loading}
			/>
		</View>
	)
}

export default ProfileScreen
