import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'

const ForgotPasswordScreen = ({ navigation }: any) => {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSendReset = async () => {
		setLoading(true)
		// TODO: Implement password reset logic (e.g., send reset email or code)
		Alert.alert(
			'Reset link sent',
			`If an account exists for ${email}, you will receive instructions.`
		)
		setLoading(false)
		navigation.goBack()
	}

	return (
		<View>
			<Text>Forgot Password</Text>
			<TextInput
				placeholder="Enter your email"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				editable={!loading}
			/>
			<Button
				title={loading ? 'Sending...' : 'Send Reset Link'}
				onPress={handleSendReset}
				disabled={loading || !email}
			/>
		</View>
	)
}

export default ForgotPasswordScreen
