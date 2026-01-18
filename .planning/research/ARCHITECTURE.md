# Architecture Patterns: Multi-Agent Parallelism

**Domain:** Multi-agent development systems
**Researched:** 2026-01-18

## Recommended Architecture: "Hub & Spoke" Orchestration

The system should follow a Centralized Orchestrator pattern where agents act as stateless workers.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Orchestrator** | Plan management, Wave scheduling, Git Push/Pull. | Agents (via Mail), Git Remote. |
| **Agent** | Task execution, File editing, Committing. | Orchestrator (via Mail), Worktree FS. |
| **Agent Mail** | Reservation state and message passing. | Orchestrator, Agents. |
| **PLAN.md** | Persisted state of all tasks and waves. | Orchestrator (Write), Agents (Read). |

### Data Flow
1. **Orchestrator** reads `PLAN.md`, identifies the next wave.
2. **Orchestrator** spawns **Agents** in dedicated `git worktrees`.
3. **Agents** reserve files via **Agent Mail**.
4. **Agents** execute tasks and `git commit` to a local branch.
5. **Agents** notify **Orchestrator** of completion.
6. **Orchestrator** merges agent branches and updates `PLAN.md`.

## Patterns to Follow

### Pattern 1: Alphabetical Resource Acquisition
**What:** Agents must always request file reservations in alphabetical order.
**Why:** Prevents deadlocks (Circular Wait).

## Anti-Patterns to Avoid

### Anti-Pattern 1: The "Fat" Agent
**What:** Letting agents handle their own `git push` or `PLAN.md` updates.
**Why bad:** High risk of race conditions and merge conflicts on shared refs/files.
**Instead:** Centralize shared state updates in the Orchestrator.

## Sources
- Hub and Spoke Architecture Patterns
- Git Distributed Workflow Best Practices
