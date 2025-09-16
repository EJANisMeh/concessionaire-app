Param()

Write-Host "This script will prompt for Cloudinary credentials and deploy the callable function to project 'scafoma-ub'."

$cloudName = Read-Host "Cloudinary cloud name"
$apiKey = Read-Host "Cloudinary API key"
$apiSecret = Read-Host "Cloudinary API secret (will be hidden)" -AsSecureString
$apiSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiSecret))

Write-Host "Setting functions config..."
firebase functions:config:set "cloudinary.name=$cloudName" "cloudinary.key=$apiKey" "cloudinary.secret=$apiSecretPlain" --project scafoma-ub

Write-Host "Installing dependencies..."
cd $(Split-Path -Parent $MyInvocation.MyCommand.Definition)
npm install

Write-Host "Deploying function deleteCloudinaryAsset..."
firebase deploy --only functions:deleteCloudinaryAsset --project scafoma-ub

Write-Host "Done."
