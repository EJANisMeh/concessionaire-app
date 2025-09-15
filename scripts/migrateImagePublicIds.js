/*
  migrateImagePublicIds.js

  Purpose:
  - Iterate Firestore documents under collection path "menu/{menuId}/items"
  - For each item document that has an `imageUrl` but no `imagePublicId`, parse
    the Cloudinary public_id using the same regex used in the app and write it
    back to the document.

  Usage:
  - Requires Node.js 14+ and `firebase-admin` installed in the project or globally.
  - Auth: set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON that has
    Firestore write permissions, or run from an environment where the admin SDK
    can authenticate (e.g. GCP Cloud Shell / deployed environment).

  Examples:
    # Dry run (no writes)
    node scripts/migrateImagePublicIds.js --dry

    # Execute (will write changes)
    node scripts/migrateImagePublicIds.js

  Safety:
  - The script supports `--dry` (default) and `--yes` to actually write.
  - It prints progress and a short summary.
*/

const admin = require('firebase-admin')
const path = require('path')

// Basic argv parsing
const argv = process.argv.slice(2)
const DRY_RUN =
	argv.includes('--dry') || argv.includes('-d') || argv.length === 0
const FORCE = argv.includes('--yes') || argv.includes('-y')

if (DRY_RUN && !FORCE) {
	console.log(
		'Running in dry-run mode (no writes). Pass --yes to apply changes.'
	)
}

// Initialize admin SDK (will use GOOGLE_APPLICATION_CREDENTIALS if present)
try {
	admin.initializeApp()
} catch (e) {
	// ignore if already initialized
}

const db = admin.firestore()

// Regex borrowed from app's MenuBackend.extractCloudinaryPublicId
const extractCloudinaryPublicId = (url) => {
	if (!url) return undefined
	try {
		const m = url.match(
			/\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+?)(?:\.[A-Za-z0-9]+)?(?:$|\?)/
		)
		if (!m || !m[1]) return undefined
		return decodeURIComponent(m[1])
	} catch (e) {
		return undefined
	}
}

async function migrate() {
	console.log(
		'Starting migration: populate imagePublicId for menu item documents'
	)

	const menuColl = db.collection('menu')
	const menuSnapshot = await menuColl.get()
	console.log('Found', menuSnapshot.size, 'menu documents')

	let totalScanned = 0
	let totalToUpdate = 0
	let totalUpdated = 0

	for (const menuDoc of menuSnapshot.docs) {
		const menuId = menuDoc.id
		const itemsRef = menuColl.doc(menuId).collection('items')
		const itemsSnap = await itemsRef.get()
		if (itemsSnap.empty) continue

		for (const itemDoc of itemsSnap.docs) {
			totalScanned++
			const data = itemDoc.data()
			const imageUrl = data && data.imageUrl
			const imagePublicId = data && data.imagePublicId
			if (imageUrl && typeof imageUrl === 'string' && !imagePublicId) {
				const publicId = extractCloudinaryPublicId(imageUrl)
				if (publicId) {
					totalToUpdate++
					console.log(`Would update ${menuId}/${itemDoc.id}: ${publicId}`)
					if (!DRY_RUN) {
						try {
							await itemDoc.ref.update({ imagePublicId: publicId })
							totalUpdated++
						} catch (e) {
							console.error('Failed to update', menuId, itemDoc.id, e)
						}
					}
				} else {
					// No public id could be parsed
					console.log(
						`No publicId extracted for ${menuId}/${itemDoc.id} (imageUrl: ${imageUrl})`
					)
				}
			}
		}
	}

	console.log('Migration summary:')
	console.log('  total scanned items:', totalScanned)
	console.log(
		'  items missing imagePublicId that can be filled:',
		totalToUpdate
	)
	console.log('  items updated (writes):', DRY_RUN ? 0 : totalUpdated)

	if (DRY_RUN && totalToUpdate > 0) {
		console.log(
			'\nDry-run complete. To apply changes run: node scripts/migrateImagePublicIds.js --yes'
		)
	}
}

migrate()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Migration failed:', err)
		process.exit(1)
	})
