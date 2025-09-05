import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'

const ChangePasswordScreen = ({ navigation }: any) => {
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const handleChangePassword = async () => {
		if (newPassword !== confirmPassword) {
			Alert.alert('Error', 'Passwords do not match')
			return
		}
		// TODO: Implement password update logic here
		Alert.alert('Success', 'Password changed successfully!')
		// navigation.navigate('Login');
	}

	return (
		<View>
			<Text>Change Password</Text>
			<TextInput
				placeholder="New Password"
				value={newPassword}
				onChangeText={setNewPassword}
				secureTextEntry
			/>
			<TextInput
				placeholder="Confirm Password"
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
			/>
			<Button
				title="Change Password"
				onPress={handleChangePassword}
			/>
		</View>
	)
}

export default ChangePasswordScreen
