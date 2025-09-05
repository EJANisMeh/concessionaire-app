import { useState } from 'react'
import { db } from '../firebase'
import { doc, getDocs, collection, query, where } from 'firebase/firestore'

interface UserProfile {
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

export function useAuth() {
	const [user, setUser] = useState<UserProfile | null>(null)
	const [error, setError] = useState<string | null>(null)

	// Login using Firestore users collection. Returns true if successful, false if failed.
	const login = async (
		email: string,
		password: string
	): Promise<LoginResult> => {
		debugBool && console.log('Debug: Attempting login for:', email)
		setUser(null)
		setError(null)
		try {
			// Query users collection for matching email
			debugBool && console.log('Querying users collection for email:', email)
			const usersRef = collection(db, 'users')
			const q = query(usersRef, where('email', '==', email))
			const querySnapshot = await getDocs(q)
			if (querySnapshot.empty) {
				debugBool && console.log('Debug: User not found')
				setError('User not found')
				return { success: false, error: 'User not found' }
			}

			// Assume only one user per email
			debugBool && console.log('Debug: User found, verifying password')
			const userDoc = querySnapshot.docs[0]
			const userData = userDoc.data() as UserProfile

			// passwordHash should be hashed and compared securely in a real app
			// Here we just do a plain text comparison for simplicity
			if (userData.passwordHash !== password) {
				debugBool && console.log('Debug: Incorrect password')
				setError('Incorrect password')
				return { success: false, error: 'Incorrect password' }
			}

			// Successful login
			debugBool && console.log('Debug: Login successful')
			setUser(userData)
			return { success: true, user: userData }
		} catch (err: any) {
			// On error, clear user and set error message
			setUser(null)
			setError(err.message)
			return { success: false, error: err.message }
		}
	}

	// Logout user by clearing local state.
	const logout = async () => {
		setUser(null)
	}

	// Return all auth state and functions for use in your app
	return { user, login, logout, error }
}
