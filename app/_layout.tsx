import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { GlobalProvider } from '../context/GlobalContext'
import AppStack from '../navigation/AppStack'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Layout() {
	return (
		<SafeAreaProvider>
			{/* only apply top safe area so bottom tab bar isn't padded */}
			<SafeAreaView
				style={{ flex: 1 }}>
				<GlobalProvider>
					<StatusBar style="auto" />
					<AppStack />
				</GlobalProvider>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}
