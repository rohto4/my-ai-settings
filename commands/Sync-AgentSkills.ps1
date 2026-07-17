[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$SkillsRoot,
    [string]$DestinationRoot = 'C:\Users\unibe\.codex\skills'
)

$ErrorActionPreference = 'Stop'
if (-not $SkillsRoot) {
    $SkillsRoot = Join-Path $PSScriptRoot '..\skills'
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
$stagingRoot = $null
try {
    foreach ($skill in $skills) {
        $target = Assert-ContainedChildPath -Path (Join-Path $destination $skill.Name) -Root $destination -Label 'Skill target'
        if (-not $PSCmdlet.ShouldProcess($target, "Replace skill '$($skill.Name)' from mother set")) {
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
} finally {
    if ($stagingRoot -and (Test-Path -LiteralPath $stagingRoot)) {
        [void](Assert-ContainedChildPath -Path $stagingRoot -Root $destination -Label 'Staging cleanup')
        Remove-Item -Recurse -Force -LiteralPath $stagingRoot
    }
}

if (-not $WhatIfPreference) {
    $manifest = [pscustomobject]@{
        source_root = $source
        synced_at = (Get-Date).ToString('o')
        skill_count = $copied.Count
        verification = 'full-tree-sha256'
        skills = $copied
    }
    $manifestPath = Assert-ContainedChildPath -Path (Join-Path $destination '.tool-set-agent-skills.json') -Root $destination -Label 'Manifest'
    $manifestTemp = Assert-ContainedChildPath -Path "$manifestPath.tmp.$([guid]::NewGuid().ToString('N'))" -Root $destination -Label 'Manifest staging file'
    try {
        [System.IO.File]::WriteAllText($manifestTemp, ($manifest | ConvertTo-Json -Depth 5), [System.Text.UTF8Encoding]::new($false))
        Move-Item -Force -LiteralPath $manifestTemp -Destination $manifestPath
    } finally {
        if (Test-Path -LiteralPath $manifestTemp) {
            Remove-Item -Force -LiteralPath $manifestTemp
        }
    }
    Write-Host "Synced $($copied.Count) skills to $destination" -ForegroundColor Green
    Write-Host "Manifest: $manifestPath" -ForegroundColor Green
}
