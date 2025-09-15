concessionaire app

## Configuration: DELETE_ASSET_ENDPOINT and DELETE_ASSET_API_KEY

This project supports a server-side HTTP fallback endpoint that will
delete Cloudinary assets when you remove or replace images. The app
reads two values at runtime from `expo.extra` (provided by `app.config.js`):

- `DELETE_ASSET_ENDPOINT` - URL to the HTTP endpoint that deletes a Cloudinary asset. Example:
  `https://concessionaireapp.vercel.app/api/deleteCloudinaryAsset`
- `DELETE_ASSET_API_KEY` - a long random secret used in the `x-delete-api-key` header to authenticate requests.

## Local development

Option A — quick local env (PowerShell):

```powershell
$env:DELETE_ASSET_ENDPOINT='https://concessionaireapp.vercel.app/api/deleteCloudinaryAsset'
$env:DELETE_ASSET_API_KEY='your-long-secret-here'
expo start
```

Option B — set the values in `app.config.js` or your shell environment. `app.config.js` is already included in the repository and reads from `process.env`.

## EAS / Production builds (recommended)

Use EAS secrets or your CI to provide `DELETE_ASSET_ENDPOINT` and `DELETE_ASSET_API_KEY` at build time so they are included in `expo.extra` for the app.

## Testing the Vercel endpoint

Use PowerShell `Invoke-RestMethod` or `curl` to test the endpoint directly. Replace `your_real_public_id` and `your-secret` with real values.

PowerShell (quick test using `Invoke-RestMethod`):

```powershell
$uri = 'https://concessionaireapp.vercel.app/api/deleteCloudinaryAsset'
$headers = @{ 'x-delete-api-key' = 'your-secret'; 'Content-Type' = 'application/json' }
$body = @{ publicId = 'your_real_public_id' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body -ErrorAction Stop
```

PowerShell (test using the included Node script):

```powershell
# set env vars for this session, then run the test script with the publicId
$env:DELETE_ASSET_ENDPOINT='https://concessionaireapp.vercel.app/api/deleteCloudinaryAsset'; $env:DELETE_ASSET_API_KEY='your-secret'
node ./scripts/testDeleteEndpoint.js your_real_public_id
```

curl:

```bash
curl -X POST 'https://concessionaireapp.vercel.app/api/deleteCloudinaryAsset' \
	-H 'Content-Type: application/json' \
	-H 'x-delete-api-key: your-secret' \
	-d '{"publicId":"your_real_public_id"}'
```

## Notes

- The HTTP fallback secret is included in your client build if you provide it via `expo.extra` — this is less secure than a server-only Firebase callable. Keep the secret rotated and treat it as a fallback option.
- If you later upgrade the Firebase project to Blaze, prefer deploying the `deleteCloudinaryAsset` callable and removing the HTTP fallback secret from client builds.

To add:

- password hash encryption,
- email verification,
- password change validation,

## Test script

A small Node script `scripts/testDeleteEndpoint.js` is provided to test the
HTTP fallback endpoint. Install `node-fetch` (if not present) and run:

PowerShell example:

```powershell
$env:DELETE_ASSET_ENDPOINT='https://concessionaireapp.vercel.app/api/deleteCloudinaryAsset'
$env:DELETE_ASSET_API_KEY='your-long-secret-here'
node ./scripts/testDeleteEndpoint.js your_real_public_id
```

Or run with env vars inline (bash):

```bash
DELETE_ASSET_ENDPOINT='https://concessionaireapp.vercel.app/api/deleteCloudinaryAsset' \
DELETE_ASSET_API_KEY='your-long-secret' \
node ./scripts/testDeleteEndpoint.js your_real_public_id
```
