$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Require-Command {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [string]$DisplayName = $Name
  )

  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($null -eq $cmd) {
    Write-Host "❌ 未检测到命令: $DisplayName"
    exit 1
  }

  Write-Host "✅ 已检测到命令: $DisplayName"
}

Require-Command -Name 'node' -DisplayName 'node'

$pythonCmd = Get-Command 'python' -ErrorAction SilentlyContinue
if ($null -eq $pythonCmd) {
  $pythonCmd = Get-Command 'python3' -ErrorAction SilentlyContinue
}

if ($null -eq $pythonCmd) {
  Write-Host '❌ 未检测到命令: python 或 python3'
  exit 1
}

Write-Host "✅ 已检测到命令: $($pythonCmd.Name)"

$syncScript = Join-Path $PSScriptRoot 'sync-ai.ps1'
& $syncScript
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

node "$repoRoot/scripts/sync-skills.mjs"
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

$envLocal = Join-Path $repoRoot '.env.local'
$envExample = Join-Path $repoRoot '.env.local.example'

if (-not (Test-Path $envLocal) -and (Test-Path $envExample)) {
  Write-Host 'INFO: .env.local.example exists but .env.local is missing; copy it and fill values as needed.'
}
