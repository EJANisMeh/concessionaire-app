import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { GlobalProvider } from '../context/GlobalContext'
import { NavigationContainer } from '@react-navigation/native'
import AppStack from '../navigation/AppStack'

export default function RootLayout() {
	return (
		<GlobalProvider>
			<StatusBar style="auto" />
			<NavigationContainer>
				<AppStack />
			</NavigationContainer>
		</GlobalProvider>
	)
}
