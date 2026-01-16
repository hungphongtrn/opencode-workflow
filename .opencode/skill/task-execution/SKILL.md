---
name: task-execution
description: |
  Execute a single beads task in an isolated git worktree with file reservation coordination.
  Use when: (1) Coder agent is spawned to execute a specific task, (2) Agent receives task ID and worktree path,
  (3) Parallel task execution is happening, (4) Need isolated environment for task implementation.
  This skill handles: worktree setup, file reservation, implementation, commit, and completion reporting.
---

# Task Execution

Execute a single beads task in an isolated git worktree with Agent Mail coordination.

## Prerequisites

- Task ID provided (e.g., `proj-abc`)
- **Orchestrator Name** provided (e.g., `BoldMarsh`) - the agent to send messages back to
- **Project Path** - Absolute path to project directory
- **Thread ID** - Agent Mail thread ID for batch coordination (optional)
- MCP Agent Mail server running at `http://127.0.0.1:8765/mcp/`
- Git repository with worktree support

## Agent Mail Coordination Principles

### Shared Identifiers (CRITICAL)
- **Mail `thread_id`** ↔ `bd-<TASK_ID>` (use beads task ID)
- **Mail subject**: `[bd-<TASK_ID>] <short description>`
- **File reservation `reason`**: `bd-<TASK_ID>`
- **Commit messages**: Include `bd-<TASK_ID>` for traceability

### Single Source of Truth
- **Beads** for task status/priority/dependencies
- **Agent Mail** for conversation, decisions, and attachments
- Always include `bd-<TASK_ID>` in message `thread_id`

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

**First, ensure project exists:**

```python
# Ensure project exists (use absolute path from Project Path)
mcp-agent-mail_ensure_project(
    human_key="<PROJECT_PATH>",  # Absolute path from your prompt
    identity_mode="directory"
)
```

**Then register agent identity:**

```python
# Register agent with auto-generated name
mcp-agent-mail_register_agent(
    project_key="<PROJECT_PATH>",
    program="opencode-coder",
    model="opencode-default",
    task_description="Executing <TASK_ID>"
)
```

**Alternative: Use macro for session setup:**

```python
# Start session with file reservations
mcp-agent-mail_macro_start_session(
    human_key="<PROJECT_PATH>",
    program="opencode-coder",
    model="opencode-default",
    task_description="Executing <TASK_ID>",
    file_reservation_paths=["src/**/*.ts"],  # Files to reserve
    file_reservation_reason="bd-<TASK_ID>"
)
```

### 4. Reserve Files

**BEFORE editing any files**, reserve them with proper conventions:

```python
# Reserve files you'll modify
mcp-agent-mail_file_reservation_paths(
    project_key="<PROJECT_PATH>",
    agent_name="<YourAgentName>",  # From register_agent response
    paths=["src/auth/*.ts", "tests/auth/*.test.ts"],  # Specific paths/globs
    ttl_seconds=3600,
    exclusive=True,
    reason="bd-<TASK_ID>"  # Use beads task ID as reason
)
```

**Key Rules:**
- Always reserve files BEFORE editing
- Use specific paths/globs, not broad patterns
- Set `exclusive=True` for files you'll edit
- Include `reason="bd-<TASK_ID>"` for traceability
- Default TTL: 3600 seconds (1 hour)

**Conflict Handling:**
If conflict detected:
1. Check who holds the reservation
2. Wait for release or send message requesting coordination
3. Do NOT proceed with conflicting edits

**Alternative: Use macro for file reservation cycle:**

```python
mcp-agent-mail_macro_file_reservation_cycle(
    project_key="<PROJECT_PATH>",
    agent_name="<YourAgentName>",
    paths=["src/**/*.ts"],
    ttl_seconds=3600,
    exclusive=True,
    reason="bd-<TASK_ID>",
    auto_release=True  # Auto-release at end
)
```

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
git commit -m "feat(bd-<TASK_ID>): <Brief description>

