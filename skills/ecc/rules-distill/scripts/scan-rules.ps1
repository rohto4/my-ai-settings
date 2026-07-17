[CmdletBinding()]
param(
    [Parameter(Mandatory, Position = 0)]
    [ValidateNotNullOrEmpty()]
    [string]$RulesRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $RulesRoot -PathType Container)) {
    throw "Rules root not found: $RulesRoot"
}

$resolvedRoot = (Resolve-Path -LiteralPath $RulesRoot).ProviderPath
$files = Get-ChildItem -LiteralPath $resolvedRoot -Recurse -File -Filter '*.md' |
    Where-Object {
        $_.FullName -notmatch '[\\/]_archived[\\/]' -and
        $_.FullName -notmatch '[\\/]\.git[\\/]'
    } |
    Sort-Object FullName

$rules = foreach ($file in $files) {
    $lines = @(Get-Content -Encoding UTF8 -LiteralPath $file.FullName)
    $headings = @(
        $lines |
            Where-Object { $_ -match '^##\s+' } |
            ForEach-Object { $_ -replace '^##\s+', '' }
    )
    [pscustomobject]@{
        path     = $file.FullName
        file     = $file.Name
        lines    = $lines.Count
        headings = $headings
    }
}

[pscustomobject]@{
    rules_root = $resolvedRoot
    total      = @($rules).Count
    rules      = @($rules)
} | ConvertTo-Json -Depth 6
