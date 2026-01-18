# Get-Shit-Done vs OpenCode Workflow: Comprehensive Comparison

> **Generated**: 2026-01-18
> **Purpose**: Evaluate whether GSD can replace current workflow and integration strategies

## Executive Summary

| Aspect | Get-Shit-Done (GSD) | Current OpenCode Workflow |
|--------|---------------------|---------------------------|
| **Philosophy** | Solo developer + Claude, anti-enterprise | Multi-agent orchestration, parallel execution |
| **Task Storage** | File-based (`.planning/` markdown files) | Database-backed (Beads SQLite + JSON) |
| **Parallel Execution** | Wave-based within phases, subagent spawning | Worktree-based isolation, up to 4 concurrent |
| **State Management** | `STATE.md` + `ROADMAP.md` + `SUMMARY.md` | Beads issues + OpenSpec proposals |
| **Context Engineering** | Aggressive context management, fresh subagents | Similar pattern with skill-based delegation |
| **Verification** | Built-in phase verification, UAT workflow | `lsp_diagnostics` + build/test validation |

## Detailed Comparison

### 1. Task Definition & Storage

| Feature | GSD | OpenCode Workflow |
|---------|-----|-------------------|
| **Task Format** | XML-structured `<task>` in PLAN.md | Beads issues with JSON/SQLite |
| **Dependencies** | Wave numbers in frontmatter | Graph-based via `bd dep add` |
| **Granularity** | 2-3 tasks per plan, atomic commits | Similar, junior-dev-ready issues |
| **Visualization** | Progress bars in STATE.md | `bv --robot-insights` graph view |

**GSD Advantage**: Self-contained markdown files, no external tooling required.
**OpenCode Advantage**: Richer dependency graphs, queryable database, `bv` triage intelligence.

### 2. Orchestration Pattern

| Feature | GSD | OpenCode Workflow |
|---------|-----|-------------------|
| **Main Orchestrator** | Thin orchestrator spawns `gsd-executor` agents | Sisyphus spawns coder agents |
| **Parallel Limit** | Wave-based (implicit parallelism) | Explicit 4-task limit |
| **Isolation** | Fresh subagent contexts | Git worktrees + fresh contexts |
| **Coordination** | Task tool blocking | MCP Agent Mail + file reservations |

**GSD Advantage**: Simpler coordination (no external server needed).
**OpenCode Advantage**: True file-level isolation via worktrees, explicit conflict prevention.

### 3. Workflow Phases

| GSD Phase | OpenCode Equivalent |
|-----------|---------------------|
| `/gsd:new-project` | Manual + `/spec-planner` |
| `/gsd:discuss-phase` | No direct equivalent |
| `/gsd:plan-phase` | `/spec-planner` + `/populate-task` |
| `/gsd:execute-phase` | `/batch-orchestration` |
| `/gsd:verify-work` | Manual verification + `lsp_diagnostics` |
| `/gsd:complete-milestone` | `openspec archive` |

**GSD Advantage**: More structured user interaction (discuss → plan → execute → verify loop).
**OpenCode Advantage**: Stronger spec-driven development with OpenSpec validation.

### 4. Context Engineering

Both systems share the same core insight: **keep main context lean, delegate to fresh subagents**.

| Feature | GSD | OpenCode |
|---------|-----|----------|
| **Context Budget** | 0-30% peak quality, 30-50% good | Similar understanding |
| **Subagent Pattern** | `gsd-executor`, `gsd-planner`, etc. | `coder`, `populator`, `oracle` |
| **State Preservation** | `agent-history.json` for resume | MCP Agent Mail messages |

### 5. Verification & Quality

| Feature | GSD | OpenCode |
|---------|-----|----------|
| **Automated Checks** | Phase verification against goals | `lsp_diagnostics`, build, tests |
| **Human Verification** | `/gsd:verify-work` UAT workflow | Manual |
| **Gap Closure** | `--gaps` flag for fix plans | Re-run batch with fixes |
| **Deviation Handling** | 4 rules (auto-fix bugs, critical, blocking, ask architectural) | Similar patterns in AGENTS.md |

## Key Questions Answered

### Q1: Can we replace current workflow with GSD immediately?

**Answer: No, not immediately.**

#### Blockers

