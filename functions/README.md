Firebase Cloud Function `deleteCloudinaryAsset` (callable)

This folder contains a Cloud Functions project that implements a callable function
`deleteCloudinaryAsset` which deletes a Cloudinary asset by `publicId`.

Prerequisites

- `firebase-tools` CLI installed globally (`npm i -g firebase-tools`)
- You are logged in: `firebase login`
- Your local Firebase project is set to `scafoma-ub` (or pass `--project scafoma-ub` to deploy)

Set Cloudinary credentials for the function (do not commit secrets to source control):

PowerShell example:

```powershell
# set Cloudinary credentials in functions runtime config
firebase functions:config:set cloudinary.name="<cloud_name>" cloudinary.key="<api_key>" cloudinary.secret="<api_secret>" --project scafoma-ub

# optional: view config
firebase functions:config:get --project scafoma-ub | Out-String | Write-Output
```

Deploy the callable function:

```powershell
# from the functions/ directory
cd functions
npm install
# deploy only the callable function
firebase deploy --only functions:deleteCloudinaryAsset --project scafoma-ub
```

Test locally with emulator (optional):

```powershell
cd functions
npm install
# start emulator
firebase emulators:start --only functions
# then call via the emulator playground or the firebase sdk pointing to local emulator
```

Notes:

- The function requires users to be authenticated (it rejects unauthenticated calls). When calling from your app, ensure Firebase auth is signed in.
- The function uses `functions.config().cloudinary.*` for credentials; set them with `firebase functions:config:set` as shown above.

If you want, I can also produce a small `scripts/deployFunction.ps1` that runs the config:set and deploy commands, but I avoided adding scripts that contain secrets.
