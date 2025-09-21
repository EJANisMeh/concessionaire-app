import * as MediaLibrary from 'expo-media-library'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import { Alert } from 'react-native'

/**
 * Request only image/video media permissions (no audio). Guards against Expo Go
 * and manifest mismatches and offers to open app settings on failure.
 */
export async function ensureImageVideoPermissions(): Promise<boolean> {
	// If running in Expo Go, warn and avoid requesting native permissions
	if (Constants.appOwnership === 'expo') {
		Alert.alert(
			'Dev client required',
			'This action requires native media permissions. Expo Go may not include them. Build a dev client to test on device.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Docs',
					onPress: () =>
						Linking.openURL(
							'https://docs.expo.dev/development/getting-started/'
						),
				},
			]
		)
		return false
	}

	try {
		// Request only media library permissions (API may map to scoped permissions on Android 13+)
		// The TypeScript signature expects an optional boolean for "writeOnly" on some SDK versions.
		// Passing `false` requests read (and write where supported) access which covers image/video usage.
		const { status } = await MediaLibrary.requestPermissionsAsync(false as any)
		if (status === 'granted') return true

		if (status === 'denied') {
			Alert.alert(
				'Permission required',
				'We need permission to access your photos and media. Open app settings to enable it.',
				[
					{ text: 'Cancel', style: 'cancel' },
					{ text: 'Open settings', onPress: () => Linking.openSettings() },
				]
			)
			return false
		}

		return false
	} catch (err: any) {
		const message = err?.message || String(err)
		const isManifestError =
			/not declared in AndroidManifest|You have requested the .* permission, but it is not declared/i.test(
				message
			)
		if (isManifestError) {
			Alert.alert(
				'Native permission missing',
				'The installed app does not declare the required native permission. Build a dev client with the updated manifest, or open app settings.',
				[
					{ text: 'Cancel', style: 'cancel' },
					{ text: 'Open settings', onPress: () => Linking.openSettings() },
				]
			)
			return false
		}

		Alert.alert(
			'Permission error',
			`Failed to request media permissions: ${message}`,
			[{ text: 'OK' }]
		)
		return false
	}
}
