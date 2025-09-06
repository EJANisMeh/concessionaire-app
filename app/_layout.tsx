import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { GlobalProvider } from '../context/GlobalContext'
import AppStack from '../navigation/AppStack'

export default function RootLayout() {
	return (
		<GlobalProvider>
			<StatusBar style="auto" />
			<AppStack />
		</GlobalProvider>
	)
}
