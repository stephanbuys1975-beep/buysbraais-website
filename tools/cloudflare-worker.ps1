$ErrorActionPreference = "Stop"

$secureToken = Read-Host "Cloudflare API token (input is hidden)" -AsSecureString
$tokenPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
try {
  $env:CLOUDFLARE_API_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($tokenPtr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenPtr)
}

npm install
npm run validate:pages
npx wrangler deploy --dry-run

$confirmation = Read-Host "Type DEPLOY PREVIEW to update https://crimson-thunder-b255.stephanbuys1975.workers.dev"
if ($confirmation -cne "DEPLOY PREVIEW") {
  Write-Host "Deployment cancelled. No Cloudflare changes were made."
  exit 0
}

npx wrangler deploy
Remove-Item Env:CLOUDFLARE_API_TOKEN -ErrorAction SilentlyContinue
