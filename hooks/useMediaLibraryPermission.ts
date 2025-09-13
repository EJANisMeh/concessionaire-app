import { useState, useEffect } from 'react'
import * as MediaLibrary from 'expo-media-library'
import { Platform } from 'react-native'

export const useMediaLibraryPermission = () => {
	const [hasPermission, setHasPermission] = useState<boolean | null>(null)

	useEffect(() => {
		;(async () => {
			// Request full media library permission
			const { status } = await MediaLibrary.requestPermissionsAsync()
			setHasPermission(status === 'granted')
			if (status !== 'granted') {
				alert(
					'This app needs permission to save and access data related to your orders, menu items, and other app features. Your personal photos and files will not be accessed.'
				)
			}
		})()
	}, [])

	const checkAndRequestPermission = async (): Promise<boolean> => {
		let { status } = await MediaLibrary.getPermissionsAsync()
		if (status === 'granted') {
			setHasPermission(true)
			return true
		}
		// Request full permission
		const { status: newStatus } = await MediaLibrary.requestPermissionsAsync()
		setHasPermission(newStatus === 'granted')
		if (newStatus !== 'granted') {
			alert(
				'Permission is required to save and access app data (orders, menu items, etc). Please enable it in your device settings.'
			)
			return false
		}
		// On Android, check for legacy WRITE_EXTERNAL_STORAGE if needed
		if (Platform.OS === 'android') {
			// Expo handles this internally, but if you still get WRITE errors, prompt user
			// Optionally, you can use PermissionsAndroid for legacy support
		}
		return true
	}

	return { hasPermission, checkAndRequestPermission }
}
