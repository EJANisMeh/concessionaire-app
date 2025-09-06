// ...existing code...
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { db } from '../firebase'
import {
	doc,
	getDocs,
	collection,
	query,
	where,
	updateDoc,
	DocumentData,
	QuerySnapshot,
} from 'firebase/firestore'

export interface UserProfile {
	email: string
	passwordHash: string
	newLogin: boolean
	emailVerified: boolean
}

interface LoginResult {
	success: boolean
	error?: string
	user?: UserProfile
}

const debugBool: boolean = true
const hardCodedEmailCode: string = '123456'

interface AuthContextType {
	user: UserProfile | null
	login: (email: string, password: string) => Promise<LoginResult>
	logout: () => Promise<void>
	verifyEmailCode: (
		inputCode: string,
		email: string
	) => Promise<{ success: boolean; error?: string }>
	changePassword: (
		email: string,
		newPassword: string
	) => Promise<{ success: boolean; error?: string }>
	isLoggedIn: boolean
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
}

export const Auth = (): AuthContextType => {
	const [user, setUser] = useState<UserProfile | null>(null)
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

	const querySnapshotViaEmail = async (
		email: string
	): Promise<QuerySnapshot<DocumentData>> => {
		debugBool && console.log('Querying users collection for email:', email)
		const usersRef = collection(db, 'users')
		const q = query(usersRef, where('email', '==', email))
		const querySnapshot = await getDocs(q)
		return querySnapshot
	}

	const getUserDocViaEmail = async (
		email: string
	): Promise<{ userDoc?: DocumentData; error?: string }> => {
		try {
			const querySnapshot = await querySnapshotViaEmail(email)
			if (querySnapshot.empty) {
				return { error: 'User not found' }
			}
			const userDoc = querySnapshot.docs[0]
			return { userDoc: userDoc }
		} catch (err: any) {
			debugBool && console.log('Error querying user:', err.message)
			return { error: err.message || 'Unknown error' }
		}
	}
	const login = async (
		email: string,
		password: string
	): Promise<LoginResult> => {
		debugBool && console.log('Login Debug: Attempting login for:', email)
		setUser(null)

		try {
			// Query users collection for matching email
			debugBool && console.log('Debug: Getting user data with email:', email)
			const userDocResult = await getUserDocViaEmail(email)

			if (userDocResult.error || !userDocResult.userDoc) {
				debugBool &&
					console.log('Login Debug: Login error:', userDocResult.error)
				return { success: false, error: userDocResult.error }
			}

			const userData = userDocResult.userDoc.data() as UserProfile
			debugBool &&
				console.log('Login Debug: User found. Now verifying password')

			// passwordHash should be hashed and compared securely in a real app
			// Here we just do a plain text comparison for simplicity
			if (userData.passwordHash !== password) {
				return { success: false, error: 'Incorrect password' }
			}

			debugBool && console.log('Login Debug: Password verified')

			// Successful login
			setUser(userData)

			if (!userData.emailVerified) {
				debugBool &&
					console.log(
						'Login Debug: Login successful but email not yet verified'
					)
			}
			if (userData.newLogin) {
				debugBool &&
					console.log(
						'Login Debug: First login detected, password change required'
					)
			}

			return { success: true, user: userData }
		} catch (err: any) {
			// On error, clear user and set error message
			debugBool && console.log('Login Debug: Login error:', err.message)
			setUser(null)
			return { success: false, error: 'Login failed' }
		}
	}

	// Logout user by clearing local state.
	const logout = async () => {
		setIsLoggedIn(false)
		setUser(null)
	}

	// Verify email code (hardcoded for prototype)
	const verifyEmailCode = async (
		inputCode: string,
		email: string
	): Promise<{ success: boolean; error?: string }> => {
		// Check code against hardcoded value
		if (inputCode !== hardCodedEmailCode) {
			return { success: false, error: 'Invalid code' }
		}

		debugBool && console.log('Debug: Email code verified')

		// Update user's emailVerified to true in Firestore
		try {
			debugBool && console.log('Debug: Getting user document for email:', email)
			const userDocResult = await getUserDocViaEmail(email)
			if (userDocResult.error || !userDocResult.userDoc) {
				return { success: false, error: 'User not found' }
			}
			const userDocRef = userDocResult.userDoc.ref
			await updateDoc(userDocRef, { emailVerified: true })

			// Refresh local user state from updated document
			debugBool && console.log('Debug: Fetching updated user document')
			const newUserDoc = (await getUserDocViaEmail(email)).userDoc
			if (!newUserDoc) {
				return { success: false, error: 'User somehow not found' }
			}
			const newUserData = newUserDoc.data() as UserProfile

			debugBool && console.log('Debug: User record updated successfully')
			setUser(newUserData)
			return { success: true }
		} catch (err: any) {
			debugBool && console.log('Debug: Email verification error:', err.message)
			return { success: false, error: 'Email verification failed' }
		}
	}

	// Change password and set newLogin to false
	const changePassword = async (
		email: string,
		newPassword: string
	): Promise<{ success: boolean; error?: string }> => {
		try {
			const userDocResult = await getUserDocViaEmail(email)
			if (userDocResult.error || !userDocResult.userDoc) {
				return { success: false, error: 'User not found' }
			}
			const userDocRef = userDocResult.userDoc.ref
			await updateDoc(userDocRef, {
				passwordHash: newPassword,
				newLogin: false,
			})

			// Refresh local user state
			const updatedUserDoc = (await getUserDocViaEmail(email)).userDoc
			if (!updatedUserDoc) {
				return { success: false, error: 'User not found after update' }
			}
			const updatedUserData = updatedUserDoc.data() as UserProfile
			setUser(updatedUserData)

			return { success: true }
		} catch (err: any) {
			return { success: false, error: err.message || 'Password change failed' }
		}
	}

	// Provide all auth state and functions via context
	return {
		user,
		login,
		logout,
		verifyEmailCode,
		changePassword,
		isLoggedIn,
		setIsLoggedIn,
	}
}
