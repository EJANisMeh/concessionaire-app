import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { useAuthBackend } from '../../context/GlobalContext'

const debug = true

const EmailVerificationScreen: React.FC = ({ navigation }: any) => {
	const { user, verifyEmailCode } = useAuthBackend()
	const [code, setCode] = useState('')
	const [loading, setLoading] = useState(false)

	const handleVerify = async () => {
		setLoading(true)
		const result = await verifyEmailCode(code, user!.email)
		if (!result.success) {
			Alert.alert(
				'Invalid Code',
				result.error || 'Please enter the correct 6-digit code.'
			)
			setLoading(false)
			return
		}
		debug &&
			console.log(
				'EmailVerificationScreen: Email verified for user:',
				result.user
			)
		Alert.alert('Success', 'Email verified!')
		if (result.user!.newLogin) {
			debug &&
				console.log(
					'EmailVerificationScreen: Navigating to ChangePasswordScreen for new login.'
				)
			navigation.navigate('ChangePassword')
		} else {
			debug &&
				console.log(
					'EmailVerificationScreen: Navigating to LoginScreen after verification.'
				)
			navigation.navigate('Login')
		}
		setLoading(false)
	}

	return (
		<View style={{ padding: 20 }}>
			<Text style={{ fontSize: 20, marginBottom: 20 }}>Email Verification</Text>
			<Text>Enter the 6-digit code sent to your email:</Text>
			<TextInput
				style={{
					borderWidth: 1,
					borderColor: '#ccc',
					padding: 10,
					marginVertical: 20,
					fontSize: 18,
					textAlign: 'center',
					letterSpacing: 10,
				}}
				keyboardType="number-pad"
				maxLength={6}
				value={code}
				onChangeText={setCode}
				placeholder="123456"
				editable={!loading}
			/>
			<Button
				title={loading ? 'Verifying...' : 'Verify'}
				onPress={handleVerify}
				disabled={loading}
			/>
		</View>
	)
}

export default EmailVerificationScreen
