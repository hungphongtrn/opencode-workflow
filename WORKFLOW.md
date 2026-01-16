# Parallel Task Orchestration Workflow

This document describes how to use the parallel task orchestration system for multi-agent task execution.

## Prerequisites

1. **Beads CLI** (`bd`) - AI-native issue tracking
2. **Beads Viewer** (`bv`) - Graph-aware triage engine
3. **OpenSpec CLI** (`openspec`) - Spec-driven development
4. **MCP Agent Mail** - Agent coordination server at `http://127.0.0.1:8765/mcp/`
5. **Git** with worktree support

## Quick Setup

```bash
# 1. Initialize beads (if not already done)
bd init

# 2. Initialize OpenSpec (if not already done)
openspec init

# 3. Install git hooks for beads
bd hooks install

# 4. Verify setup
bd doctor
openspec list
bv --robot-triage
```

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER REQUEST                                │
│         "Add user authentication feature"                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: /spec-planner                                          │
│  ├─ Create OpenSpec proposal (proposal.md, tasks.md, specs/)    │
│  ├─ Define parallelizable tasks in tasks.md                     │
│  ├─ Run openspec validate --strict                              │
│  └─ STOP - Present plan for approval                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                    [User approves]
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: /populate-task                                         │
│  ├─ Parse tasks.md and count unchecked tasks                    │
│  ├─ Choose mode based on task count:                            │
│  │   ├─ 1-4 tasks: Sequential (direct population)               │
│  │   └─ 5+ tasks: Parallel Phase Population                     │
│  │       ├─ Identify phases from ## sections                    │
│  │       ├─ Spawn /task-populator agents per phase              │
│  │       │   ├─ Agent 1: Phase 1 (deep codebase analysis)       │
│  │       │   ├─ Agent 2: Phase 2 (deep codebase analysis)       │
│  │       │   └─ Agent N: Phase N (deep codebase analysis)       │
│  │       └─ Collect results, add cross-phase dependencies       │
│  ├─ Run bv --robot-insights for validation                      │
│  └─ Report created issues and dependency graph                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: /batch-orchestration                                   │
│  ├─ Run bv --robot-plan for parallel tracks                     │
│  ├─ Select up to 4 non-conflicting tasks                        │
│  ├─ Present batch for approval                                  │
│  └─ Spawn parallel coder agents                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│  Coder Agent 1    │ │  Coder Agent 2    │ │  Coder Agent 3    │
│  /task-execution  │ │  /task-execution  │ │  /task-execution  │
│  ├─ Claim task    │ │  ├─ Claim task    │ │  ├─ Claim task    │
│  ├─ Create wktree │ │  ├─ Create wktree │ │  ├─ Create wktree │
│  ├─ Reserve files │ │  ├─ Reserve files │ │  ├─ Reserve files │
│  ├─ Implement     │ │  ├─ Implement     │ │  ├─ Implement     │
│  ├─ Commit        │ │  ├─ Commit        │ │  ├─ Commit        │
│  └─ Report done   │ │  └─ Report done   │ │  └─ Report done   │
└───────────────────┘ └───────────────────┘ └───────────────────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: /merge-coordinator                                     │
│  ├─ Merge worktrees sequentially                                │
│  ├─ Handle conflicts (stop for complex ones)                    │
│  ├─ Run validation (lsp_diagnostics, build, tests)              │
│  ├─ Cleanup worktrees                                           │
│  └─ Close beads issues, run bd sync                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  REPEAT: More tasks remaining?                                  │
│  └─ Run /batch-orchestration again for next batch               │
└─────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Usage

### 1. Create a Spec Proposal

When you have a feature request:

```
User: "I want to add user authentication with JWT tokens"

Sisyphus: [Invokes /spec-planner skill]
- Creates openspec/changes/add-user-auth/
- Defines tasks in tasks.md
- Presents plan for approval
```

### 2. Populate Beads Issues

After reviewing and approving the plan:

```
User: "Looks good, populate the tasks"

Sisyphus: [Invokes /populate-task skill]
- Counts unchecked tasks in tasks.md
- Chooses mode:
  - 1-4 tasks: Sequential population (direct)
  - 5+ tasks: Parallel phase population (spawns /task-populator agents)
- Creates junior-dev-ready beads issues with deep codebase analysis
- Reports created issues and dependency graph
```

#### Parallel Phase Population (5+ tasks)

For larger task sets, `/populate-task` spawns parallel `/task-populator` agents:

