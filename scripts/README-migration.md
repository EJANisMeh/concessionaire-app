Migration script: populate `imagePublicId` for existing menu items

Purpose

- Many existing documents have `imageUrl` but lack the deterministic `imagePublicId`.
- This script parses `imageUrl` using the same regex in the app and writes `imagePublicId` back into documents when possible.

Preconditions

- Node.js 14+ installed.
- `firebase-admin` available. Install locally in the project:

  npm install firebase-admin

- Authentication: set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON with Firestore write permissions, or run from an environment with admin credentials.

Dry run

- The script runs in dry-run mode by default (or when you pass `--dry`) and prints what it would update.

Run (dry-run):

node scripts/migrateImagePublicIds.js --dry

Apply changes (writes):

node scripts/migrateImagePublicIds.js --yes

Notes

- If an `imageUrl` cannot be parsed to a public id, the script will print a message and skip it.
- Review the dry-run output carefully before applying writes.
