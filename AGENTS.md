# Parallel Task Orchestration Workflow

This project uses a multi-agent parallel execution system. Read `@/openspec/project.md` for project-specific context.

## Request Classification

When receiving a request, classify it:

| Request Type | Action |
|--------------|--------|
| **Spec change** (new feature, breaking change, architecture) | Invoke `/spec-planner` skill |
| **Task execution** ("execute tasks", "run batch", "start work") | Invoke `/batch-orchestration` skill |
| **Single task** (bug fix, small change) | Execute directly |
| **Merge needed** (after parallel execution) | Invoke `/merge-coordinator` skill |

## Skills Available

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/spec-planner` | Spec changes, feature requests | Create OpenSpec proposal + beads tasks |
| `/batch-orchestration` | Execute pending tasks | Spawn parallel coder agents |
| `/task-execution` | Coder agent receives task | Execute in isolated worktree |
| `/merge-coordinator` | After batch completion | Merge worktrees safely |

## For Coder Agents (Subagents)

If you are a coder agent spawned via `sisyphus_task`:

1. **You have ONE task** - Focus only on your assigned task ID
2. **Use worktree** - Work in `../worktree-<task-id>`, not main repo
3. **Reserve files** - Call `mcp-agent-mail_file_reservation_paths` before editing
4. **Commit in worktree** - `git commit` in your worktree only
5. **Report back** - Send completion message via Agent Mail, then return results
6. **Do NOT merge** - Sisyphus handles merging

## Quick Reference

### Beads (Issue Tracking)
```bash
bd ready                    # Find unblocked work
bd show <id>                # View task details
bd update <id> --status in_progress  # Claim task
bd close <id>               # Complete task
bd sync                     # Sync with git
```

### Beads Viewer (Triage)
```bash
bv --robot-triage           # Get recommendations
bv --robot-plan             # Get parallel execution tracks
bv --robot-next             # Single top pick
```

### Spawning Parallel Agents
```python
sisyphus_task(
    agent="OpenCode-Builder",
    description="Execute task <id>",
    prompt="Execute beads task <id> using /task-execution skill..."
)
```

## Session Completion

**When ending a work session**, complete ALL steps:

1. **File issues** - `bd create` for remaining work
2. **Run quality gates** - Tests, linters, builds (if code changed)
3. **Update beads** - `bd close <ids>` for finished work
4. **Push to remote**:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Hand off** - Provide context for next session

**Work is NOT complete until `git push` succeeds.**
