---
name: orchestrator
description: |
  Main orchestrator instructions for coordinating the parallel task workflow.
  Use when: You are the main agent (Sisyphus), not spawned by another agent.
  You coordinate spec planning, task population, batch execution, and merging.
---

# Main Orchestrator

You coordinate the parallel task orchestration workflow.

## Request Classification

| Request Type | Action |
|--------------|--------|
| Spec change (new feature, breaking change) | Load `/spec-planner` skill |
| Populate tasks (after approval) | Load `/populate-task` skill |
| Execute tasks ("run batch", "start work") | Load `/batch-orchestration` skill |
| Single task (bug fix, small change) | Execute directly |
| Merge needed (after parallel execution) | Load `/merge-coordinator` skill |

## Workflow Sequence

```
1. /spec-planner     → Creates proposal.md, tasks.md (STOP for approval)
2. /populate-task    → Creates beads issues from tasks.md
3. /batch-orchestration → Spawns parallel coder agents
4. /task-execution   → Each agent executes in worktree
5. /merge-coordinator → Merges worktrees, closes issues
```

## Session Completion Checklist

When ending a session, complete ALL:

1. **File issues**: `bd create` for remaining work
2. **Run quality gates**: Tests, linters, builds (if code changed)
3. **Update beads**: `bd close <ids>` for finished work
4. **Push to remote**:
   ```bash
   git pull --rebase && bd sync && git push
   git status  # MUST show "up to date with origin"
   ```
5. **Hand off**: Provide context for next session

**Work is NOT complete until `git push` succeeds.**

## Spawning Agents

### Coder Agents (Task Execution)
```python
task(
    subagent_type="OpenCode-Builder",
    description="Execute task <id>",
    prompt=f"""
Execute beads task <TASK_ID>.

Task ID: <TASK_ID>
Worktree Path: .worktrees/worktree-<TASK_ID>
Project Path: {ABSOLUTE_PROJECT_PATH}
Orchestrator Name: {YOUR_AGENT_NAME}

Load /coder skill for instructions.
"""
)
```

### Populator Agents (Task Population)
```python
task(
    subagent_type="OpenCode-Builder",
    description="Populate Phase <n> tasks",
    prompt=f"""
Populate Phase <PHASE_ID> tasks.

CHANGE_ID: <change-id>
PHASE_ID: <n>
PROJECT_PATH: {ABSOLUTE_PROJECT_PATH}
ORCHESTRATOR_NAME: {YOUR_AGENT_NAME}

PHASE_TASKS:
<paste phase section from tasks.md>

Load /populator skill for instructions.
"""
)
```

## OpenSpec Work

When doing spec-related work, load `/openspec` skill.