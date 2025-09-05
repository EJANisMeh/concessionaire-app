import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface GlobalContextType {
	auth: ReturnType<typeof useAuth>
	// menu?: ReturnType<typeof useMenuContext>;
	// orders?: ReturnType<typeof useOrdersContext>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

export const useGlobalContext = () => {
	const context = useContext(GlobalContext)
	if (!context)
		throw new Error('useGlobalContext must be used within GlobalProvider')
	return context
}

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
	const auth = useAuth()
	// In the future, add: const menu = useMenuContext(); const orders = useOrdersContext(); etc.

	const contexts = {
		auth,
		// In the future, add: menu, orders, etc.
	}
	return (
		<GlobalContext.Provider value={contexts}>{children}</GlobalContext.Provider>
	)
}
