import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
//import OrdersScreen from '../screens/OrdersScreen'
//import ConcessionScreen from '../screens/ConcessionScreen'
//import ScanQRScreen from '../screens/ScanQRScreen'
//import GraphsScreen from '../screens/GraphsScreen'
import ProfileScreen from '../screens/ProfileScreen'

const Tab = createBottomTabNavigator()

export default function MainTabNavigator() {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarActiveTintColor: '#B71C1C', // Red for active
				tabBarInactiveTintColor: '#fff',
				tabBarStyle: { backgroundColor: '#222' },
				tabBarIcon: ({ color, size }) => {
					switch (route.name) {
						case 'Orders':
							return (
								<Ionicons
									name="menu"
									size={size}
									color={color}
								/>
							)
						case 'Concession':
							return (
								<MaterialCommunityIcons
									name="cash"
									size={size}
									color={color}
								/>
							)
						case 'ScanQR':
							return (
								<MaterialCommunityIcons
									name="qrcode-scan"
									size={size}
									color={color}
								/>
							)
						case 'Graphs':
							return (
								<MaterialCommunityIcons
									name="chart-bar"
									size={size}
									color={color}
								/>
							)
						case 'Profile':
							return (
								<Ionicons
									name="person"
									size={size}
									color={color}
								/>
							)
						default:
							return null
					}
				},
			})}>
			{/* <Tab.Screen
				name="Orders"
				component={OrdersScreen}
			/> */}
			{/* <Tab.Screen
				name="Concession"
				component={ConcessionScreen}
			/> */}
			{/* <Tab.Screen
				name="ScanQR"
				component={ScanQRScreen}
			/> */}
			{/* <Tab.Screen
				name="Graphs"
				component={GraphsScreen}
			/> */}
			<Tab.Screen
				name="Profile"
				component={ProfileScreen}
			/>
		</Tab.Navigator>
	)
}
