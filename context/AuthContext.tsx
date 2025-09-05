import { useState } from 'react'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

interface UserProfile {
	isNew: boolean
	name: string
	// Add other fields as needed
}

export function useAuth() {
	const [user, setUser] = useState<User | null>(null)
	const [userData, setUserData] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(false)

	/**
	 * Login using Firebase Authentication and fetch user profile from Firestore.
	 * @param email User's email
	 * @param password User's password
	 */
	const login = async (email: string, password: string) => {
		setLoading(true)
		try {
			// Authenticate user with Firebase Auth
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			)
			setUser(userCredential.user)

			// Fetch user profile from Firestore using UID
			const userId = userCredential.user.uid
			const userDocRef = doc(db, 'users', userId)
			const userDocSnap = await getDoc(userDocRef)
			if (userDocSnap.exists()) {
				setUserData(userDocSnap.data() as UserProfile)
			} else {
				setUserData(null) // No profile found
			}
		} finally {
			setLoading(false)
		}
	}

	/**
	 * Logout user from Firebase Authentication and clear local state.
	 */
	const logout = async () => {
		await signOut(auth)
		setUser(null)
		setUserData(null)
	}

	// Return all auth state and functions for use in your app
	return { user, userData, loading, login, logout }
}
