import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { useGlobalContext } from '../context/GlobalContext'

const LoginScreen = ({ navigation }: any) => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const { auth } = useGlobalContext()

	const handleLogin = async () => {
		try {
			await auth.login(email, password)
			if (auth.userData?.isNew) {
				Alert.alert('First Login', 'Please change your password.')
				// navigation.navigate('ChangePassword');
			} else if (auth.user) {
				Alert.alert('Login Successful', 'Welcome!')
				// navigation.navigate('Home');
			} else {
				Alert.alert('Error', 'User data not found.')
			}
		} catch (error: any) {
			Alert.alert('Login Failed', error.message)
		}
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
				title={auth.loading ? 'Logging in...' : 'Login'}
				onPress={handleLogin}
				disabled={auth.loading}
			/>
		</View>
	)
}

export default LoginScreen
