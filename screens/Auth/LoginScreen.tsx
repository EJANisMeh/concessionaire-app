import { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { useGlobalContext } from '../../context/GlobalContext'

const LoginScreen = ({ navigation }: any) => {
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

		if (result.user.newLogin) {
			Alert.alert('First Time Login', 'Please change your password.')
			// navigation.navigate('ChangePassword');
		} else {
			Alert.alert('Regular Login', 'Proceeding to home screen.')
			// navigation.navigate('Home');
		}
		// navigation.navigate('Home');
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
import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'
import { useGlobalContext } from '../../context/GlobalContext'

const LoginScreen = ({ navigation }: any) => {
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

		if (result.user.newLogin) {
			Alert.alert('First Time Login', 'Please change your password.')
			// navigation.navigate('ChangePassword');
		} else {
			Alert.alert('Regular Login', 'Proceeding to home screen.')
			// navigation.navigate('Home');
		}
		// navigation.navigate('Home');
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
