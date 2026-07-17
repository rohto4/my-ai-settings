[CmdletBinding()]
param(
    [string]$RepositoryRoot,
    [string]$EccUpstreamRoot,
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
if (-not $RepositoryRoot) {
    $RepositoryRoot = Join-Path $PSScriptRoot '..'
}
$repo = (Resolve-Path -LiteralPath $RepositoryRoot).Path
if (-not $EccUpstreamRoot) {
    $EccUpstreamRoot = Join-Path $repo 'upstream\ecc-everything-claude-code'
}
$eccUpstream = (Resolve-Path -LiteralPath $EccUpstreamRoot).Path
if (-not $OutputPath) {
    $OutputPath = Join-Path $repo 'registry\skill-lineage.csv'
}

$sourceFrontmatterPath = Join-Path $repo 'registry\skills-source-frontmatter.csv'
$sourceRows = @(Import-Csv -Encoding UTF8 -LiteralPath $sourceFrontmatterPath)
$sourceByName = @{}
foreach ($row in $sourceRows) {
    $nameValue = [string]$row.PSObject.Properties[0].Value
    $frontmatterValue = [string]$row.PSObject.Properties[1].Value
    $sourceByName[$nameValue] = $frontmatterValue
}

$safeDirectory = 'safe.directory=' + $eccUpstream
$eccComparisonCommit = (& git -c $safeDirectory -C $eccUpstream rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or -not $eccComparisonCommit) {
    throw 'Failed to read the ECC comparison commit.'
}
$eccCurrentNames = @(
    Get-ChildItem -LiteralPath (Join-Path $eccUpstream 'skills') -Directory |
        Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') } |
        Select-Object -ExpandProperty Name
)

$skillRows = [System.Collections.Generic.List[object]]::new()
$groups = @('ecc', 'codex', 'original')
foreach ($group in $groups) {
    $groupRoot = Join-Path $repo (Join-Path 'skills' $group)
    foreach ($directory in Get-ChildItem -LiteralPath $groupRoot -Directory | Sort-Object Name) {
        if (-not (Test-Path -LiteralPath (Join-Path $directory.FullName 'SKILL.md'))) {
            continue
        }

        $declaredOrigin = ''
        $declaredLicense = ''
        $sourceCollection = 'local'
        $upstreamRepository = ''
        $importCommit = ''
        $comparisonCommit = ''
        $currentNameMatch = 'not_applicable'
        $notes = ''

        if ($group -eq 'ecc') {
            $sourceCollection = 'G:\devwork\tool-set\agents-v1-bk'
            $upstreamRepository = 'https://github.com/affaan-m/everything-claude-code'
            $importCommit = 'unknown_historical_snapshot'
            $comparisonCommit = $eccComparisonCommit
            $currentNameMatch = if ($directory.Name -in $eccCurrentNames) { 'yes' } else { 'no' }
            if ($sourceByName.ContainsKey($directory.Name)) {
                $frontmatter = $sourceByName[$directory.Name]
                $originMatch = [regex]::Match($frontmatter, '(?m)^origin:\s*(?<value>.+)$')
                $licenseMatch = [regex]::Match($frontmatter, '(?m)^license:\s*(?<value>.+)$')
                $declaredOrigin = if ($originMatch.Success) { $originMatch.Groups['value'].Value.Trim(' ', '"', "'") } else { 'not_declared' }
                $declaredLicense = if ($licenseMatch.Success) { $licenseMatch.Groups['value'].Value.Trim(' ', '"', "'") } else { 'not_declared' }
            } else {
                $declaredOrigin = 'missing_from_source_capture'
                $declaredLicense = 'not_declared'
            }
            $notes = 'Current upstream commit is comparison evidence only; the original imported commit is unknown.'
        } elseif ($group -eq 'original') {
            $declaredOrigin = 'local_original'
            $declaredLicense = 'private_local'
            $notes = 'Created for this repository; see skills-registry.csv for authorship and dates.'
        } else {
            $declaredOrigin = 'adopted_for_codex'
            $declaredLicense = 'record_on_adoption'
            $notes = 'Codex group entries require upstream URL, fixed commit, license, and change summary before adoption.'
        }

        $skillRows.Add([pscustomobject]@{
            skill_name = $directory.Name
            group = $group
            source_collection = $sourceCollection
            declared_origin = $declaredOrigin
            declared_license = $declaredLicense
            upstream_repository = $upstreamRepository
            import_commit = $importCommit
            comparison_commit = $comparisonCommit
            current_upstream_name_match = $currentNameMatch
            notes = $notes
        })
    }
}

$duplicateNames = @($skillRows | Group-Object skill_name | Where-Object Count -gt 1)
if ($duplicateNames.Count) {
    throw "Duplicate active skill names: $($duplicateNames.Name -join ', ')"
}

$csv = $skillRows | Sort-Object group, skill_name | ConvertTo-Csv -NoTypeInformation
[System.IO.File]::WriteAllLines(
    [System.IO.Path]::GetFullPath($OutputPath),
    $csv,
    [System.Text.UTF8Encoding]::new($false)
)
Write-Host "Wrote $($skillRows.Count) lineage rows to $OutputPath" -ForegroundColor Green
