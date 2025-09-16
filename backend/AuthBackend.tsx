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

// Interfaces
// User data structure in Firestore
interface UserProfile {
	email: string
	passwordHash: string
	newLogin: boolean
	emailVerified: boolean
	concessionId?: string
	role?: string
}

// Result structure for login attempts
interface LoginResult {
	success: boolean
	error?: string
	user?: UserProfile
}

// Auth functions and state to be returned types
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
	) => Promise<{ success: boolean; error?: string; user?: UserProfile }>
	isLoggedIn: boolean
	setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
	resetPasswordRequest: (
		email: string
	) => Promise<{ success: boolean; error?: string; user?: UserProfile }>
}

// Constants
const debugBool: boolean = false
const hardCodedEmailCode: string = '123456'

// main
export const Auth = (): AuthContextType => {
	const [user, setUser] = useState<UserProfile | null>(null)
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

	// Query users collection for a given email
	const querySnapshotViaEmail = async (
		email: string
	): Promise<QuerySnapshot<DocumentData>> => {
		debugBool && console.log('Querying users collection for email:', email)
		const usersRef = collection(db, 'users')
		const q = query(usersRef, where('email', '==', email))
		const querySnapshot = await getDocs(q)
		return querySnapshot
	}

	// Get user document for a given email
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

	// Login function
	// hardcoded password comparison for prototype only
	const login: AuthContextType['login'] = async (email, password) => {
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

			// Normalize concessionId (users may store a DocumentReference or a path)
			const normalizeConcessionId = (val: any): string | undefined => {
				if (!val && val !== 0) return undefined
				// Firestore DocumentReference (has id)
				if (typeof val === 'object' && (val as any).id) return (val as any).id
				// String path like '/concessions/<id>'
				if (typeof val === 'string' && val.includes('/')) {
					const parts = val.split('/')
					return (parts[parts.length - 1] as string) || undefined
				}
				// Fallback: assume it's already an id string
				return String(val)
			}

			const rawConcessionVal =
				(userDocResult.userDoc.data() as any).concessionId ||
				userData.concessionId
			const normalizedConcessionId = normalizeConcessionId(rawConcessionVal)
			const normalizedUser: UserProfile = {
				...userData,
				concessionId: normalizedConcessionId,
				role: (userData as any).role,
			}
			// Successful login
			setUser(normalizedUser)

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

			return { success: true, user: normalizedUser }

			// On error, clear user and set error message
		} catch (err: any) {
			debugBool && console.log('Login Debug: Login error:', err.message)
			setUser(null)
			return { success: false, error: 'Login failed' }
		}
	}

	// Logout user by clearing local state
	const logout: AuthContextType['logout'] = async () => {
		setIsLoggedIn(false)
		setUser(null)
	}

	// Verify email code (hardcoded for prototype)
	const verifyEmailCode: AuthContextType['verifyEmailCode'] = async (
		inputCode,
		email
	) => {
		// Check code against hardcoded value
		if (inputCode !== hardCodedEmailCode) {
			return { success: false, error: 'Invalid code' }
		}

		debugBool && console.log('Verify Email Debug: Email code verified')

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
			debugBool &&
				console.log('Verify Email Debug: Fetching updated user document')
			const newUserDoc = (await getUserDocViaEmail(email)).userDoc
			if (!newUserDoc) {
				return { success: false, error: 'User somehow not found' }
			}
			const rawNewUserData = newUserDoc.data() as any
			const normalizeConcessionId = (val: any): string => {
				if (!val) return ''
				if (typeof val === 'object' && val.id) return val.id
				if (typeof val === 'string' && val.includes('/'))
					return val.split('/').pop() || ''
				return String(val)
			}
			const newUserData: UserProfile = {
				...(rawNewUserData as UserProfile),
				concessionId: normalizeConcessionId(rawNewUserData.concessionId),
				role: rawNewUserData.role,
			}

			debugBool &&
				console.log('Verify Email Debug: User record updated successfully')
			setUser(newUserData)
			return { success: true, user: newUserData }
		} catch (err: any) {
			debugBool &&
				console.log(
					'Verify Email Debug: Email verification error:',
					err.message
				)
			return { success: false, error: 'Email verification failed' }
		}
	}

	// Change password and set newLogin to false
	const changePassword: AuthContextType['changePassword'] = async (
		email,
		newPassword
	) => {
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
			const rawUpdated = updatedUserDoc.data() as any
			const normalizeConcessionId = (val: any): string => {
				if (!val) return ''
				if (typeof val === 'object' && val.id) return val.id
				if (typeof val === 'string' && val.includes('/'))
					return val.split('/').pop() || ''
				return String(val)
			}
			const updatedUserData: UserProfile = {
				...(rawUpdated as UserProfile),
				concessionId: normalizeConcessionId(rawUpdated.concessionId),
				role: rawUpdated.role,
			}
			setUser(updatedUserData)

			return { success: true, user: updatedUserData }
		} catch (err: any) {
			return { success: false, error: err.message || 'Password change failed' }
		}
	}

	// Request password reset
	const resetPasswordRequest: AuthContextType['resetPasswordRequest'] = async (
		email
	) => {
		// Simulate sending a password reset email
		debugBool &&
			console.log(
				'Reset Password Debug: Sending password reset email to:',
				email
			)
		try {
			const userDocResult = await getUserDocViaEmail(email)
			if (userDocResult.error || !userDocResult.userDoc) {
				return { success: false, error: 'User not found' }
			}

			const raw = userDocResult.userDoc.data() as any
			const normalizeConcessionId = (val: any): string => {
				if (!val) return ''
				if (typeof val === 'object' && val.id) return val.id
				if (typeof val === 'string' && val.includes('/'))
					return val.split('/').pop() || ''
				return String(val)
			}
			const userData: UserProfile = {
				...(raw as UserProfile),
				concessionId: normalizeConcessionId(raw.concessionId),
				role: raw.role,
			}
			setUser(userData)

			// If email not verified, return error and user data
			if (!userData.emailVerified) {
				return {
					success: false,
					error: 'Email found but not yet verified',
					user: userData,
				}
			}

			// In a real app, send an email with a reset link or code here
			debugBool &&
				console.log(
					'Reset Password Debug: Password reset email sent to:',
					email
				)

			return { success: true }
		} catch (err: any) {
			debugBool &&
				console.log('Reset Password Debug: Password reset error:', err.message)
			return { success: false, error: 'Password reset failed' }
		}
	}

	// Provide all auth state and functions via context
	return {
		user,
		login,
		logout,
		verifyEmailCode,
		changePassword,
		resetPasswordRequest,
		isLoggedIn,
		setIsLoggedIn,
	}
}
