[CmdletBinding()]
param(
    [string]$SkillsRoot,
    [string]$ProfilePath,
    [int]$ProfileDiscoveryBudget = 8000
)

$ErrorActionPreference = 'Stop'
if (-not $SkillsRoot) {
    $SkillsRoot = Join-Path $PSScriptRoot '..\skills'
}
$skillsPath = (Resolve-Path -LiteralPath $SkillsRoot).Path
$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()
$records = [System.Collections.Generic.List[object]]::new()
$claudeBodyAssumptionCount = 0
$claudeResourceAssumptionCount = 0
$unsafeMutationCommandCount = 0

$skillDirectories = @(
    Get-ChildItem -LiteralPath $skillsPath -Directory |
        ForEach-Object {
            Get-ChildItem -LiteralPath $_.FullName -Directory |
                Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'SKILL.md') }
        } |
        Sort-Object Name
)
if ($skillDirectories.Count -eq 0) {
    throw "No grouped skills found: $skillsPath"
}

foreach ($directory in $skillDirectories) {
    $skillPath = Join-Path $directory.FullName 'SKILL.md'
    if (-not (Test-Path -LiteralPath $skillPath)) {
        $errors.Add("$($directory.Name): SKILL.md is missing")
        continue
    }

    $lines = [System.IO.File]::ReadAllLines($skillPath, [System.Text.Encoding]::UTF8)
    if ($lines.Count -lt 4 -or $lines[0] -ne '---') {
        $errors.Add("$($directory.Name): YAML frontmatter is missing")
        continue
    }

    $frontmatterEnd = [Array]::IndexOf($lines, '---', 1)
    if ($frontmatterEnd -lt 2) {
        $errors.Add("$($directory.Name): YAML frontmatter is not closed")
        continue
    }

    $frontmatter = $lines[1..($frontmatterEnd - 1)]
    $nameLine = $frontmatter | Where-Object { $_ -match '^name:\s*' } | Select-Object -First 1
    $descriptionLine = $frontmatter | Where-Object { $_ -match '^description:\s*' } | Select-Object -First 1
    $name = if ($nameLine) { ($nameLine -replace '^name:\s*', '').Trim(' ', '"', "'") } else { '' }
    $description = if ($descriptionLine) { ($descriptionLine -replace '^description:\s*', '').Trim(' ', '"', "'") } else { '' }

    if (-not $name) {
        $errors.Add("$($directory.Name): name is missing")
    } elseif ($name -ne $directory.Name) {
        $errors.Add("$($directory.Name): name '$name' does not match the folder")
    }

    if (-not $descriptionLine) {
        $errors.Add("$($directory.Name): description is missing")
    }

    if ($directory.Name -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') {
        $errors.Add("$($directory.Name): folder is not lowercase hyphen-case")
    }

    $content = $lines -join "`n"
    if ($content -match '\[TODO(?:[:\]])') {
        $errors.Add("$($directory.Name): template TODO remains")
    }

    $localLinks = [regex]::Matches($content, '\]\((?<target>[^)]+)\)')
    foreach ($link in $localLinks) {
        $target = $link.Groups['target'].Value.Trim().Trim('<', '>')
        if ($target -match '^(?i:https?://|mailto:|#|[A-Za-z]:[/\\]|/)') {
            continue
        }

        $target = ($target -split '#', 2)[0]
        if (-not $target -or $target -notmatch '^(?i:references|scripts|assets|agents)[/\\]') {
            continue
        }

        $decodedTarget = [Uri]::UnescapeDataString($target)
        $resolvedTarget = Join-Path $directory.FullName $decodedTarget
        if (-not (Test-Path -LiteralPath $resolvedTarget)) {
            $errors.Add("$($directory.Name): local resource link is missing: $target")
        }
    }

    if ($lines.Count -gt 500) {
        $warnings.Add("$($directory.Name): $($lines.Count) lines; consider progressive disclosure")
    }

    if ($content -match '(?i)Claude Code|~[/\\]\.claude|\.claude[/\\]PRP|TodoWrite|Task tool') {
        $warnings.Add("$($directory.Name): contains a Claude-specific operational assumption")
        $claudeBodyAssumptionCount++
    }

    if ($content -match '(?im)^\s*(?:\$\s*)?npm\s+(?:audit\s+fix|update)\b') {
        $warnings.Add("$($directory.Name): contains a dependency-mutating npm command")
        $unsafeMutationCommandCount++
    }

    $resourceExtensions = @('.md', '.sh', '.ps1', '.json', '.toml', '.yaml', '.yml')
    $legacyResource = Get-ChildItem -LiteralPath $directory.FullName -Recurse -File |
        Where-Object {
            $_.FullName -ne $skillPath -and
            $_.Extension -in $resourceExtensions -and
            ([System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8) -match '(?i)Claude Code|~[/\\]\.claude|\.claude[/\\]PRP|TodoWrite|Task tool|CLAUDE_SESSION_ID')
        } |
        Select-Object -First 1
    if ($legacyResource) {
        $relativeResource = $legacyResource.FullName.Substring($directory.FullName.Length + 1)
        $warnings.Add("$($directory.Name): active resource '$relativeResource' contains a Claude-specific operational assumption")
        $claudeResourceAssumptionCount++
    }

    $openAiPath = Join-Path $directory.FullName 'agents\openai.yaml'
    if (Test-Path -LiteralPath $openAiPath) {
        $openAi = [System.IO.File]::ReadAllText($openAiPath, [System.Text.Encoding]::UTF8)
        if ($openAi -notmatch [regex]::Escape("`$$($directory.Name)")) {
            $errors.Add("$($directory.Name): agents/openai.yaml default prompt does not mention `$$($directory.Name)")
        }
    }

    $records.Add([pscustomobject]@{
        Name = $directory.Name
        Group = $directory.Parent.Name
        Description = $description
        SkillPath = $skillPath
        Lines = $lines.Count
        HasOpenAiMetadata = Test-Path -LiteralPath $openAiPath
    })
}

