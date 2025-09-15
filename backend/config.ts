import Constants from 'expo-constants'

// Reads configuration from (in order): Expo config.extra, legacy manifest.extra,
// or process.env. This allows you to set values via `app.config.js` / `eas.json`
// (expo) or at build time using environment variables.
const getExtra = () => {
	// expo-managed apps expose extras in different properties depending on SDK
	// and runtime (expo dev, standalone). Check the known locations.
	const expoConfig =
		(Constants as any).expoConfig || (Constants as any).manifest || {}
	return (expoConfig && expoConfig.extra) || (process.env as any) || {}
}

const EXTRA = getExtra()

export const DELETE_ASSET_ENDPOINT: string = ((EXTRA &&
	EXTRA.DELETE_ASSET_ENDPOINT) ||
	(process.env && (process.env as any).DELETE_ASSET_ENDPOINT) ||
	'') as string

export const DELETE_ASSET_API_KEY: string = ((EXTRA &&
	EXTRA.DELETE_ASSET_API_KEY) ||
	(process.env && (process.env as any).DELETE_ASSET_API_KEY) ||
	'') as string

// Export any other backend-related config here in future.

// If STRICT_DELETE_ASSET_CONFIG=true, throw at module load time when the
// DELETE_ASSET_ENDPOINT or DELETE_ASSET_API_KEY are missing. Otherwise we
// only warn at runtime so local dev doesn't break unexpectedly.
const strict =
	((EXTRA && EXTRA.STRICT_DELETE_ASSET_CONFIG) ||
		(process.env && (process.env as any).STRICT_DELETE_ASSET_CONFIG) ||
		'') === 'true'
if (!DELETE_ASSET_ENDPOINT || !DELETE_ASSET_API_KEY) {
	const msg =
		'DELETE_ASSET_ENDPOINT or DELETE_ASSET_API_KEY not set. HTTP fallback for Cloudinary deletes will be unavailable.'
	if (strict) {
		throw new Error(
			msg +
				' Set STRICT_DELETE_ASSET_CONFIG=false to avoid throwing at startup.'
		)
	} else {
		// eslint-disable-next-line no-console
		console.warn('[config] ' + msg)
	}
}
