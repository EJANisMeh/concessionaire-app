import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { useAuthBackend } from '../../context/GlobalContext'

const ChangePasswordScreen = ({ navigation, route }: any) => {
	const { user, changePassword } = useAuthBackend()
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)

	const handleChangePassword = async () => {
		setLoading(true)
		if (!newPassword) {
			Alert.alert('Error:', 'Password cannot be empty')
			setLoading(false)
			return
		}
		if (newPassword !== confirmPassword) {
			Alert.alert('Error:', 'Passwords do not match')
			setLoading(false)
			return
		}

		if (!user?.email) {
			Alert.alert('Error:', 'No user email found')
			setLoading(false)
			return
		}
		const result = await changePassword(user.email, newPassword)
		if (result.success) {
			Alert.alert('Success', 'Password changed successfully!')
			navigation.navigate('Login')
		} else {
			Alert.alert('Error:', result.error || 'Password change failed')
		}
		setLoading(false)
	}

	return (
		<View>
			<Text>Change Password</Text>
			<TextInput
				placeholder="New Password"
				value={newPassword}
				onChangeText={setNewPassword}
				secureTextEntry
				editable={!loading}
			/>
			<TextInput
				placeholder="Confirm Password"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				editable={!loading}
			/>
			<Button
				title="Change Password"
				onPress={handleChangePassword}
				disabled={loading}
			/>
		</View>
	)
}

export default ChangePasswordScreen