$duplicateNames = $records | Group-Object Name | Where-Object Count -gt 1
foreach ($duplicate in $duplicateNames) {
    $errors.Add("Duplicate skill name: $($duplicate.Name)")
}

$profileSkillCount = 0
$recommendedSkillCount = 0
$profileDiscoveryCharacters = 0
if ($ProfilePath) {
    $resolvedProfile = (Resolve-Path -LiteralPath $ProfilePath).Path
    $profile = Get-Content -Raw -Encoding UTF8 -LiteralPath $resolvedProfile | ConvertFrom-Json
    if (-not ($profile.PSObject.Properties.Name -contains 'mother_set_baseline')) {
        $errors.Add('Profile is missing mother_set_baseline')
    } elseif ([int]$profile.mother_set_baseline -ne $records.Count) {
        $errors.Add("Profile mother_set_baseline is $($profile.mother_set_baseline); current mother set is $($records.Count)")
    }
    $profileSkills = @($profile.skill_groups.PSObject.Properties | ForEach-Object { $_.Value })
    $profileSkillCount = $profileSkills.Count

    foreach ($duplicate in $profileSkills | Group-Object | Where-Object Count -gt 1) {
        $errors.Add("Profile contains duplicate skill: $($duplicate.Name)")
    }

    foreach ($profileSkill in $profileSkills) {
        if ($profileSkill -notin $records.Name) {
            $errors.Add("Profile references missing skill: $profileSkill")
            continue
        }

        $profileRecord = $records | Where-Object Name -eq $profileSkill | Select-Object -First 1
        $profileDiscoveryCharacters += $profileRecord.Name.Length
        $profileDiscoveryCharacters += $profileRecord.Description.Length
        $profileDiscoveryCharacters += $profileRecord.SkillPath.Length
    }

    if ($profileDiscoveryCharacters -gt $ProfileDiscoveryBudget) {
        $warnings.Add("Profile discovery estimate is $profileDiscoveryCharacters characters; budget is $ProfileDiscoveryBudget")
    }

    if ($profile.PSObject.Properties.Name -contains 'recommended_additions') {
        $recommendedSkills = @($profile.recommended_additions.PSObject.Properties | ForEach-Object { $_.Value })
        $recommendedSkillCount = $recommendedSkills.Count

        foreach ($duplicate in $recommendedSkills | Group-Object | Where-Object Count -gt 1) {
            $errors.Add("Recommended additions contain duplicate skill: $($duplicate.Name)")
        }

        foreach ($recommendedSkill in $recommendedSkills) {
            if ($recommendedSkill -notin $records.Name) {
                $errors.Add("Recommended additions reference missing skill: $recommendedSkill")
            }
            if ($recommendedSkill -in $profileSkills) {
                $errors.Add("Skill appears in both core and recommended additions: $recommendedSkill")
            }
        }
    }
}

$summary = [pscustomobject]@{
    Skills = $records.Count
    ProfileSkills = $profileSkillCount
    RecommendedAdditions = $recommendedSkillCount
    ProfileDiscoveryCharacters = $profileDiscoveryCharacters
    OpenAiMetadata = @($records | Where-Object HasOpenAiMetadata).Count
    Over500Lines = @($records | Where-Object Lines -gt 500).Count
    ClaudeBodyAssumptions = $claudeBodyAssumptionCount
    ClaudeResourceAssumptions = $claudeResourceAssumptionCount
    DependencyMutationCommands = $unsafeMutationCommandCount
    Warnings = $warnings.Count
    Errors = $errors.Count
}

$summary | Format-List
if ($warnings.Count) {
    Write-Host 'Warnings:' -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}
if ($errors.Count) {
    Write-Host 'Errors:' -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

Write-Host 'Agent set validation passed.' -ForegroundColor Green
