---
name: task-execution
description: |
  Execute a single beads task in an isolated git worktree with file reservation coordination.
  Use when: (1) Coder agent is spawned to execute a specific task, (2) Agent receives task ID and worktree path,
  (3) Parallel task execution is happening, (4) Need isolated environment for task implementation.
  This skill handles: worktree setup, file reservation, implementation, commit, and completion reporting.
---

# Task Execution

Execute a single beads task in an isolated git worktree.

## Prerequisites

- Task ID provided (e.g., `opencode-workflow-abc`)
- MCP Agent Mail server running at `http://127.0.0.1:8765/mcp/`
- Git repository with worktree support

## Workflow

### 1. Claim Task

```bash
# Claim the task
bd update <TASK_ID> --status in_progress

# Read task details
bd show <TASK_ID>
```

### 2. Setup Worktree

```bash
# Create isolated worktree INSIDE the repo
WORKTREE_PATH=".worktrees/worktree-<TASK_ID>"
mkdir -p .worktrees
git worktree add $WORKTREE_PATH -b task/<TASK_ID>

# Change to worktree
cd $WORKTREE_PATH
```

### 3. Register with Agent Mail

```python
# Register agent identity
mcp-agent-mail_register_agent(
    project_key="/path/to/project",
    program="opencode-coder",
    model="opencode-default",
    task_description="Executing <TASK_ID>"
)
```

### 4. Reserve Files

Before editing any files, reserve them:

```python
# Reserve files you'll modify
mcp-agent-mail_file_reservation_paths(
    project_key="/path/to/project",
    agent_name="<YourAgentName>",
    paths=["src/auth/*.ts", "tests/auth/*.test.ts"],
    ttl_seconds=3600,
    exclusive=True,
    reason="Implementing <TASK_ID>"
)
```

If conflict detected:
1. Check who holds the reservation
2. Wait for release or send message requesting coordination
3. Do NOT proceed with conflicting edits

### 5. Implement Task

Create local todos and implement:

```markdown
## Task: <TASK_ID>
- [ ] Read existing code patterns
- [ ] Implement core functionality
- [ ] Add error handling
- [ ] Run lsp_diagnostics
- [ ] Write/update tests if applicable
```

Guidelines:
- Follow existing codebase patterns
- Keep changes focused on the task scope
- Run `lsp_diagnostics` on all changed files
- Fix any errors before proceeding

### 6. Commit Changes

```bash
# Stage and commit
git add .
git commit -m "feat(<TASK_ID>): <Brief description>

- <Change 1>
- <Change 2>
- <Change 3>"
```

### 7. Release Reservations

```python
# Release all held reservations
mcp-agent-mail_release_file_reservations(
    project_key="/path/to/project",
    agent_name="<YourAgentName>"
)
```

### 8. Report Completion

Send completion message to Sisyphus:

```python
mcp-agent-mail_send_message(
    project_key="/path/to/project",
    sender_name="<YourAgentName>",
    to=["Sisyphus"],
    subject="Task <TASK_ID> Complete",
    body_md="""
## Task Completed: <TASK_ID>

**Commit SHA**: <sha>
**Files Changed**:
- src/auth/middleware.ts
- tests/auth/middleware.test.ts

**Summary**: <What was implemented>

**Blockers**: None
"""
)
```

### 9. Return to Orchestrator

Report back with:
- Task ID
- Commit SHA
- List of files changed
- Any blockers or issues encountered
- Worktree path for merge

## Failure Handling

If task cannot be completed:

1. Document the failure reason
2. Release file reservations
3. Send failure message:

```python
mcp-agent-mail_send_message(
    project_key="/path/to/project",
    sender_name="<YourAgentName>",
    to=["Sisyphus"],
    subject="Task <TASK_ID> FAILED",
    importance="high",
    body_md="""
## Task Failed: <TASK_ID>

**Reason**: <Why it failed>
**Attempted**: <What was tried>
**Partial Progress**: <Any commits made>
**Worktree**: Left intact for debugging
"""
)
```

4. Leave worktree intact for debugging
5. Report failure to orchestrator

## Important Rules

- **Stay focused**: Only implement the assigned task
- **No scope creep**: If you discover related work, note it but don't do it
- **Always reserve**: Never edit files without reservation
- **Always release**: Release reservations even on failure
- **Always report**: Send completion/failure message to Sisyphus
