# Parallel Task Orchestration Workflow

This project uses a multi-agent parallel execution system.

---

## Read This If You Are...

### 🎯 The Main Orchestrator (Sisyphus)
**You coordinate the entire workflow.** Jump to: [Request Classification](#request-classification)

### 🔨 A Coder Agent (Subagent)
**You were spawned to execute ONE task.** Jump to: [For Coder Agents](#for-coder-agents-subagents)

### 📝 A Task Populator Agent
**You were spawned to populate ONE phase of tasks.** Jump to: [For Task Populator Agents](#for-task-populator-agents)

### 🔍 Looking for Commands
**You need CLI reference.** Jump to: [Quick Reference](#quick-reference)

---

# For Main Orchestrator

## Request Classification

When receiving a request, classify it:

| Request Type | Action |
|--------------|--------|
| **Spec change** (new feature, breaking change, architecture) | Invoke `/spec-planner` skill |
| **Populate tasks** (after spec approval, "create beads", "load tasks") | Invoke `/populate-task` skill |
| **Task execution** ("execute tasks", "run batch", "start work") | Invoke `/batch-orchestration` skill |
| **Single task** (bug fix, small change) | Execute directly |
| **Merge needed** (after parallel execution) | Invoke `/merge-coordinator` skill |

## Workflow Sequence

```
1. /spec-planner     → Creates proposal.md, tasks.md, specs/ (STOP for approval)
2. /populate-task    → Parses tasks.md, creates beads issues with full descriptions
3. /batch-orchestration → Selects ready tasks, spawns parallel agents
4. /task-execution   → Each agent executes one task in worktree
5. /merge-coordinator → Merges worktrees, closes issues
```

## Skills Available

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/spec-planner` | Spec changes, feature requests | Create OpenSpec proposal + tasks.md (NO beads) |
| `/populate-task` | After spec approval, "populate tasks" | Load tasks.md into beads with junior-dev-ready descriptions |
| `/task-populator` | Spawned by /populate-task | Populate ONE phase with deep codebase analysis |
| `/batch-orchestration` | Execute pending tasks | Spawn parallel coder agents |
| `/task-execution` | Coder agent receives task | Execute in isolated worktree |
| `/merge-coordinator` | After batch completion | Merge worktrees safely |

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

---

# For Coder Agents (Subagents)

**You were spawned via `task(subagent_type="OpenCode-Builder")` to execute ONE task.**

## Your Constraints

1. **ONE task only** - Focus only on your assigned task ID
2. **Use worktree** - Work in `.worktrees/worktree-<task-id>`, not main repo
3. **Reserve files** - Call `mcp-agent-mail_file_reservation_paths` before editing
4. **Commit in worktree** - `git commit` in your worktree only
5. **Report back** - Send completion message via Agent Mail to your **Orchestrator** (name provided in your prompt)
6. **Do NOT merge** - Orchestrator handles merging

## Your Workflow

```
1. Claim task: bd update <TASK_ID> --status in_progress
2. Read task: bd show <TASK_ID>
3. Create worktree: git worktree add .worktrees/worktree-<TASK_ID> -b task/<TASK_ID>
4. Register with Agent Mail
5. Reserve files before editing
6. Implement (follow task description exactly)
7. Commit changes
8. Release file reservations
9. Send completion message to Orchestrator
10. Return results
```

## Invoke Skill

Load `/task-execution` skill for detailed instructions.

---

# For Task Populator Agents

**You were spawned via `task(subagent_type="general")` to populate ONE phase of tasks.**

## Your Constraints

1. **ONE phase only** - Focus only on your assigned phase
2. **Deep analysis** - Spend time finding real code examples from THIS codebase
3. **Self-explanatory** - Each beads issue must be junior-dev-ready
4. **Report back** - Send completion message via Agent Mail to your **Orchestrator**

## Your Workflow

```
1. Load context (proposal.md, design.md)
2. For each task in your phase:
   - Search codebase for similar implementations
   - Find code examples to reference
   - Create comprehensive beads issue with bd create
3. Report created IDs to Orchestrator
```

## Invoke Skill

Load `/task-populator` skill for detailed instructions.

---

# Quick Reference

## Beads (Issue Tracking)
```bash
bd ready                    # Find unblocked work
bd show <id>                # View task details
bd update <id> --status in_progress  # Claim task
bd close <id>               # Complete task
bd sync                     # Sync with git
```

## Beads Viewer (Triage)
```bash
bv --robot-triage           # Get recommendations
bv --robot-plan             # Get parallel execution tracks
bv --robot-next             # Single top pick
```

## OpenSpec
```bash
openspec list               # Active changes
openspec list --specs       # Existing specs
openspec validate <id> --strict  # Validate change
```

## Git Worktrees
```bash
git worktree list                              # List worktrees
git worktree add .worktrees/wt-<id> -b task/<id>  # Create worktree
git worktree remove .worktrees/wt-<id>         # Remove worktree
```

## Spawning Parallel Agents

### For Task Execution (Coder Agents)
```python
task(
    subagent_type="OpenCode-Builder",  # Uses google/gemini-3-flash
    description="Execute task <id>",
    prompt="Execute beads task <id> using /task-execution skill..."
)
```

### For Task Population (Populator Agents)
```python
task(
    subagent_type="general",
    description="Populate Phase <n> tasks",
    prompt="Populate Phase <n> tasks using /task-populator skill..."
)
```

---

# Project Context

Read `@/openspec/project.md` for project-specific conventions and context.
