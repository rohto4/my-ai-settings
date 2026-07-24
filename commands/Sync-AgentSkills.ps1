[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$SkillsRoot,
    [string]$DestinationRoot = 'C:\Users\unibe\.codex\skills',
    [string]$ProfilePath,
    [switch]$FullMotherSet
)

$ErrorActionPreference = 'Stop'
if (-not $SkillsRoot) {
    $SkillsRoot = Join-Path $PSScriptRoot '..\skills'
}
if ($ProfilePath -and $FullMotherSet) {
    throw 'Use either -ProfilePath or -FullMotherSet, not both.'
}
if (-not $ProfilePath -and -not $FullMotherSet) {
    $ProfilePath = Join-Path $PSScriptRoot '..\profiles\codex-desktop-default\profile.json'
}

function Assert-ContainedChildPath {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $fullRoot = [System.IO.Path]::GetFullPath($Root).TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    )
    $prefix = $fullRoot + [System.IO.Path]::DirectorySeparatorChar
    if (-not $fullPath.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "$Label escapes the destination root: $fullPath"
    }
    return $fullPath
}

function Get-SkillTreeRecord {
    param([Parameter(Mandatory = $true)][string]$Root)

    $resolvedRoot = (Resolve-Path -LiteralPath $Root).Path.TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    )
    $prefix = $resolvedRoot + [System.IO.Path]::DirectorySeparatorChar
    $files = @(
        Get-ChildItem -Force -LiteralPath $resolvedRoot -Recurse -File |
            Sort-Object { $_.FullName.Substring($prefix.Length).Replace('\', '/') }
    )
    $entries = [System.Collections.Generic.List[string]]::new()
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($prefix.Length).Replace('\', '/')
        $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash.ToLowerInvariant()
        $entries.Add("$relative`0$hash")
    }

    $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes(($entries -join "`n"))
    $hasher = [System.Security.Cryptography.SHA256]::Create()
    try {
        $treeHash = ([System.BitConverter]::ToString($hasher.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
    } finally {
        $hasher.Dispose()
    }

    return [pscustomobject]@{
        file_count = $files.Count
        tree_sha256 = $treeHash
    }
}

$source = (Resolve-Path -LiteralPath $SkillsRoot).Path
$destination = [System.IO.Path]::GetFullPath($DestinationRoot)
if (-not (Test-Path -LiteralPath $destination -PathType Container)) {
    throw "Destination does not exist: $destination"
}

$motherSet = @(
    Get-ChildItem -LiteralPath $source -Directory |
        ForEach-Object {
            Get-ChildItem -LiteralPath $_.FullName -Directory |
                Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') }
        } |
        Sort-Object Name
)
if ($motherSet.Count -eq 0) {
    throw "No skills found: $source"
}

$duplicateSkills = @($motherSet | Group-Object Name | Where-Object Count -gt 1)
if ($duplicateSkills.Count) {
    throw "Duplicate skill names across groups: $($duplicateSkills.Name -join ', ')"
}

$skillLookup = @{}
foreach ($skill in $motherSet) {
    $skillLookup[$skill.Name] = $skill
}

$resolvedProfilePath = $null
$profileName = $null
$deploymentMode = 'full-mother-set'
if ($FullMotherSet) {
    $skills = $motherSet
} else {
    $resolvedProfilePath = (Resolve-Path -LiteralPath $ProfilePath).Path
    $profile = Get-Content -Raw -Encoding UTF8 -LiteralPath $resolvedProfilePath | ConvertFrom-Json
    if (-not $profile.skill_groups) {
        throw "Profile has no skill_groups: $resolvedProfilePath"
    }

    $profileName = [string]$profile.name
    if (-not $profileName) {
        throw "Profile has no name: $resolvedProfilePath"
    }

    $skillNames = @($profile.skill_groups.PSObject.Properties | ForEach-Object { $_.Value })
    $duplicateProfileSkills = @($skillNames | Group-Object | Where-Object Count -gt 1)
    if ($duplicateProfileSkills.Count) {
        throw "Profile contains duplicate skills: $($duplicateProfileSkills.Name -join ', ')"
    }

    $missingProfileSkills = @($skillNames | Where-Object { -not $skillLookup.ContainsKey($_) })
    if ($missingProfileSkills.Count) {
        throw "Profile references missing skills: $($missingProfileSkills -join ', ')"
    }

    $skills = @($skillNames | ForEach-Object { $skillLookup[$_] } | Sort-Object Name)
    $deploymentMode = 'profile'
}

if ($skills.Count -eq 0) {
    throw 'The selected runtime skill set is empty.'
}

$manifestPath = Assert-ContainedChildPath `
    -Path (Join-Path $destination '.tool-set-agent-skills.json') `
    -Root $destination `
    -Label 'Manifest'
$previousManagedNames = @()
if (Test-Path -LiteralPath $manifestPath -PathType Leaf) {
    $previousManifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
    $previousManagedNames = @($previousManifest.skills | ForEach-Object { [string]$_.name } | Where-Object { $_ })
}

$selectedNames = @($skills | Select-Object -ExpandProperty Name)
$retiredNames = @($previousManagedNames | Where-Object { $_ -notin $selectedNames } | Sort-Object -Unique)
$copied = [System.Collections.Generic.List[object]]::new()
$retired = [System.Collections.Generic.List[string]]::new()
$stagingRoot = $null
try {
    foreach ($skill in $skills) {
        $target = Assert-ContainedChildPath -Path (Join-Path $destination $skill.Name) -Root $destination -Label 'Skill target'
        if (-not $PSCmdlet.ShouldProcess($target, "Replace skill '$($skill.Name)' from $deploymentMode")) {
            continue
        }

        if (-not $stagingRoot) {
            $stagingRoot = Assert-ContainedChildPath `
                -Path (Join-Path $destination ".tool-set-sync-$PID-$([guid]::NewGuid().ToString('N'))") `
                -Root $destination `
                -Label 'Staging root'
            New-Item -ItemType Directory -Path $stagingRoot | Out-Null
        }

        $stagedTarget = Assert-ContainedChildPath -Path (Join-Path $stagingRoot $skill.Name) -Root $destination -Label 'Staged skill'
        New-Item -ItemType Directory -Path $stagedTarget | Out-Null
        Get-ChildItem -Force -LiteralPath $skill.FullName |
            Copy-Item -Recurse -Force -Destination $stagedTarget

        $sourceTree = Get-SkillTreeRecord -Root $skill.FullName
        $stagedTree = Get-SkillTreeRecord -Root $stagedTarget
        if ($sourceTree.file_count -ne $stagedTree.file_count -or $sourceTree.tree_sha256 -ne $stagedTree.tree_sha256) {
            throw "Staged tree verification failed: $($skill.Name)"
        }

        $backupTarget = Assert-ContainedChildPath -Path (Join-Path $stagingRoot "$($skill.Name).previous") -Root $destination -Label 'Skill backup'
        $hadTarget = Test-Path -LiteralPath $target
        try {
            if ($hadTarget) {
                Move-Item -LiteralPath $target -Destination $backupTarget
            }
            Move-Item -LiteralPath $stagedTarget -Destination $target
        } catch {
            if ($hadTarget -and -not (Test-Path -LiteralPath $target) -and (Test-Path -LiteralPath $backupTarget)) {
                Move-Item -LiteralPath $backupTarget -Destination $target
            }
            throw
        }

        if (Test-Path -LiteralPath $backupTarget) {
            [void](Assert-ContainedChildPath -Path $backupTarget -Root $destination -Label 'Skill backup cleanup')
            Remove-Item -Recurse -Force -LiteralPath $backupTarget
        }

        $destinationTree = Get-SkillTreeRecord -Root $target
        if ($sourceTree.file_count -ne $destinationTree.file_count -or $sourceTree.tree_sha256 -ne $destinationTree.tree_sha256) {
            throw "Destination tree verification failed: $($skill.Name)"
        }

        $skillFile = Join-Path $skill.FullName 'SKILL.md'
        $copied.Add([pscustomobject]@{
            name = $skill.Name
            group = $skill.Parent.Name
            sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $skillFile).Hash.ToLowerInvariant()
            source_file_count = $sourceTree.file_count
            destination_file_count = $destinationTree.file_count
            source_tree_sha256 = $sourceTree.tree_sha256
            destination_tree_sha256 = $destinationTree.tree_sha256
        })
    }

    foreach ($retiredName in $retiredNames) {
        $target = Assert-ContainedChildPath -Path (Join-Path $destination $retiredName) -Root $destination -Label 'Retired skill target'
        if (-not (Test-Path -LiteralPath $target -PathType Container)) {
            continue
        }
        if (-not $PSCmdlet.ShouldProcess($target, "Retire previously managed skill not selected by $deploymentMode")) {
            continue
        }

        if (-not $stagingRoot) {
            $stagingRoot = Assert-ContainedChildPath `
                -Path (Join-Path $destination ".tool-set-sync-$PID-$([guid]::NewGuid().ToString('N'))") `
                -Root $destination `
                -Label 'Staging root'
            New-Item -ItemType Directory -Path $stagingRoot | Out-Null
        }

        $retiredTarget = Assert-ContainedChildPath `
            -Path (Join-Path $stagingRoot "$retiredName.retired") `
            -Root $destination `
            -Label 'Retired skill staging'
        Move-Item -LiteralPath $target -Destination $retiredTarget
        Remove-Item -Recurse -Force -LiteralPath $retiredTarget
        $retired.Add($retiredName)
    }
} finally {
    if ($stagingRoot -and (Test-Path -LiteralPath $stagingRoot)) {
        [void](Assert-ContainedChildPath -Path $stagingRoot -Root $destination -Label 'Staging cleanup')
        Remove-Item -Recurse -Force -LiteralPath $stagingRoot
    }
}

