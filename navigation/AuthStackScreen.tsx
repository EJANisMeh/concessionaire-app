import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../screens/Auth/LoginScreen'
import EmailVerificationScreen from '../screens/Auth/EmailVerificationScreen'
// import ChangePasswordScreen from '../screens/Auth/ChangePasswordScreen'; // Uncomment if needed

const AuthStack = createNativeStackNavigator()

export default function AuthStackScreen() {
	return (
		<AuthStack.Navigator screenOptions={{ headerShown: false }}>
			<AuthStack.Screen
				name="Login"
				component={LoginScreen}
			/>
			<AuthStack.Screen
				name="EmailVerification"
				component={EmailVerificationScreen}
			/>
			{/* <AuthStack.Screen name="ChangePassword" component={ChangePasswordScreen} /> */}
		</AuthStack.Navigator>
	)
}
