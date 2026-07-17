[CmdletBinding()]
param(
    [Parameter(Mandatory, Position = 0)]
    [ValidateNotNullOrEmpty()]
    [string[]]$SkillsRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-FrontmatterField {
    param(
        [Parameter(Mandatory)][string]$Content,
        [Parameter(Mandatory)][string]$Field
    )

    $frontmatter = [regex]::Match($Content, '(?s)\A---\r?\n(.*?)\r?\n---(?:\r?\n|\z)')
    if (-not $frontmatter.Success) { return '' }

    $lines = $frontmatter.Groups[1].Value -split '\r?\n'
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -notmatch ('^' + [regex]::Escape($Field) + ':\s*(.*)$')) { continue }

        $value = $Matches[1].Trim()
        if ($value -in @('|', '|-', '>', '>-')) {
            $parts = [System.Collections.Generic.List[string]]::new()
            for ($next = $index + 1; $next -lt $lines.Count; $next++) {
                if ($lines[$next] -match '^\S') { break }
                if ($lines[$next].Trim()) { $parts.Add($lines[$next].Trim()) }
            }
            return ($parts -join ' ')
        }

        return $value.Trim('"').Trim("'")
    }

    return ''
}

$resolvedRoots = foreach ($root in $SkillsRoot) {
    if (-not (Test-Path -LiteralPath $root -PathType Container)) {
        throw "Skills root not found: $root"
    }
    (Resolve-Path -LiteralPath $root).ProviderPath
}

$skills = foreach ($root in $resolvedRoots) {
    Get-ChildItem -LiteralPath $root -Recurse -File -Filter 'SKILL.md' |
        Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' } |
        Sort-Object FullName |
        ForEach-Object {
            $content = Get-Content -Raw -Encoding UTF8 -LiteralPath $_.FullName
            [pscustomobject]@{
                root        = $root
                path        = $_.FullName
                name        = Get-FrontmatterField -Content $content -Field 'name'
                description = Get-FrontmatterField -Content $content -Field 'description'
                mtimeUtc    = $_.LastWriteTimeUtc.ToString('yyyy-MM-ddTHH:mm:ssZ')
            }
        }
}

$summary = foreach ($root in $resolvedRoots) {
    [pscustomobject]@{
        root  = $root
        count = @($skills | Where-Object root -eq $root).Count
    }
}

[pscustomobject]@{
    scan_summary = @($summary)
    total        = @($skills).Count
    skills       = @($skills)
} | ConvertTo-Json -Depth 6
