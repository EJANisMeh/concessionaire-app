import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { useGlobalContext } from '../../context/GlobalContext'

const LoginScreen: React.FC = ({ navigation }: any) => {
	const { auth } = useGlobalContext()
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)

	const handleLogin = async () => {
		setLoading(true)
		const result = await auth.login(email, password)

		if (!result.success || !result.user) {
			Alert.alert('Login Failed', result.error || 'No user data returned')
			setLoading(false)
			return
		}

		if (result.user.newLogin || !result.user.emailVerified) {
			Alert.alert('Proceeding to email verification.')
			navigation.navigate('EmailVerificationScreen')
		} else {
			Alert.alert('Regular Login', 'Proceeding to home screen.')
			navigation.navigate('Home')
		}
		setLoading(false)
	}

	return (
		<View>
			<Text>Concessionaire Login</Text>
			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
			/>
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>
			<Button
				title={loading ? 'Logging in...' : 'Login'}
				onPress={handleLogin}
				disabled={loading}
			/>
		</View>
	)
}

export default LoginScreen
