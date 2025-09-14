const functions = require('firebase-functions')
const cloudinary = require('cloudinary').v2

// Configure cloudinary from environment variables set with `firebase functions:config:set`.
const cfg = functions.config().cloudinary || {}
cloudinary.config({
	cloud_name: cfg.name,
	api_key: cfg.key,
	api_secret: cfg.secret,
})

exports.deleteCloudinaryAsset = functions.https.onCall(
	async (data, context) => {
		// Optional: restrict to authenticated users
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'unauthenticated',
				'Authentication required'
			)
		}

		const publicId = data && data.publicId
		if (!publicId) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'publicId is required'
			)
		}

		try {
			const result = await cloudinary.uploader.destroy(publicId)
			return { success: true, result }
		} catch (err) {
			console.error('Cloudinary destroy error', err)
			throw new functions.https.HttpsError('internal', 'Failed to delete asset')
		}
	}
)