```
┌─────────────────────────────────────────────────────────────────┐
│  /populate-task (Orchestrator)                                  │
│  ├─ Parse tasks.md into phases (## sections)                    │
│  ├─ Present phase plan for approval                             │
│  └─ Spawn parallel agents:                                      │
│      ┌─────────────────┬─────────────────┬────────────────┐     │
│      ▼                 ▼                 ▼                │     │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐            │     │
│  │Phase 1  │      │Phase 2  │      │Phase 3  │            │     │
│  │Populator│      │Populator│      │Populator│            │     │
│  │- Deep   │      │- Deep   │      │- Deep   │            │     │
│  │  analysis│     │  analysis│     │  analysis│           │     │
│  │- Code   │      │- Code   │      │- Code   │            │     │
│  │  examples│     │  examples│     │  examples│           │     │
│  │- Create │      │- Create │      │- Create │            │     │
│  │  beads  │      │  beads  │      │  beads  │            │     │
│  └────┬────┘      └────┬────┘      └────┬────┘            │     │
│       └────────────────┼────────────────┘                 │     │
│                        ▼                                  │     │
│  ├─ Collect results from all agents                       │     │
│  ├─ Add cross-phase dependencies                          │     │
│  └─ Report final dependency graph                         │     │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits of parallel population:**
- Deeper codebase analysis per task (focused context)
- Richer, self-explanatory task descriptions
- Cheaper execution agents can follow detailed instructions

### 3. Execute Tasks

After beads issues are created:

```
User: "Execute the tasks"

Sisyphus: [Invokes /batch-orchestration skill]
- Selects up to 4 ready tasks
- Presents batch for approval
- After approval, spawns parallel coder agents via task(subagent_type="OpenCode-Builder")
```

### Agent Spawning

Sisyphus uses `task()` with `subagent_type="OpenCode-Builder"` to spawn parallel agents:

```python
task(
    subagent_type="OpenCode-Builder",  # Uses google/gemini-3-flash
    description="Execute task proj-abc",
    prompt="Execute beads task proj-abc using /task-execution skill..."
)
```

**task() parameters:**
- `subagent_type`: Use `"OpenCode-Builder"` for task execution (configured with google/gemini-3-flash)
- `description`: Short task description (3-5 words)
- `prompt`: Detailed instructions for the agent

### 4. Monitor Progress

Each coder agent:
- Works in isolated worktree
- Reserves files via Agent Mail
- Commits changes independently
- Reports completion

### 5. Merge and Continue

After agents complete:
- Sisyphus merges worktrees
- Closes completed beads issues
- Reports summary
- Continues with next batch if tasks remain

## Key Commands

### Beads (Issue Tracking)
```bash
bd ready              # Show tasks ready to work
bd show <id>          # View task details
bd update <id> --status in_progress  # Claim task
bd close <id>         # Complete task
bd sync               # Sync with git
```

### Beads Viewer (Triage)
```bash
bv --robot-triage     # Get recommendations
bv --robot-plan       # Get parallel execution tracks
bv --robot-insights   # Full graph analysis
bv --robot-next       # Single top pick
```

### OpenSpec
```bash
openspec list         # Active changes
openspec list --specs # Existing specs
openspec validate <id> --strict  # Validate change
openspec archive <id> --yes      # Archive completed change
```

### Git Worktrees
```bash
git worktree list                    # List worktrees
git worktree add .worktrees/wt-<id> -b task/<id>  # Create worktree
git worktree remove .worktrees/wt-<id>       # Remove worktree
```

## Configuration

### oh-my-opencode.json

The `coder` agent and categories are configured in `.opencode/oh-my-opencode.json`:

```json
{
  "agents": {
    "coder": {
      "model": "anthropic/claude-sonnet-4-5-20250514",
      "temperature": 0.1
    }
  },
  "categories": {
    "spec-changes": {
      "model": "anthropic/claude-opus-4-5-20251101",
      "temperature": 0.2,
      "prompt_append": "Use /spec-planner skill..."
    },
    "task-execution": {
      "model": "anthropic/claude-sonnet-4-5-20250514",
      "temperature": 0.1,
      "prompt_append": "Use /task-execution skill..."
    }
  }
}
```

### Agent Mail

Configure in `.opencode/opencode.json`:

```json
{
  "mcp": {
    "mcp-agent-mail": {
      "type": "remote",
      "url": "http://127.0.0.1:8765/mcp/",
      "headers": {
        "Authorization": "Bearer <your-token>"
      },
      "enabled": true
    }
  }
}
```

## Troubleshooting

### Worktree Issues
```bash
# List all worktrees
git worktree list

# Force remove stuck worktree
git worktree remove --force .worktrees/worktree-<id>

# Prune stale references
git worktree prune
```

### Beads Sync Issues
```bash
# Check beads health
bd doctor

# Force sync
bd sync --force
```

### Agent Mail Issues
- Ensure server is running at configured URL
- Check Bearer token is valid
- Verify project is registered: `mcp-agent-mail_ensure_project`

## Best Practices

1. **Keep tasks focused** - Each task should be completable in one session
2. **Avoid file conflicts** - Don't select tasks that touch the same files
3. **Review before approval** - Always review the batch before execution
4. **Monitor progress** - Check Agent Mail for status updates
5. **Handle failures gracefully** - Failed tasks leave worktrees intact for debugging
6. **Separate planning from execution** - Use /spec-planner for planning, /populate-task for beads creation
