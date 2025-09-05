import React, { createContext, useState, useContext, ReactNode } from 'react'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, signOut, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

interface AppContextType {
	user: User | null
	userData: any
	loading: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const useAppContext = () => {
	const context = useContext(AppContext)
	if (!context) throw new Error('useAppContext must be used within AppProvider')
	return context
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [userData, setUserData] = useState<any>(null)
	const [loading, setLoading] = useState(false)

	const login = async (email: string, password: string) => {
		setLoading(true)
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			)
			setUser(userCredential.user)
			const userId = userCredential.user.uid
			const userDocRef = doc(db, 'users', userId)
			const userDocSnap = await getDoc(userDocRef)
			if (userDocSnap.exists()) {
				setUserData(userDocSnap.data())
			} else {
				setUserData(null)
			}
		} finally {
			setLoading(false)
		}
	}

	const logout = async () => {
		await signOut(auth)
		setUser(null)
		setUserData(null)
	}

	return (
		<AppContext.Provider value={{ user, userData, loading, login, logout }}>
			{children}
		</AppContext.Provider>
	)
}
