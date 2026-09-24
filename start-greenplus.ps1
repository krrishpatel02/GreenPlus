param(
  [switch]$UseDockerMongo,
  [switch]$WarmModels
)

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$backendPort = 5000
$frontendPort = 5173
$mongoPort = 27017

function Resolve-Python {
  $candidates = @(
    (Join-Path $root ".venv1\Scripts\python.exe"),
    (Join-Path $root ".venv\Scripts\python.exe")
  )

  foreach ($candidate in $candidates) {
    if (Test-Path $candidate) { return $candidate }
  }

  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) { return $python.Source }
  throw "Python 3.11+ was not found. Create .venv1 or install Python and add it to PATH."
}

function Require-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name was not found. $hint"
  }
}

function Test-Port($port) {
  return [bool](Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)
}

Require-Command "node" "Install Node.js 18+ and restart PowerShell."
Require-Command "npm" "Install npm with Node.js and restart PowerShell."
$python = Resolve-Python

if (-not (Test-Path (Join-Path $root "frontend\node_modules"))) {
  Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
  Push-Location (Join-Path $root "frontend")
  npm install
  Pop-Location
}

if ($UseDockerMongo) {
  Require-Command "docker" "Install Docker Desktop or start MongoDB manually."
  Write-Host "Starting MongoDB with Docker Compose..." -ForegroundColor Cyan
  docker compose up -d mongo
}

Write-Host "Checking MongoDB..." -ForegroundColor Cyan
$mongoCheck = & $python -c "from backend.database import check_database; result=check_database(); print(result); raise SystemExit(0 if result['available'] else 1)"
if ($LASTEXITCODE -ne 0) {
  throw "MongoDB is not available at mongodb://127.0.0.1:$mongoPort. Start MongoDB or rerun with -UseDockerMongo."
}
Write-Host "MongoDB is connected." -ForegroundColor Green

if (-not (Test-Port $backendPort)) {
  Start-Process powershell.exe -WorkingDirectory $root -ArgumentList @(
    "-NoExit",
    "-Command",
    "& '$python' -m backend.app"
  ) | Out-Null
  Write-Host "Backend terminal started on http://127.0.0.1:$backendPort" -ForegroundColor Green
} else {
  Write-Host "Backend already running on port $backendPort." -ForegroundColor Yellow
}

if (-not (Test-Port $frontendPort)) {
  Start-Process powershell.exe -WorkingDirectory "$root\frontend" -ArgumentList @(
    "-NoExit",
    "-Command",
    "npm run dev"
  ) | Out-Null
  Write-Host "Frontend terminal started on http://localhost:$frontendPort" -ForegroundColor Green
} else {
  Write-Host "Frontend already running on port $frontendPort." -ForegroundColor Yellow
}

if ($WarmModels) {
  Write-Host "Warming ML services through the API is not automatic; models remain lazy-loaded by design." -ForegroundColor DarkGray
}

Write-Host "" 
Write-Host "GreenPlus is starting:" -ForegroundColor Cyan
Write-Host "  App:   http://localhost:$frontendPort"
Write-Host "  Admin: http://localhost:$frontendPort/admin"
Write-Host "  API:   http://127.0.0.1:$backendPort/api/health"
Write-Host "  Ready: http://127.0.0.1:$backendPort/api/ready"
Write-Host "Models load automatically on the first prediction request." -ForegroundColor DarkGray
