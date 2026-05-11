$repos = @(
    "c:\QiLabs\apps\experiments\akaunting",
    "c:\QiLabs\apps\experiments\sure",
    "c:\QiLabs\apps\experiments\USBLegalAidv2",
    "c:\QiLabs\apps\qicare",
    "c:\QiLabs\apps\qihome-test",
    "c:\QiLabs"
)

foreach ($repo in $repos) {
    Write-Host "--- Processing Repo: $repo ---"
    if (Test-Path "$repo\.git") {
        Push-Location $repo
        $status = git status --porcelain
        if ($status) {
            Write-Host "Changes detected in $repo. Committing and pushing..."
            git add .
            git commit -m "QiHome Integration & Sync (Automated)"
            git push
        } else {
            Write-Host "No changes in $repo."
            # Still push just in case there are unpushed commits
            git push
        }
        Pop-Location
    } else {
        Write-Host "Not a git repo: $repo"
    }
}
