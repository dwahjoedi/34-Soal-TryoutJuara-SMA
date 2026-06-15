param(
    [string]$Message = "",
    [string]$Remote = "origin",
    [string]$Branch = "",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    if ($DryRun) {
        Write-Host "[dry-run] git $($Arguments -join ' ')" -ForegroundColor DarkGray
        return
    }

    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

function Test-GitOperationInProgress {
    param(
        [Parameter(Mandatory = $true)]
        [string]$GitDirectory
    )

    $markers = @(
        "MERGE_HEAD",
        "CHERRY_PICK_HEAD",
        "REVERT_HEAD",
        "rebase-merge",
        "rebase-apply"
    )

    return $null -ne ($markers |
        Where-Object { Test-Path (Join-Path $GitDirectory $_) } |
        Select-Object -First 1)
}

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDirectory

try {
    & git --version *> $null
    if ($LASTEXITCODE -ne 0) {
        throw
    }
}
catch {
    throw "Git is not installed or is not available in PATH."
}

$repoRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($repoRoot)) {
    throw "This script must be located inside an existing Git repository."
}
$repoRoot = ([string]$repoRoot).Trim()
Set-Location $repoRoot

$gitDirectory = ([string](& git rev-parse --absolute-git-dir)).Trim()
if (Test-GitOperationInProgress -GitDirectory $gitDirectory) {
    throw "A merge, rebase, cherry-pick, or revert is already in progress. Complete or abort it before syncing."
}

$currentBranch = ([string](& git branch --show-current)).Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    throw "The repository is in detached HEAD state. Check out a branch before syncing."
}

if ([string]::IsNullOrWhiteSpace($Branch)) {
    $Branch = $currentBranch
}
elseif ($Branch -ne $currentBranch) {
    throw "Requested branch '$Branch' is not the currently checked-out branch '$currentBranch'."
}

$remoteUrl = (& git remote get-url $Remote 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remoteUrl)) {
    throw "Remote '$Remote' does not exist. Add it before syncing."
}
$remoteUrl = ([string]$remoteUrl).Trim()

$userName = ([string](& git config user.name)).Trim()
$userEmail = ([string](& git config user.email)).Trim()
if ([string]::IsNullOrWhiteSpace($userName) -or [string]::IsNullOrWhiteSpace($userEmail)) {
    throw "Git user.name and user.email must be configured before committing."
}

Write-Host "Repository : $repoRoot"
Write-Host "Branch     : $Branch"
Write-Host "Remote     : $Remote ($remoteUrl)"

Write-Host "`nFetching remote state..."
Invoke-Git -Arguments @("fetch", "--prune", $Remote)

& git ls-remote --exit-code --heads $Remote $Branch *> $null
$remoteBranchExists = $LASTEXITCODE -eq 0

Write-Host "Staging all local changes..."
Invoke-Git -Arguments @("add", "-A")

if ($DryRun) {
    $hasStagedChanges = -not [string]::IsNullOrWhiteSpace((& git status --porcelain) -join "`n")
}
else {
    & git diff --cached --quiet
    $hasStagedChanges = $LASTEXITCODE -ne 0
}

if ($hasStagedChanges) {
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = "Sync changes $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }

    Write-Host "Creating local commit: $Message"
    Invoke-Git -Arguments @("commit", "-m", $Message)
}
else {
    Write-Host "No local changes to commit."
}

if ($remoteBranchExists) {
    Write-Host "Rebasing local commits onto $Remote/$Branch..."
    try {
        Invoke-Git -Arguments @("pull", "--rebase", $Remote, $Branch)
    }
    catch {
        Write-Host "`nSync stopped because the rebase could not be completed automatically." -ForegroundColor Yellow
        Write-Host "Resolve conflicts, stage the resolved files, then run:"
        Write-Host "  git rebase --continue"
        Write-Host "To cancel the rebase, run:"
        Write-Host "  git rebase --abort"
        throw
    }
}
else {
    Write-Host "Remote branch $Remote/$Branch does not exist yet; it will be created."
}

Write-Host "Pushing $Branch to $Remote..."
Invoke-Git -Arguments @("push", "--set-upstream", $Remote, $Branch)

if ($DryRun) {
    Write-Host "`nDry run complete. No Git changes were made." -ForegroundColor Yellow
    exit 0
}

Write-Host "Verifying synchronization..."
Invoke-Git -Arguments @("fetch", $Remote, $Branch)

$counts = (& git rev-list --left-right --count "$Remote/$Branch...$Branch").Trim() -split "\s+"
$remoteOnly = [int]$counts[0]
$localOnly = [int]$counts[1]
$workingTreeStatus = (& git status --porcelain) -join "`n"

if ($remoteOnly -ne 0 -or $localOnly -ne 0 -or -not [string]::IsNullOrWhiteSpace($workingTreeStatus)) {
    throw "Sync verification failed. Remote-only commits: $remoteOnly; local-only commits: $localOnly; working tree clean: $([string]::IsNullOrWhiteSpace($workingTreeStatus))"
}

Write-Host "`nGitHub sync complete. Local '$Branch' and '$Remote/$Branch' are synchronized." -ForegroundColor Green
