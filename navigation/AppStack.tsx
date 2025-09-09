import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AuthStackScreen from './AuthStackScreen'
import MainTabNavigator from './MainTabNavigator'
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
				<>
					<Stack.Screen
						name="MainTabs"
						component={MainTabNavigator}
					/>
					<Stack.Screen
						name="AddMenuItem"
						component={require('../screens/Menu/AddMenuItemScreen').default}
						options={{ presentation: 'modal' }}
					/>
					<Stack.Screen
						name="AddMenuItemSizes"
						component={require('../screens/Menu/AddMenuItemSizesScreen').default}
						options={{ presentation: 'modal' }}
					/>
				</>
			)}
		</Stack.Navigator>
	)
}