| Blocker | Severity | Explanation |
|---------|----------|-------------|
| **No worktree isolation** | HIGH | GSD uses subagent contexts but not git worktrees. Current workflow's worktree-based isolation is superior for true parallel file editing. |
| **No dependency graph** | MEDIUM | GSD uses wave numbers (pre-computed). Beads provides dynamic dependency resolution via `bv --robot-plan`. |
| **No MCP coordination** | MEDIUM | GSD relies on Task tool blocking. Current workflow uses Agent Mail for async coordination. |
| **Different task storage** | LOW | Migration from Beads to `.planning/` files is possible but loses queryability. |
| **No beads-viewer equivalent** | MEDIUM | `bv --robot-triage` intelligence would be lost. |

#### Valuable GSD Patterns Worth Adopting

- **Discuss phase**: Capturing user vision before planning
- **Structured verification**: `/gsd:verify-work` UAT workflow
- **Deviation rules**: Explicit 4-rule system for handling unexpected work
- **Context engineering**: Aggressive size limits and fresh context patterns
- **XML task format**: More structured than current beads descriptions

### Q2: Should we keep beads/beads-viewer and modify GSD to use them?

**Answer: Yes, this is the recommended approach.**

## Recommended Hybrid Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  GSD FRONTEND (User Interaction Layer)                         │
│  ├─ /gsd:new-project → Deep questioning, PROJECT.md            │
│  ├─ /gsd:discuss-phase → Capture user vision (CONTEXT.md)      │
│  ├─ /gsd:plan-phase → Research + planning                      │
│  ├─ /gsd:verify-work → UAT workflow                            │
│  └─ /gsd:progress → Status display                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BEADS BACKEND (Task Storage & Execution)                       │
│  ├─ bd/bv for task storage, dependencies, triage               │
│  ├─ Worktrees for parallel isolation                           │
│  ├─ MCP Agent Mail for coordination                            │
│  └─ OpenSpec for spec validation                               │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Strategy

### What to Take from GSD

| GSD Component | Integration Approach |
|---------------|---------------------|
| **Questioning workflow** | Add `/gsd:new-project` style deep questioning to spec-planner |
| **Discuss phase** | New skill: `/discuss-phase` creates CONTEXT.md before planning |
| **PLAN.md XML format** | Enhance beads issue descriptions with XML task structure |
| **Deviation rules** | Add to coder skill (already partially there) |
| **Verify-work UAT** | New skill: `/verify-work` for structured human testing |
| **STATE.md pattern** | Complement beads with project-level state file |
| **Research agents** | Add parallel research phase to spec-planner |

### What to Keep from Current Workflow

| Current Component | Why Keep It |
|-------------------|-------------|
| **Beads + Beads-Viewer** | Superior dependency graphs, queryable, `bv` intelligence |
| **Git worktrees** | True file isolation for parallel execution |
| **MCP Agent Mail** | Async coordination, file reservations |
| **OpenSpec** | Spec validation, structured change management |
| **Skill system** | Modular, easy to extend |

## Migration Path

### Phase 1: Adopt GSD Patterns (Low Risk)
1. Add `/discuss-phase` skill (creates CONTEXT.md)
2. Add `/verify-work` skill (UAT workflow)
3. Enhance deviation rules in coder skill
4. Add STATE.md for project-level memory

### Phase 2: Enhance Planning (Medium Risk)
1. Add research agents to spec-planner (parallel domain research)
2. Adopt XML task format in beads issue descriptions
3. Add wave-based grouping to `bv --robot-plan`

### Phase 3: Full Integration (Higher Risk)
1. Create GSD-style commands as wrappers around existing skills
2. Add `.planning/` directory structure alongside beads
3. Implement milestone tracking and archival

## Final Recommendation

**Don't replace. Integrate.**

GSD's strength is **user interaction and context engineering**. Current workflow's strength is **parallel execution infrastructure**. The optimal solution combines both:

1. **Keep**: Beads, Beads-Viewer, worktrees, MCP Agent Mail, OpenSpec
2. **Add**: GSD's questioning, discuss phase, verify-work, deviation rules, research agents
3. **Enhance**: Task descriptions with XML structure, project-level STATE.md

This gives the best of both worlds without losing existing infrastructure investment.

## References

- GSD Repository: `get-shit-done/` in this workspace
- GSD README: `get-shit-done/README.md`
- GSD Style Guide: `get-shit-done/GSD-STYLE.md`
- Current Workflow: `README.md` (root)
- OpenSpec: `openspec/project.md`
- Beads Documentation: `bd --help`, `bv --help`
