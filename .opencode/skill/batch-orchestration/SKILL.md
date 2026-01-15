---
name: batch-orchestration
description: |
  Orchestrate parallel execution of ready beads tasks using multiple coder agents in isolated worktrees.
  Use when: (1) User requests to execute pending tasks, (2) User says "execute tasks", "run batch", "start work",
  (3) After spec-planner has created tasks and user approved, (4) Need to parallelize task execution.
  This skill: selects tasks, gets approval, spawns parallel agents, collects results, triggers merge.
---

# Batch Orchestration

Orchestrate parallel execution of ready beads tasks.

## Workflow

### 1. Analyze Ready Tasks

```bash
# Get triage recommendations
bv --robot-triage

# Get parallel execution plan
bv --robot-plan

# List ready tasks (no blockers)
bd ready
```

### 2. Select Tasks for Batch

Select up to **4 tasks** that:
- Have no unresolved dependencies
- Don't conflict on file paths
- Are from different parallel tracks (if possible)

```bash
# Check task details
bd show <task-id>
```

### 3. Present for Approval

**STOP and present to user:**

```markdown
## Batch Execution Plan

### Selected Tasks (4 max):
| # | Task ID | Title | Priority | Files Affected |
|---|---------|-------|----------|----------------|
| 1 | proj-abc | Create auth middleware | P1 | src/auth/* |
| 2 | proj-def | Add login endpoint | P1 | src/api/login.ts |
| 3 | proj-ghi | Create user model | P1 | src/models/user.ts |
| 4 | proj-jkl | Add validation utils | P2 | src/utils/validate.ts |

### Parallel Tracks:
- Track 1: proj-abc (independent)
- Track 2: proj-def (independent)
- Track 3: proj-ghi (independent)
- Track 4: proj-jkl (independent)

### Estimated Duration: ~15-30 minutes

**Approve execution? (yes/no)**
```

Wait for explicit "yes" before proceeding.

### 4. Setup Agent Mail

```python
# Ensure project exists
mcp-agent-mail_ensure_project(
    human_key="/absolute/path/to/project"
)

# Register as orchestrator
mcp-agent-mail_register_agent(
    project_key="/absolute/path/to/project",
    program="opencode",
    model="claude-opus-4-5",
    task_description="Batch Orchestrator"
)
```

### 5. Spawn Parallel Agents

Spawn ALL agents in a **single response** for parallel execution using `sisyphus_task`:

```python
# Agent 1 - using category for task-execution
sisyphus_task(
    category="task-execution",
    description="Execute task proj-abc",
    prompt="""
Execute beads task proj-abc using /task-execution skill.

Task ID: proj-abc
Worktree Path: ../worktree-proj-abc
Project Path: /absolute/path/to/project

Follow the /task-execution skill workflow:
1. Claim task with bd update
2. Create worktree
3. Register with Agent Mail
4. Reserve files before editing
5. Implement the task
6. Commit changes
7. Release reservations
8. Send completion message
9. Report back with: task ID, commit SHA, files changed
"""
)

# Agent 2 - using category
sisyphus_task(
    category="task-execution",
    description="Execute task proj-def",
    prompt="..."  # Similar prompt for proj-def
)

# Agent 3 and 4 similarly...

# Alternative: Use specific agent instead of category
sisyphus_task(
    agent="coder",
    description="Execute task proj-ghi",
    prompt="..."
)
```

**sisyphus_task parameters:**
- `category`: Use predefined category (e.g., "task-execution", "spec-changes")
- `agent`: Use specific agent (e.g., "coder", "oracle", "librarian")
- `description`: Short task description
- `prompt`: Detailed instructions for the agent

### 6. Collect Results

Wait for all agents to complete. Collect:
- Task IDs completed
- Commit SHAs
- Files changed per task
- Any failures or blockers

### 7. Trigger Merge

After all agents complete successfully:

```
Invoke /merge-coordinator skill with:
- List of completed worktrees
- Commit SHAs
- Task IDs
```

### 8. Update Beads

```bash
# Close completed tasks
bd close <task-id-1> <task-id-2> <task-id-3> <task-id-4>

# Sync with git
bd sync
```

### 9. Report Summary

```markdown
## Batch Execution Complete

### Results:
| Task ID | Status | Commit | Files Changed |
|---------|--------|--------|---------------|
| proj-abc | ✅ Complete | a1b2c3d | 3 files |
| proj-def | ✅ Complete | e4f5g6h | 2 files |
| proj-ghi | ✅ Complete | i7j8k9l | 1 file |
| proj-jkl | ❌ Failed | - | - |

### Merge Status: Success (3/4 merged)

### Failed Tasks:
- proj-jkl: <failure reason>

### Next Steps:
- Run `bd ready` to see remaining tasks
- Run `/batch-orchestration` for next batch
```

## Failure Handling

### Agent Failure
If an agent fails:
1. Note the failure reason
2. Continue with other agents
3. Leave failed task's worktree intact
4. Report failure in summary
5. Do NOT close failed task in beads

### Merge Conflict
If merge fails:
1. Stop merge process
2. Report conflict details
3. Request human intervention
4. Provide diff context

## Important Rules

- **Max 4 agents**: Never spawn more than 4 parallel agents
- **User approval required**: Always wait for explicit approval
- **No file conflicts**: Ensure selected tasks don't touch same files
- **All in one response**: Spawn all agents in single response for parallelism
- **Always sync**: Run `bd sync` after closing tasks
