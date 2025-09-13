import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { GlobalProvider } from '../context/GlobalContext'
import AppStack from '../navigation/AppStack'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function Layout() {
	return (
		<SafeAreaProvider>
			<GlobalProvider>
				<StatusBar style="auto" />
				<AppStack />
			</GlobalProvider>
		</SafeAreaProvider>
	)
}
