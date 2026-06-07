param(
    [string]$Message = "",
    [string]$Remote = "origin",
    [string]$Branch = "",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Run-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Args
    )

    if ($DryRun) {
        Write-Host "[dry-run] git $($Args -join ' ')"
        return
    }

    & git @Args
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed: git $($Args -join ' ')"
    }
}

function Git-Output {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Args
    )

    $output = & git @Args
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed: git $($Args -join ' ')"
    }
    return $output
}

$insideRepo = (& git rev-parse --is-inside-work-tree 2>$null)
if ($LASTEXITCODE -ne 0 -or $insideRepo -ne "true") {
    throw "Folder ini bukan Git repository. Jalankan 'git init' dulu dari root project."
}

$repoRoot = Git-Output @("rev-parse", "--show-toplevel")
Set-Location $repoRoot

$remoteUrl = (& git remote get-url $Remote 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remoteUrl)) {
    throw "Remote '$Remote' belum ada. Tambahkan dengan: git remote add $Remote https://github.com/USERNAME/NAMA-REPO.git"
}

if ([string]::IsNullOrWhiteSpace($Branch)) {
    $Branch = (& git branch --show-current)
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($Branch)) {
        $Branch = "main"
    }
}

Write-Host "Repo   : $repoRoot"
Write-Host "Remote : $Remote ($remoteUrl)"
Write-Host "Branch : $Branch"

$status = & git status --short
if ($status) {
    Write-Host ""
    Write-Host "Perubahan yang akan diproses:"
    $status | ForEach-Object { Write-Host $_ }

    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = "Update content"
    }

    Run-Git @("add", "-A")
    Run-Git @("commit", "-m", $Message)
} else {
    Write-Host ""
    Write-Host "Tidak ada perubahan lokal untuk di-commit."
}

$upstream = (& git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null)
if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($upstream)) {
    Run-Git @("push")
} else {
    Run-Git @("push", "-u", $Remote, $Branch)
}

Write-Host ""
Write-Host "Selesai."
