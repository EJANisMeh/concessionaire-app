import { useState, useEffect } from 'react'
import { Platform } from 'react-native'
import { ensureImageVideoPermissions } from '../utils/safeMediaPermissions'

export const useMediaLibraryPermission = () => {
	const [hasPermission, setHasPermission] = useState<boolean | null>(null)

	useEffect(() => {
		;(async () => {
			const ok = await ensureImageVideoPermissions()
			setHasPermission(ok)
			if (!ok) {
				alert(
					'This app needs permission to save and access data related to your orders, menu items, and other app features. Your personal photos and files will not be accessed.'
				)
			}
		})()
	}, [])

	const checkAndRequestPermission = async (): Promise<boolean> => {
		// We'll rely on the safe helper which already respects Expo Go and manifest issues
		const ok = await ensureImageVideoPermissions()
		setHasPermission(ok)
		if (!ok) {
			alert(
				'Permission is required to save and access app data (orders, menu items, etc). Please enable it in your device settings.'
			)
			return false
		}
		return true
	}

	return { hasPermission, checkAndRequestPermission }
}
