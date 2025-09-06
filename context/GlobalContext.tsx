import React, { createContext, useContext, ReactNode } from 'react'
import { Auth } from '../backend/AuthBackend'
// import { useMenu } from './MenuContext' // For future modules

const GlobalContext = createContext<any>(null)

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
	// Instantiate all modules here
	const Contexts = {
		Auth: Auth(),
		// menu: useMenu(), // Add more as needed
		// profile: useProfile(),
		// orders: useOrders(),
	}

	return (
		<GlobalContext.Provider value={Contexts}>{children}</GlobalContext.Provider>
	)
}

// Custom hooks for each module
export const useAuthBackend = () => useContext(GlobalContext).Auth
// export const useMenuBackend = () => useContext(GlobalContext).menu
// export const useProfileBackend = () => useContext(GlobalContext).profile
// export const useOrdersBackend = () => useContext(GlobalContext).orders
