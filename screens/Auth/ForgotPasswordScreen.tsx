import { useAuthBackend } from '@/context/GlobalContext'
import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'

const ForgotPasswordScreen = ({ navigation }: any) => {
	const { resetPasswordRequest } = useAuthBackend()
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSendReset = async () => {
		setLoading(true)
		// TODO: Implement password reset logic (e.g., send reset email or code)
		const result = await resetPasswordRequest(email)
		if (!result.success) {
			Alert.alert('Error:', result.error)
			console.log(result.user)
			if (result.user && !result.user.emailVerified) {
				navigation.navigate('EmailVerification')
				setLoading(false)
				return
			}
			setLoading(false)
			return
		}

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
