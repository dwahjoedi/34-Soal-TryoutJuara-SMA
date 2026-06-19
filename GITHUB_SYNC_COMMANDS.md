# GitHub sync commands

Run these commands from the repository root:

```powershell
cd "C:\UnCloud\34 Soal TryoutJuara SMA"
```

## Normal sync

Stages all changes, creates a commit, rebases with the remote branch, pushes, then verifies that local and remote are synchronized.

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\sync-github.ps1" -Message "Your commit message"
```

Example:

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\sync-github.ps1" -Message "Update question bank files"
```

## Dry run

Preview the git commands without changing anything:

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\sync-github.ps1" -Message "Update question bank files" -DryRun
```

## Specify remote or branch

Use this if the remote is not `origin`, or if you want the script to confirm the current branch explicitly.

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\sync-github.ps1" -Remote "origin" -Branch "main" -Message "Update question bank files"
```

The `-Branch` value must match the branch currently checked out.

## Before running

Check current branch and remote:

```powershell
git branch --show-current
git remote -v
```

Check pending changes:

```powershell
git status --short
```

The script requires:

- Git installed and available in `PATH`.
- A valid Git remote, usually `origin`.
- `git config user.name` and `git config user.email` already configured.
- No merge, rebase, cherry-pick, or revert currently in progress.

## If rebase conflicts happen

After fixing conflicted files:

```powershell
git add -A
git rebase --continue
```

To cancel the rebase:

```powershell
git rebase --abort
```
