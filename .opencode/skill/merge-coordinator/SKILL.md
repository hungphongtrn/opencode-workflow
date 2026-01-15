---
name: merge-coordinator
description: |
  Safely merge completed worktrees back into the main branch after parallel task execution.
  Use when: (1) Batch orchestration has completed and agents have committed to worktrees,
  (2) Need to merge multiple worktrees sequentially, (3) Need to handle merge conflicts,
  (4) After parallel task execution is done. This skill handles: sequential merging, conflict detection, cleanup.
---

# Merge Coordinator

Safely merge completed worktrees into the current branch.

## Prerequisites

- List of completed worktrees with commit SHAs
- All coder agents have finished and released file reservations
- Current branch is the target for merges

## Workflow

### 1. Verify Worktrees

```bash
# List all worktrees
git worktree list

# Verify each completed worktree exists
ls .worktrees/worktree-<task-id>
```

### 2. Pre-Merge Checks

For each worktree:
```bash
# Check the commit
cd .worktrees/worktree-<task-id>
git log -1 --oneline

# Verify clean state
git status
```

### 3. Sequential Merge

Merge worktrees **one at a time** (not parallel):

```bash
# Return to main worktree
cd /path/to/main/repo

# Merge first worktree
git merge task/<task-id-1> --no-ff -m "Merge task/<task-id-1>: <description>"

# Run diagnostics after merge
# Use lsp_diagnostics on changed files

# If successful, continue to next
git merge task/<task-id-2> --no-ff -m "Merge task/<task-id-2>: <description>"

# Continue for all worktrees...
```

### 4. Conflict Handling

If merge conflict occurs:

```bash
# Check conflict status
git status

# Show conflicting files
git diff --name-only --diff-filter=U
```

**For trivial conflicts** (whitespace, import order):
```bash
# Attempt auto-resolution
git checkout --theirs <file>  # or --ours
git add <file>
git commit -m "Merge task/<id>: resolved conflict in <file>"
```

**For complex conflicts**:
1. STOP the merge process
2. Report to user with full context:

```markdown
## Merge Conflict Detected

**Task**: <task-id>
**Conflicting Files**:
- src/auth/middleware.ts

**Conflict Details**:
\`\`\`diff
<<<<<<< HEAD
// Current branch code
=======
// Incoming worktree code
>>>>>>> task/<task-id>
\`\`\`

**Options**:
1. Keep current (HEAD) version
2. Keep incoming (task) version
3. Manual resolution needed

**Please advise how to proceed.**
```

3. Wait for user decision before continuing

### 5. Post-Merge Validation

After each successful merge:

```bash
# Run lsp_diagnostics on merged files
lsp_diagnostics <changed-files>

# If project has build command
npm run build  # or equivalent

# If project has test command
npm test  # or equivalent
```

If validation fails:
1. Report the failure
2. Consider reverting: `git revert HEAD`
3. Request human intervention

### 6. Cleanup Worktrees

After successful merge:

```bash
# Remove the worktree
git worktree remove .worktrees/worktree-<task-id>

# Optionally delete the branch
git branch -d task/<task-id>
```

### 7. Final Report

```markdown
## Merge Complete

### Merged Worktrees:
| Task ID | Branch | Status | Commit |
|---------|--------|--------|--------|
| proj-abc | task/proj-abc | ✅ Merged | a1b2c3d |
| proj-def | task/proj-def | ✅ Merged | e4f5g6h |
| proj-ghi | task/proj-ghi | ⚠️ Conflict | - |
| proj-jkl | task/proj-jkl | ✅ Merged | m0n1o2p |

### Validation:
- LSP Diagnostics: ✅ Pass
- Build: ✅ Pass
- Tests: ✅ Pass (or N/A)

### Cleanup:
- Worktrees removed: 3
- Branches deleted: 3

### Conflicts Requiring Attention:
- proj-ghi: Conflict in src/models/user.ts (awaiting resolution)

### Final Commit: <merge-commit-sha>
```

## Error Recovery

### Revert Failed Merge
```bash
# If merge introduced bugs
git revert HEAD

# Or reset to before merges
git reset --hard <pre-merge-sha>
```

### Orphaned Worktrees
```bash
# List all worktrees
git worktree list

# Force remove if needed
git worktree remove --force .worktrees/worktree-<id>

# Prune stale worktree references
git worktree prune
```

## Important Rules

- **Sequential only**: Merge one worktree at a time
- **Validate after each**: Run diagnostics after every merge
- **Stop on complex conflict**: Don't auto-resolve non-trivial conflicts
- **Always cleanup**: Remove worktrees after successful merge
- **Report everything**: Provide detailed status for each worktree
