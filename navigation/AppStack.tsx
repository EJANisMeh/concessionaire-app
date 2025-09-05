import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AuthStackScreen from './AuthStackScreen'
// import HomeScreen from '../screens/HomeScreen'; // Add your main app screens here
import { useGlobalContext } from '../context/GlobalContext'

const Stack = createNativeStackNavigator()

export default function AppStack() {
	const { auth } = useGlobalContext()
	// Replace with your own logic for checking login
	const isLoggedIn = !!auth.user && auth.user.emailVerified

	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			{isLoggedIn ? (
				<>
					{/* Add your main app screens here */}
					{/* <Stack.Screen name="Home" component={HomeScreen} /> */}
				</>
			) : (
				<>
					<Stack.Screen
						name="AuthStack"
						component={AuthStackScreen}
					/>
				</>
			)}
		</Stack.Navigator>
	)
}
