# GSD Parallel Execution Integration

## What This Is

A workflow system that combines GSD's superior planning UX (PROJECT.md → ROADMAP.md → PLAN.md) with parallel multi-agent execution using git worktrees and Agent Mail coordination. This replaces the existing OpenSpec-based workflow with a streamlined approach that eliminates beads task tracking in favor of PLAN.md as the single source of truth for tasks.

## Core Value

Parallel agent execution with proper isolation (worktrees) and coordination (Agent Mail) while maintaining GSD's intuitive planning flow — no sync issues between multiple tracking systems.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Remove OpenSpec infrastructure (openspec/, spec-planner skill, openspec commands)
- [ ] Remove beads integration from workflow (.beads/, batch-orchestration references)
- [ ] Modify plan-phase.md to work without beads task population
- [ ] Modify execute-phase.md to use git worktrees for parallel execution
- [ ] Integrate Agent Mail for file reservation and agent coordination
- [ ] Implement merge-coordinator flow at end of execute-phase
- [ ] Update AGENTS.md to reflect new workflow (remove OpenSpec/beads roles)
- [ ] Update gsd-executor agent to work in worktrees with Agent Mail
- [ ] Ensure wave-based parallelism from PLAN.md frontmatter drives execution
- [ ] Clean up unused skills (batch-orchestration, task-execution, coder, populator, etc.)

### Out of Scope

- Beads task tracking — eliminated in favor of PLAN.md as source of truth
- OpenSpec proposal workflow — replaced by GSD planning flow
- Cross-phase task dependencies — phases are sequential, tasks parallel within phase
- beads-viewer integration — no longer needed without beads

## Context

**Current state:**
- OpenSpec workflow exists but provides inferior UX compared to GSD
- Beads + beads-viewer infrastructure exists for task tracking
- Git worktree parallel execution works via batch-orchestration skill
- Agent Mail (MCP) provides file reservation and inter-agent messaging
- GSD commands exist in both `.opencode/command/gsd/` and `get-shit-done/commands/gsd/`

**Technical environment:**
- OpenCode CLI (Claude Code fork)
- MCP Agent Mail server at `http://127.0.0.1:8765/mcp/`
- Git worktrees for isolated parallel execution
- Markdown-based skills and commands

**Key insight:**
The complexity of keeping beads in sync with PLAN.md isn't worth it. PLAN.md already has tasks, waves, and dependencies. Git commits + SUMMARY.md existence = completion status. Agent Mail handles coordination.

## Constraints

- **Compatibility**: Must work with existing GSD commands from get-shit-done/
- **Agent Mail**: Required for file reservation to prevent parallel edit conflicts
- **Worktree isolation**: Each parallel agent works in its own worktree
- **Wave-based execution**: Waves in PLAN.md frontmatter determine parallel batches

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Drop beads | PLAN.md is sufficient for task tracking; eliminates sync complexity | — Pending |
| Drop OpenSpec | GSD provides better planning UX | — Pending |
| Keep Agent Mail | File reservation essential for parallel execution without conflicts | — Pending |
| Keep git worktrees | Proven isolation mechanism for parallel agents | — Pending |
| PLAN.md as task source | Single source of truth; no translation layer needed | — Pending |

---
*Last updated: 2026-01-18 after initialization*
