param(
    [Parameter(Mandatory=$true)]
    [string]$Query
)

$Repos = @(
    @{ Name = "freobus-deploy"; Path = "freobus-deploy" },
    @{ Name = "freobus-extension"; Path = "freobus-extension" },
    @{ Name = "current"; Path = "." }
)

Write-Host "Searching for: `"$Query`"`n"

foreach ($repo in $Repos) {
    Write-Host "`nResults in $($repo.Name):"
    
    try {
        Push-Location $repo.Path
        $results = git grep -i "$Query" -- "*.ts" "*.tsx" "*.js" "*.jsx" "*.json" "*.md"
        Pop-Location
        
        if ($results) {
            $results | ForEach-Object { Write-Host $_ }
        } else {
            Write-Host "No matches found"
        }
    } catch {
        Write-Host "Error searching in $($repo.Name): $_"
    }
} 