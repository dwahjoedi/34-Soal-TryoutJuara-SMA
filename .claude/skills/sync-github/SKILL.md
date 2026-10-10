---
name: sync-github
description: Publish this repository to GitHub (commit all changes, rebase on origin, push, verify). Use only when the user explicitly asks to sync, push, upload or publish to GitHub, e.g. "sync ke github", "push", "upload ke github". Never use it as a validation step or on your own initiative.
---

# Sync repository to GitHub

Publishes with `scripts/sync-github.ps1`, which stages **everything** (`git add -A`), commits, rebases on `origin/<branch>`, pushes, and verifies that local and remote match. Publishing is outward-facing: run it only on an explicit request in the current conversation.

## 1. Pre-flight (read-only)

Run from the repository root:

```powershell
git status --short
git branch --show-current
git fetch origin
git status -sb
```

Stop and ask the user before continuing if any of these hold:

- A merge, rebase, cherry-pick or revert is in progress.
- The branch is not the one the user expects (normally `main`), or HEAD is detached.
- `git status` shows files the user may not want published: secrets or `.env`, API keys, large binaries or PDFs not discussed, scratch files, `__pycache__`/`.pyc` created this session, files outside this session's work that you did not create. Remove only files you created yourself; otherwise ask.
- The local branch is behind or diverged from origin and you expect conflicts in files you edited.

## 2. Validate content being published

For every new or changed question-bank JSON or Foundation Micro pack:

```powershell
python -X utf8 scripts/validate_content.py <changed files>
```

New work must have no ERROR. Legacy files that already failed (baseline in `knowledge.md` section 4) do not block a sync, but mention them if they changed.

## 3. Dry run

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\sync-github.ps1" -Message "<summary>" -DryRun
```

Check the printed git commands and branch.

## 4. Commit message

- Short imperative subject in English or Indonesian describing the content, e.g. `Add IPA speed-k set`, `Fix taxonomy drift in English speed sets`. Avoid the generic `Update question bank files` when a specific summary is possible.
- Add a blank line and a short body when several areas changed.
- End with the attribution trailer required by the current session instructions (if any), after a blank line.

Pass a multi-line message from PowerShell with a single-quoted here-string (closing `'@` at column 0):

```powershell
$msg = @'
Add agent docs and content validator

Body line.

Co-Authored-By: ...
'@
powershell -ExecutionPolicy Bypass -File ".\scripts\sync-github.ps1" -Message $msg
```

## 5. Run and verify

Run the real command. Success ends with `GitHub sync complete. Local '<branch>' and 'origin/<branch>' are synchronized.` Then confirm:

```powershell
git log --oneline -3
git status -sb
```

## 6. If something fails

- Rebase conflict: the script stops and prints instructions. Show the conflicted files to the user. Resolve only conflicts in files you changed and understand; otherwise ask. Then `git add <files>` and `git rebase --continue`, or `git rebase --abort` to cancel. Re-run the script afterwards.
- Push rejected or authentication error: report the exact error; never change remotes, credentials or use `--force` without explicit permission.
- Verification failed: report the remote-only/local-only counts and `git status`.

## 7. Report

Tell the user the commit hash and subject, the files published (`git show --stat HEAD`), the remote URL and branch, and any warnings (legacy validation failures, files you left unpublished).
