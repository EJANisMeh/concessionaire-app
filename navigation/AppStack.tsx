import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
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
	EditMenuItem: { menuItemId: string }
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
						component={require('../screens/Menu/Add/AddMenuItemScreen').default}
						options={{ presentation: 'modal' }}
					/>
					<Stack.Screen
						name="AddMenuItemSizes"
						component={
							require('../screens/Menu/Add/AddMenuItemSizesScreen').default
						}
						options={{ presentation: 'modal' }}
					/>
					<Stack.Screen
						name="AddMenuItemVariationsScreen"
						component={
							require('../screens/Menu/Add/AddMenuItemVariationsScreen').default
						}
						options={{ presentation: 'modal' }}
					/>
					<Stack.Screen
						name="AddMenuItemAddonScreen"
						component={
							require('../screens/Menu/Add/AddMenuItemAddonScreen').default
						}
						options={{ presentation: 'modal' }}
					/>
					<Stack.Screen
						name="EditMenuItem"
						component={
							require('../screens/Menu/Edit/EditMenuItemScreen').default
						}
						options={{ presentation: 'modal' }}
					/>
				</>
			)}
		</Stack.Navigator>
	)
}
