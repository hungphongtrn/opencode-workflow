# Design: Parallel Task Orchestration System

## Context
OpenCode with oh-my-opencode provides multi-agent capabilities, but lacks structured workflows for:
- Breaking large changes into parallel tasks
- Coordinating multiple agents working simultaneously
- Preventing file conflicts between agents
- Merging parallel work streams safely

This design introduces a skill-based orchestration layer that integrates OpenSpec, Beads, and MCP Agent Mail.

## Goals
- Enable 4x parallelism for independent tasks
- Maintain code quality through isolated worktrees
- Prevent merge conflicts via file reservations
- Provide human approval gates before execution
- Keep agents focused with clear task boundaries

## Non-Goals
- Real-time agent-to-agent chat (async mail only)
- Automatic conflict resolution (flag for human)
- Dynamic scaling beyond 4 agents (fixed batch size)
- Cross-repository coordination (single repo only)

## Decisions

### Decision 1: Skill-based Architecture
**What**: Implement workflows as `.opencode/command/*.md` skill files
**Why**: 
- Native OpenCode integration via slash commands
- Declarative, version-controlled workflow definitions
- Easy to modify without code changes
**Alternatives considered**:
- Custom MCP server: Too complex, requires deployment
- Hardcoded in agent prompts: Not reusable, hard to maintain

### Decision 2: Worktree Isolation
**What**: Each coder agent works in a separate git worktree
**Why**:
- Complete filesystem isolation prevents conflicts
- Each agent can commit independently
- Easy rollback by removing worktree
- Native git support, no custom tooling
**Alternatives considered**:
- Branch-per-task without worktree: Requires constant switching, error-prone
- Stash-based isolation: Complex state management, easy to lose work

### Decision 3: Sisyphus-Owned Merging
**What**: Only Sisyphus (orchestrator) performs merges, not coder agents
**Why**:
- Single point of coordination prevents race conditions
- Easier conflict resolution with full context
- Clear responsibility boundaries
**Alternatives considered**:
- Agent-coordinated merging via mail: Race conditions, deadlock risk
- First-come-first-merge: Unpredictable order, harder to debug

### Decision 4: File Reservation via Agent Mail
**What**: Agents reserve files before editing using MCP Agent Mail
**Why**:
- Explicit conflict prevention
- Audit trail of who touched what
- TTL-based automatic cleanup
**Alternatives considered**:
- Git locks: Too coarse-grained, blocks entire files
- Honor system: No enforcement, conflicts likely

### Decision 5: Beads for Task Graph
**What**: Use Beads issues with dependencies for task tracking
**Why**:
- Native dependency graph with `bd dep add`
- `bv --robot-plan` provides optimal parallel tracks
- Git-native, syncs with code
**Alternatives considered**:
- OpenSpec tasks.md only: No dependency tracking
- External issue tracker: Context switching, sync overhead

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Worktree creation overhead | Pre-create pool, reuse across batches |
| Agent Mail server unavailable | Graceful degradation to sequential execution |
| Merge conflicts | Flag for human, provide diff context |
| Task scope creep | Strict task boundaries in skill prompts |
| Beads sync conflicts | Use dedicated `beads-sync` branch |

## Migration Plan
1. Create skill files (no breaking changes)
2. Update oh-my-opencode.json with new agent/categories
3. Document workflow in WORKFLOW.md
4. Test with sample multi-task feature

## Open Questions
- Should we support configurable batch sizes (2-6)?
- How to handle long-running tasks that exceed TTL?
- Should completed worktrees be archived or deleted?
