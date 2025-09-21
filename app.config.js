import 'dotenv/config'

// app.config.js reads runtime/build-time env vars and exposes them via
// `expo.extra` so the app can access them via `Constants.expoConfig.extra`.
// For local dev you can set environment variables before running `expo start`.
// For production/EAS builds, set secrets via EAS or your CI and they will be
// available at build time.

export default ({ config }) => {
	return {
		...config,
		expo: {
			// Preserve any existing expo fields and provide a default owner so EAS can link the project
			...(config.expo || {}),
			owner:
				(config.expo && config.expo.owner) ||
				process.env.EXPO_OWNER ||
				'imejan',
			plugins: [
				...(config.expo?.plugins || []),
				'expo-router',
				[
					'expo-media-library',
					{
						// requestWritePermission on Android and iOS where applicable
						// This is a plugin-level configuration to ensure the manifest
						// includes any declarations the module requires.
						write: true,
						// leave scoped permissions handling to android.permissions above
					},
				],
			],
			android: {
				...(config.expo?.android || {}),
				package: 'com.example.concessionaireapp',
				// Permissions required for expo-media-library (includes Android 13 scoped media permissions)
				permissions: [
					'READ_EXTERNAL_STORAGE',
					'WRITE_EXTERNAL_STORAGE',
					'READ_MEDIA_IMAGES',
					'READ_MEDIA_VIDEO',
				],
			},
			scheme: (config.expo && config.expo.scheme) || 'concessionaireapp',
			ios: {
				...(config.expo?.ios || {}),
				bundleIdentifier: 'com.example.concessionaireapp',
			},
			extra: {
				// Preserve any existing extra properties from the base config
				...(config.expo?.extra || {}),
				// Vercel endpoint that will perform server-side Cloudinary deletes.
				DELETE_ASSET_ENDPOINT: process.env.DELETE_ASSET_ENDPOINT || '',
				// Secret for authorizing requests to the HTTP fallback endpoint.
				DELETE_ASSET_API_KEY: process.env.DELETE_ASSET_API_KEY || '',
				// Ensure eas.projectId is available in extra as some tooling expects it here
				eas: {
					projectId:
						process.env.EAS_PROJECT_ID ||
						'081da849-1d13-44ed-ac0b-b278fcc2710f',
				},
			},
			eas: {
				projectId: '081da849-1d13-44ed-ac0b-b278fcc2710f',
			},
		},
	}
}