- <Change 1>
- <Change 2>
- <Change 3>"
```

**Commit Message Convention:**
- Include `bd-<TASK_ID>` prefix for traceability
- Use conventional commit format: `feat:`, `fix:`, `chore:`, etc.
- List specific changes in bullet points

### 7. Release Reservations

```python
# Release all held reservations
mcp-agent-mail_release_file_reservations(
    project_key="/path/to/project",
    agent_name="<YourAgentName>"
)
```

### 8. Report Completion

Send completion message to the **Orchestrator** (use the name provided in your prompt, NOT "Sisyphus"):

```python
# ORCHESTRATOR_NAME is provided in your task prompt (e.g., "BoldMarsh")
mcp-agent-mail_send_message(
    project_key="<PROJECT_PATH>",
    sender_name="<YourAgentName>",
    to=["<ORCHESTRATOR_NAME>"],  # Use the name from your prompt!
    subject="[bd-<TASK_ID>] Task Complete",
    thread_id="bd-<TASK_ID>",  # Use beads task ID as thread ID
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

**Message Requirements:**
- Subject: `[bd-<TASK_ID>] <short description>`
- Thread ID: `bd-<TASK_ID>` (use beads task ID)
- Importance: `normal` (default)
- Include: Task ID, Commit SHA, Files Changed, Summary, Blockers

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
3. Send failure message with `importance="high"`:

```python
# ORCHESTRATOR_NAME is provided in your task prompt (e.g., "BoldMarsh")
mcp-agent-mail_send_message(
    project_key="<PROJECT_PATH>",
    sender_name="<YourAgentName>",
    to=["<ORCHESTRATOR_NAME>"],
    subject="[bd-<TASK_ID>] Task FAILED",
    thread_id="bd-<TASK_ID>",
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

**Failure Message Requirements:**
- Subject: `[bd-<TASK_ID>] Task FAILED`
- Thread ID: `bd-<TASK_ID>` (use beads task ID)
- Importance: `high` (for priority handling)
- Include: Failure reason, attempted actions, partial progress

## Beads Integration Patterns

### Task Lifecycle Management

**Complete Workflow:**
```bash
# 1. Claim task
bd update <TASK_ID> --status in_progress

# 2. Read details
bd show <TASK_ID>

# 3. Execute (in worktree)
# ... implementation ...

# 4. Orchestrator closes after merge
bd close <TASK_ID>

# 5. Sync to git
bd sync
```

**Dependency Management:**
- Tasks created with dependencies via `bd dep add <child-id> <parent-id>`
- Use `bv --robot-plan` to identify parallel execution tracks
- Maximum 4 parallel tasks per batch

### Beads Viewer Integration

**Task Analysis Commands:**
```bash
bv --robot-triage     # Get recommendations for ready tasks
bv --robot-plan       # Identify parallel execution tracks (max 4)
bv --robot-insights   # Full graph analysis for validation
bv --robot-next       # Single top pick for sequential execution
```

**Validation:**
- Run `bv --robot-insights` before execution to validate dependency graph
- Use `bv --robot-plan` to ensure non-conflicting task selection

## Agent Mail Best Practices

### File Reservation Guidelines

1. **Specificity**: Use specific paths/globs, not `**/*`
2. **Exclusivity**: `exclusive=True` for editing, `False` for observation
3. **TTL Management**: Default 3600s, adjust based on task complexity
4. **Reason Tracking**: Always include `reason="bd-<TASK_ID>"`
5. **Conflict Resolution**: Wait, request release, or report to orchestrator

### Communication Patterns

**Thread Management:**
- Use `thread_id="bd-<TASK_ID>"` consistently
- Keep all related messages in same thread
- Subject format: `[bd-<TASK_ID>] <description>`

**Importance Levels:**
- `normal`: Task completion, status updates
- `high`: Task failures, blockers requiring attention
- `urgent`: Critical issues needing immediate response

### Macros for Efficiency

**Session Setup:**
```python
mcp-agent-mail_macro_start_session(
    human_key="<PROJECT_PATH>",
    program="opencode-coder",
    model="opencode-default",
    task_description="Executing <TASK_ID>",
    file_reservation_paths=["src/**/*.ts"],
    file_reservation_reason="bd-<TASK_ID>"
)
```

**File Reservation Cycle:**
```python
mcp-agent-mail_macro_file_reservation_cycle(
    project_key="<PROJECT_PATH>",
    agent_name="<YourAgentName>",
    paths=["src/**/*.ts"],
    ttl_seconds=3600,
    exclusive=True,
    reason="bd-<TASK_ID>",
    auto_release=True
)
```

## Important Rules

- **Stay focused**: Only implement the assigned task
- **No scope creep**: If you discover related work, note it but don't do it
- **Always reserve**: Never edit files without reservation
- **Always release**: Release reservations even on failure
- **Always report**: Send completion/failure message to the **Orchestrator** (name provided in your prompt)
- **Shared identifiers**: Always use `bd-<TASK_ID>` for thread_id, subject prefix, and reservation reason
- **Single source of truth**: Beads for status, Agent Mail for coordination
