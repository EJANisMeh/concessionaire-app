import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import AuthStackScreen from './AuthStackScreen'
import MainTabNavigator from './MainTabNavigator'
import { useAuthBackend } from '../context/GlobalContext'

export type AppStackParamList = {
	AuthStack: undefined
	MainTabs: { screen?: string } | undefined
	AddMenuItem: undefined
	AddMenuItemSizes: undefined
	AddMenuItemVariationsScreen: { sizes: string[] }
	AddMenuItemAddonScreen: undefined
}

const Stack = createNativeStackNavigator<AppStackParamList>()

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
						component={
							require('../screens/Menu/AddMenuItemSizesScreen').default
						}
						options={{ presentation: 'modal' }}
					/>
					<Stack.Screen
						name="AddMenuItemVariationsScreen"
						component={
							require('../screens/Menu/AddMenuItemVariationsScreen').default
						}
						options={{ presentation: 'modal' }}
					/>
					<Stack.Screen
						name="AddMenuItemAddonScreen"
						component={
							require('../screens/Menu/AddMenuItemAddonScreen').default
						}
						options={{ presentation: 'modal' }}
					/>
				</>
			)}
		</Stack.Navigator>
	)
}
