$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifestPath = Join-Path $repoRoot '.ai/manifest.json'

if (-not (Test-Path $manifestPath)) {
  Write-Host "❌ 缺少文件: .ai/manifest.json"
  exit 1
}

try {
  $manifest = Get-Content -Path $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
} catch {
  Write-Host "❌ manifest 解析失败: $($_.Exception.Message)"
  exit 1
}

$cursorTarget = $manifest.targets.cursor
if ($null -eq $cursorTarget) {
  Write-Host "❌ manifest 中缺少 targets.cursor"
  exit 1
}

$rulesetName = [string]$cursorTarget.ruleset
if ([string]::IsNullOrWhiteSpace($rulesetName)) {
  Write-Host "❌ manifest 中 targets.cursor.ruleset 为空"
  exit 1
}

$rulesetsObject = $manifest.rulesets
$rulesetProperty = $rulesetsObject.PSObject.Properties | Where-Object { $_.Name -eq $rulesetName } | Select-Object -First 1
if ($null -eq $rulesetProperty) {
  Write-Host "❌ manifest 中未找到 ruleset: $rulesetName"
  exit 1
}

$ruleFiles = @($rulesetProperty.Value)

$rulesDirRel = if ([string]::IsNullOrWhiteSpace([string]$cursorTarget.rulesDir)) { '.cursor/rules' } else { [string]$cursorTarget.rulesDir }
$outputFileName = if ([string]::IsNullOrWhiteSpace([string]$cursorTarget.outputFile)) { 'PROJECT_RULES.md' } else { [string]$cursorTarget.outputFile }
$outputPath = Join-Path $repoRoot (Join-Path $rulesDirRel $outputFileName)
$outputDir = Split-Path -Path $outputPath -Parent
if (-not (Test-Path $outputDir)) {
  New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# Project Rules (generated)')
$lines.Add('')
$lines.Add("Generated at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')")
$lines.Add('')

foreach ($ruleFileRel in $ruleFiles) {
  $ruleRel = [string]$ruleFileRel
  $rulePath = Join-Path $repoRoot $ruleRel

  $lines.Add("## Source: $ruleRel")
  $lines.Add('')

  if (Test-Path $rulePath) {
    $ruleContent = Get-Content -Path $rulePath -Raw -Encoding UTF8
    if (-not [string]::IsNullOrWhiteSpace($ruleContent)) {
      $lines.Add($ruleContent.TrimEnd())
    }
  } else {
    $lines.Add("- Missing rule file: $ruleRel")
  }

  $lines.Add('')
}

$skillsRoot = Join-Path $repoRoot '.cursor/skills'
$lines.Add('## Skills Index')
$lines.Add('')

if (Test-Path $skillsRoot) {
  $skillDirs = Get-ChildItem -Path $skillsRoot -Directory | Sort-Object -Property Name
  if ($skillDirs.Count -gt 0) {
    foreach ($dir in $skillDirs) {
      $lines.Add("- $($dir.Name)")
    }
  } else {
    $lines.Add('- (none)')
  }
} else {
  $lines.Add('- (none)')
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputPath, ($lines -join [Environment]::NewLine) + [Environment]::NewLine, $utf8NoBom)

$outputRel = (Join-Path $rulesDirRel $outputFileName).Replace('\\', '/')
Write-Host "✅ 已生成: $outputRel"
Write-Host 'INFO: skip .github/copilot-instructions.md; explicit enable is required to overwrite.'
