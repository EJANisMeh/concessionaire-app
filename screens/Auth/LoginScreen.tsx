import React, { useState } from 'react'
import {
	View,
	Text,
	TextInput,
	Button,
	Alert,
	TouchableOpacity,
} from 'react-native'
import { useAuthBackend } from '../../context/GlobalContext'

const LoginScreen: React.FC = ({ navigation }: any) => {
	const { login, setIsLoggedIn } = useAuthBackend()
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)

	const handleLogin = async () => {
		setLoading(true)
		const result = await login(email, password)
		console.log('LoginScreen result.user:', result.user)

		if (!result.success || !result.user) {
			Alert.alert('Login Failed', result.error)
			setLoading(false)
			return
		}

		if (!result.user.emailVerified) {
			Alert.alert('Proceeding to email verification.')
			navigation.navigate('EmailVerification')
			setLoading(false)
			return
		}

		if (result.user.newLogin) {
			Alert.alert('Proceeding to password change.')
			navigation.navigate('ChangePassword')
			setLoading(false)
			return
		}

		if (!result.user.emailVerified || result.user.newLogin) {
			Alert.alert('Something went wrong in the validations')
			setLoading(false)
			return
		}

		// if user email is verified and not a new login then log in successfully
		setIsLoggedIn(true) // Set logged in state
		Alert.alert('Login successful', 'Proceeding to home screen.')

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
				editable={!loading}
			/>
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				editable={!loading}
			/>
			<Button
				title={loading ? 'Logging in...' : 'Login'}
				onPress={handleLogin}
				disabled={loading}
			/>
			<TouchableOpacity
				onPress={() => navigation.navigate('ForgotPassword')}
				disabled={loading}
				style={{ marginTop: 16 }}>
				<Text style={{ color: 'blue', textAlign: 'center' }}>
					Forgot Password?
				</Text>
			</TouchableOpacity>
		</View>
	)
}

export default LoginScreen
