param([int]$Port = 5180, [switch]$LAN)
$ErrorActionPreference = 'Stop'
$appDirectory = Join-Path $PSScriptRoot 'utility-lab'
Push-Location -LiteralPath $appDirectory
try {
  if (!(Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 22.13 or newer, then run this launcher again.' }
  if (!(Test-Path -LiteralPath 'node_modules')) { & npm.cmd ci; if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' } }
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'The local build failed. The app was not started.' }
  $serverArguments = @('scripts/serve-local.mjs', '--port', "$Port")
  if ($LAN) { $serverArguments += '--lan' }
  & node @serverArguments
} finally { Pop-Location }
