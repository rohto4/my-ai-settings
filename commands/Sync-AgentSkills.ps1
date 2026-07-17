[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$SkillsRoot,
    [string]$DestinationRoot = 'C:\Users\unibe\.codex\skills'
)

$ErrorActionPreference = 'Stop'
if (-not $SkillsRoot) {
    $SkillsRoot = Join-Path $PSScriptRoot '..\skills'
}

$source = (Resolve-Path -LiteralPath $SkillsRoot).Path
$destination = [System.IO.Path]::GetFullPath($DestinationRoot)
if (-not (Test-Path -LiteralPath $destination)) {
    throw "Destination does not exist: $destination"
}

$skills = @(
    Get-ChildItem -LiteralPath $source -Directory |
        ForEach-Object {
            Get-ChildItem -LiteralPath $_.FullName -Directory |
                Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') }
        } |
        Sort-Object Name
)
if ($skills.Count -eq 0) {
    throw "No skills found: $source"
}

$duplicateSkills = @($skills | Group-Object Name | Where-Object Count -gt 1)
if ($duplicateSkills.Count) {
    throw "Duplicate skill names across groups: $($duplicateSkills.Name -join ', ')"
}

$copied = [System.Collections.Generic.List[object]]::new()
foreach ($skill in $skills) {
    $target = Join-Path $destination $skill.Name
    if ($PSCmdlet.ShouldProcess($target, "Copy skill '$($skill.Name)' from mother set")) {
        $nestedSource = Join-Path $skill.FullName $skill.Name
        $nestedTarget = Join-Path $target $skill.Name
        if (Test-Path -LiteralPath $nestedTarget) {
            if (Test-Path -LiteralPath $nestedSource) {
                throw "Refusing to remove a source-owned nested directory: $nestedTarget"
            }
            Remove-Item -Recurse -Force -LiteralPath $nestedTarget
        }
        New-Item -ItemType Directory -Force -Path $target | Out-Null
        Get-ChildItem -Force -LiteralPath $skill.FullName | Copy-Item -Recurse -Force -Destination $target
        $skillFile = Join-Path $skill.FullName 'SKILL.md'
        $copied.Add([pscustomobject]@{
            name = $skill.Name
            group = $skill.Parent.Name
            sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $skillFile).Hash.ToLowerInvariant()
        })
    }
}

if (-not $WhatIfPreference) {
    $manifest = [pscustomobject]@{
        source_root = $source
        synced_at = (Get-Date).ToString('o')
        skill_count = $copied.Count
        skills = $copied
    }
    $manifestPath = Join-Path $destination '.tool-set-agent-skills.json'
    [System.IO.File]::WriteAllText($manifestPath, ($manifest | ConvertTo-Json -Depth 4), [System.Text.UTF8Encoding]::new($false))
    Write-Host "Synced $($copied.Count) skills to $destination" -ForegroundColor Green
    Write-Host "Manifest: $manifestPath" -ForegroundColor Green
}
