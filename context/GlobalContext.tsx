import React, {
	createContext,
	useContext,
	ReactNode,
	useState,
	useEffect,
} from 'react'
import { Auth } from '../backend/AuthBackend'
import { Menu } from '../backend/MenuBackend'
// ...existing code...
import { useMediaLibraryPermission } from '../hooks/useMediaLibraryPermission'
// ...existing code...
const GlobalContext = createContext<any>(null)

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
	// Instantiate all modules here
	const Contexts = {
		Auth: Auth(),
		menu: Menu(),
		// profile: useProfile(),
		// orders: useOrders(),
	}

	return (
		<GlobalContext.Provider value={Contexts}>{children}</GlobalContext.Provider>
	)
}

// Custom hooks for each module
export const useAuthBackend = () => useContext(GlobalContext).Auth
export const useMenuBackend = () => useContext(GlobalContext).menu
// export const useProfileBackend = () => useContext(GlobalContext).profile
// export const useOrdersBackend = () => useContext(GlobalContext).orders
