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
			...(config.expo || {}),
			plugins: [...(config.expo?.plugins || []), 'expo-router'],
			android: {
				...(config.expo?.android || {}),
				package: 'com.example.concessionaireapp',
			},
			ios: {
				...(config.expo?.ios || {}),
				bundleIdentifier: 'com.example.concessionaireapp',
			},
			extra: {
				// Vercel endpoint that will perform server-side Cloudinary deletes.
				DELETE_ASSET_ENDPOINT: process.env.DELETE_ASSET_ENDPOINT || '',
				// Secret for authorizing requests to the HTTP fallback endpoint.
				DELETE_ASSET_API_KEY: process.env.DELETE_ASSET_API_KEY || '',
			},
			eas: {
				projectId: '081da849-1d13-44ed-ac0b-b278fcc2710f',
			},
		},
	}
}
