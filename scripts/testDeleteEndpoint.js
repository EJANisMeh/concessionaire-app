// Zero-dependency test script to POST { publicId } to DELETE_ASSET_ENDPOINT
// using the built-in `http` / `https` modules. Reads from env vars or CLI args.

const { URL } = require('url')
const http = require('http')
const https = require('https')

function usageAndExit() {
	console.error('Usage: node scripts/testDeleteEndpoint.js <publicId>')
	console.error('Or set PUBLIC_ID env var')
	process.exit(2)
}

function exitWithError(msg, code = 1) {
	console.error(msg)
	process.exit(code)
}

async function main() {
	const argv = process.argv.slice(2)
	const publicId = argv[0] || process.env.PUBLIC_ID
	const endpoint = process.env.DELETE_ASSET_ENDPOINT
	const apiKey = process.env.DELETE_ASSET_API_KEY

	if (!publicId) return usageAndExit()
	if (!endpoint || !apiKey)
		return exitWithError(
			'Missing DELETE_ASSET_ENDPOINT or DELETE_ASSET_API_KEY in env'
		)

	let url
	try {
		url = new URL(endpoint)
	} catch (e) {
		return exitWithError('Invalid DELETE_ASSET_ENDPOINT URL: ' + endpoint)
	}

	const payload = JSON.stringify({ publicId })
	const opts = {
		method: 'POST',
		hostname: url.hostname,
		port: url.port || (url.protocol === 'https:' ? 443 : 80),
		path: url.pathname + (url.search || ''),
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(payload),
			'x-delete-api-key': apiKey,
		},
	}

	const client = url.protocol === 'https:' ? https : http

	const req = client.request(opts, (res) => {
		let body = ''
		res.setEncoding('utf8')
		res.on('data', (chunk) => (body += chunk))
		res.on('end', () => {
			console.log('STATUS', res.statusCode)
			console.log('BODY', body)
			process.exit(res.statusCode >= 200 && res.statusCode < 300 ? 0 : 1)
		})
	})

	req.on('error', (err) => {
		console.error('Request failed', err)
		process.exit(1)
	})

	req.write(payload)
	req.end()
}

main()
