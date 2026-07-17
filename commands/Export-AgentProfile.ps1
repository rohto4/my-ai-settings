[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [string]$ProfilePath,

    [Parameter(Mandatory)]
    [string]$DestinationRoot,

    [string]$SkillsRoot
)

$ErrorActionPreference = 'Stop'
if (-not $SkillsRoot) {
    $SkillsRoot = Join-Path $PSScriptRoot '..\skills'
}
$profileFile = (Resolve-Path -LiteralPath $ProfilePath).Path
$skillsPath = (Resolve-Path -LiteralPath $SkillsRoot).Path
$profile = Get-Content -Raw -Encoding UTF8 -LiteralPath $profileFile | ConvertFrom-Json
$skillNames = @($profile.skill_groups.PSObject.Properties | ForEach-Object { $_.Value })
$skillDirectories = @(
    Get-ChildItem -LiteralPath $skillsPath -Directory |
        ForEach-Object {
            Get-ChildItem -LiteralPath $_.FullName -Directory |
                Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') }
        }
)
$duplicateSourceSkills = @($skillDirectories | Group-Object Name | Where-Object Count -gt 1)
if ($duplicateSourceSkills.Count) {
    throw "Duplicate skill names across groups: $($duplicateSourceSkills.Name -join ', ')"
}
$skillLookup = @{}
foreach ($skillDirectory in $skillDirectories) {
    $skillLookup[$skillDirectory.Name] = $skillDirectory.FullName
}

$duplicates = @($skillNames | Group-Object | Where-Object Count -gt 1)
if ($duplicates.Count) {
    throw "Profile contains duplicate skills: $($duplicates.Name -join ', ')"
}

foreach ($skillName in $skillNames) {
    if (-not $skillLookup.ContainsKey($skillName)) {
        throw "Profile skill is missing from the mother set: $skillName"
    }
}

$destination = [System.IO.Path]::GetFullPath($DestinationRoot)
if (Test-Path -LiteralPath $destination) {
    if (Get-ChildItem -Force -LiteralPath $destination | Select-Object -First 1) {
        throw "Destination must be absent or empty: $destination"
    }
}

$destinationSkills = Join-Path $destination '.agents\skills'
if ($PSCmdlet.ShouldProcess($destination, "Export profile '$($profile.name)' with $($skillNames.Count) skills")) {
    New-Item -ItemType Directory -Force -Path $destinationSkills | Out-Null
    foreach ($skillName in $skillNames) {
        Copy-Item -Recurse -LiteralPath $skillLookup[$skillName] -Destination $destinationSkills
    }

    Copy-Item -LiteralPath $profileFile -Destination (Join-Path $destination 'agent-profile.json')
    Write-Host "Exported $($skillNames.Count) skills to $destination" -ForegroundColor Green
}
