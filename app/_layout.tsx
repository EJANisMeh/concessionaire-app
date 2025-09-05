import React from 'react'
import { StatusBar } from 'expo-status-bar'
import LoginScreen from '../screens/LoginScreen'
import { GlobalProvider } from '../context/GlobalContext'

export default function RootLayout() {
	return (
		<GlobalProvider>
			<LoginScreen />
			<StatusBar style="auto" />
		</GlobalProvider>
	)
}
