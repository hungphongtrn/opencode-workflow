# Feature Landscape: Orchestration Safety

**Domain:** Multi-agent development systems
**Researched:** 2026-01-18

## Table Stakes (Expected Safety)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Worktree Isolation | Prevent agents from seeing each other's unstaged changes. | Low | Native git feature. |
| File Reservation | Prevent two agents from editing the same file. | Medium | Requires Agent Mail coordination. |
| Wave Execution | Manage dependencies between tasks. | Low | Sequential waves of parallel tasks. |

## Differentiators (Advanced Safety)

| Feature | Why Valuable | Complexity | Notes |
|---------|-------------------|------------|-------|
| Deadlock Detection | Prevents circular reservation waits. | High | Requires cycle detection or resource ordering. |
| Semantic Validation | Detects logic breaks that don't cause git conflicts. | High | Requires post-merge test execution. |
| Auto-Replanning | Dynamically splits/reassigns straggler tasks. | High | Core orchestration intelligence. |

## Anti-Features (Avoid)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Direct PLAN.md Writes | Race conditions and corruption. | Agents send "Request Update" messages to Orchestrator. |
| Shared Worktrees | Concurrent index locks will kill the process. | One worktree per agent/task. |

## MVP Recommendation
For MVP, prioritize:
1. Basic Worktree management (create/remove).
2. Simple Agent Mail reservation (locking/unlocking).
3. Serialized PLAN.md updates by the Orchestrator.
