// Simple Vercel / serverless endpoint to delete Cloudinary assets
// Deploy this file to Vercel (create a new project from this repo or copy file)
// and set the environment variable DELETE_ASSET_API_KEY to a long secret

const cloudinary = require('cloudinary').v2

// Expect environment variables: CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET, DELETE_ASSET_API_KEY
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
})

module.exports = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

	const apiKey = req.headers['x-delete-api-key'] || req.query.key
	if (!apiKey || apiKey !== process.env.DELETE_ASSET_API_KEY) {
		return res.status(401).json({ success: false, error: 'Unauthorized' })
	}

	const { publicId } = req.body || {}
	if (!publicId)
		return res.status(400).json({ success: false, error: 'publicId required' })

	try {
		const result = await cloudinary.uploader.destroy(publicId)
		return res.status(200).json({ success: true, result })
	} catch (err) {
		console.error('Cloudinary destroy error', err)
		return res
			.status(500)
			.json({ success: false, error: 'Failed to delete asset' })
	}
}