if ($WhatIfPreference) {
    Write-Host "WhatIf: mode=$deploymentMode selected=$($skills.Count) retire=$($retiredNames.Count) mother_set=$($motherSet.Count)" -ForegroundColor Yellow
    return
}

$manifest = [pscustomobject]@{
    source_root = $source
    synced_at = (Get-Date).ToString('o')
    deployment_mode = $deploymentMode
    profile_name = $profileName
    profile_path = $resolvedProfilePath
    mother_set_skill_count = $motherSet.Count
    managed_before_count = @($previousManagedNames | Sort-Object -Unique).Count
    retired_skill_count = $retired.Count
    retired_skills = @($retired)
    skill_count = $copied.Count
    verification = 'full-tree-sha256'
    skills = $copied
}
$manifestTemp = Assert-ContainedChildPath -Path "$manifestPath.tmp.$([guid]::NewGuid().ToString('N'))" -Root $destination -Label 'Manifest staging file'
try {
    [System.IO.File]::WriteAllText($manifestTemp, ($manifest | ConvertTo-Json -Depth 5), [System.Text.UTF8Encoding]::new($false))
    Move-Item -Force -LiteralPath $manifestTemp -Destination $manifestPath
} finally {
    if (Test-Path -LiteralPath $manifestTemp) {
        Remove-Item -Force -LiteralPath $manifestTemp
    }
}

Write-Host "Synced $($copied.Count) skills to $destination (mode=$deploymentMode, retired=$($retired.Count))" -ForegroundColor Green
Write-Host "Manifest: $manifestPath" -ForegroundColor Green
