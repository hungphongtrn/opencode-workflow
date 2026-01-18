# Domain Pitfalls: Multi-Agent Orchestration

**Domain:** Parallel Agent Execution
**Researched:** 2026-01-18

## Critical Pitfalls

### Pitfall 1: Concurrent File Modification (The "Overwrite" Bug)
**What goes wrong:** Two agents in the same wave edit the same file (e.g., `package.json`). The last one to commit wins, or git merge conflicts break the orchestrator.
**Prevention:** Strict **File Reservation** via Agent Mail. Agents must "check out" files before editing.
**Detection:** Git merge conflicts during worktree integration.

### Pitfall 2: Planning/Execution Desync
**What goes wrong:** The orchestrator spawns agents for a plan, but the user modifies the plan file mid-execution.
**Prevention:** **Snapshotted Execution.** Orchestrator should read the plan once and pass a copy (or specific task IDs) to agents.
**Detection:** Agent reports task completion for a task that no longer exists in `PLAN.md`.

### Pitfall 3: Worktree Proliferation
**What goes wrong:** Abandoned git worktrees clutter the disk and slow down git operations after failed agent runs.
**Prevention:** **Lifecycle Hooks.** Orchestrator must use `try/finally` blocks to ensure `git worktree remove` is called even on failure.
**Detection:** `git worktree list` shows dozens of paths that don't exist.

## Moderate Pitfalls

### Pitfall 1: Opaque Failures
**What goes wrong:** A subagent fails in a worktree, and the main orchestrator just says "Task failed" without showing logs.
**Prevention:** **Log Forwarding.** Agents must write to a shared log or the orchestrator must tail the subagent output.
**Detection:** Need to manually `cd` into a worktree to see why it failed.

### Pitfall 2: Inefficient Wave Packing
**What goes wrong:** All tasks are in Wave 1, but they have hidden dependencies, leading to broken code.
**Prevention:** **Planner Education.** `gsd-planner` must be instructed to only pack independent tasks into the same wave.
**Detection:** Repeated build failures in parallel waves that work fine sequentially.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Cleanup** | Deleting beads logic that is still used by GSD. | Grep for all `.beads` and `Task` tool references. |
| **Agent Mail** | Server unavailability blocking execution. | Implement graceful fallback to sequential execution if MCP is down. |
| **Worktrees** | Permission issues in CI/CD or specific OS. | Verify `git worktree` support in target environment. |

## Sources
- Git Worktree documentation
- Parallel processing design patterns
- Experience from `batch-orchestration` skill usage
