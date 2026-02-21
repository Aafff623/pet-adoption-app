$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$allPassed = $true

function Test-RequiredPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RelativePath,
    [Parameter(Mandatory = $true)]
    [ValidateSet('Any', 'File', 'Directory')]
    [string]$Type
  )

  $fullPath = Join-Path $repoRoot $RelativePath
  $exists = Test-Path $fullPath

  if (-not $exists) {
    Write-Host "❌ $RelativePath"
    $script:allPassed = $false
    return
  }

  if ($Type -eq 'File' -and -not (Test-Path $fullPath -PathType Leaf)) {
    Write-Host "❌ $RelativePath"
    $script:allPassed = $false
    return
  }

  if ($Type -eq 'Directory' -and -not (Test-Path $fullPath -PathType Container)) {
    Write-Host "❌ $RelativePath"
    $script:allPassed = $false
    return
  }

  Write-Host "✅ $RelativePath"
}

Test-RequiredPath -RelativePath '.ai/manifest.json' -Type 'File'
Test-RequiredPath -RelativePath '.ai/mcp/servers.json' -Type 'File'
Test-RequiredPath -RelativePath '.ai/skills/index.md' -Type 'File'
Test-RequiredPath -RelativePath '.cursor/rules/PROJECT_RULES.md' -Type 'File'
Test-RequiredPath -RelativePath '.vscode/settings.json' -Type 'File'
Test-RequiredPath -RelativePath 'node_modules' -Type 'Directory'

if (-not $allPassed) {
  exit 1
}
