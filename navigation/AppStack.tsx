import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AuthStackScreen from './AuthStackScreen'
import HomeScreen from '../screens/HomeScreen'
import { useAuthBackend } from '../context/GlobalContext'

const Stack = createNativeStackNavigator()

export default function AppStack() {
	const { isLoggedIn }: { isLoggedIn: boolean } = useAuthBackend()

	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			{!isLoggedIn ? (
				<Stack.Screen
					name="AuthStack"
					component={AuthStackScreen}
				/>
			) : (
				<Stack.Screen
					name="Home"
					component={HomeScreen}
				/>
			)}
		</Stack.Navigator>
	)
}
