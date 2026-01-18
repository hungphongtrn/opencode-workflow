# Research Summary

## Executive Summary
The Multi-Agent Workflow Orchestration project focuses on enabling safe, parallel task execution for AI agents within a single repository. The research recommends a "Hub & Spoke" architecture where a centralized Orchestrator manages the task lifecycle, using `PLAN.md` as the single source of truth. By leveraging Git Worktrees (v2.31+), the system provides lightweight task isolation, allowing multiple agents to work concurrently without the overhead of full clones or the risks of shared working directories.

To ensure coordination and prevent race conditions, the system will implement "Agent Mail," a file-based messaging and locking mechanism. This ensures that only one agent can reserve and edit a specific file at a time. The orchestration logic will be "wave-based," grouping independent tasks into parallel execution units while maintaining strict sequential dependencies between waves. This approach balances throughput with safety, addressing common pitfalls like concurrent file modification and resource leaks through lifecycle hooks and alphabetical lock acquisition.

## Stack Recommendations
- **Git Worktrees (2.31+):** Provides essential task isolation for parallel agents without disk-intensive clones.
- **Agent Mail (Custom):** A file-based messaging and locking system for resource reservation and coordination.
- **PLAN.md (Markdown):** A human-readable and machine-parsable source of truth for task state.
- **Zod:** Ensures the integrity of the `PLAN.md` structure via strong type validation.
- **Fast-Glob:** Enables efficient file discovery for agents during reservation and execution.

## Table Stakes Features
- **Worktree Isolation:** Native git-level isolation for each agent task.
- **File Reservation:** Locking mechanism to prevent multiple agents from editing the same file.
- **Wave Execution:** Scheduling tasks in sequential waves based on dependency analysis.
- **Serialized Plan Updates:** Restricting `PLAN.md` writes to the Orchestrator to prevent corruption.

## Architecture Pattern
- **Hub & Spoke Orchestration:** A centralized Orchestrator coordinates stateless worker Agents.
- **Component Separation:** Clear boundaries between Plan Management (Orchestrator), Task Execution (Agents), and Coordination (Agent Mail).
- **Alphabetical Resource Acquisition:** Agents request file locks in alphabetical order to proactively prevent deadlocks.
- **Stateless Workers:** Agents are spawned for specific tasks and cleaned up immediately after completion.

## Critical Pitfalls
- **Concurrent File Modification:** Prevented by strict File Reservation via Agent Mail.
- **Planning/Execution Desync:** Mitigated by snapshotted execution where Orchestrator reads the plan once per wave.
- **Worktree Proliferation:** Managed by lifecycle hooks (`try/finally`) to ensure cleanup of abandoned worktrees.
- **Opaque Failures:** Addressed by implementing log forwarding from sub-agents to the main Orchestrator.

## Roadmap Implications
- **Phase 1: Isolation Foundation:** Focus on Git Worktree lifecycle management (creation, deletion, and cleanup hooks).
- **Phase 2: Resource Coordination:** Build the Agent Mail reservation system and alphabetical lock acquisition logic.
- **Phase 3: Core Orchestration:** Implement the wave-based scheduler and serialized `PLAN.md` update loop.
- **Phase 4: Advanced Safety (Optional):** Add deadlock detection, semantic post-merge validation, and auto-replanning capabilities.

## Open Questions
- **Resilience:** What is the graceful fallback strategy if the Agent Mail communication layer fails?
- **Environment Support:** Are there specific CI/CD environments where `git worktree` permissions will cause issues?
- **Communication Protocol:** What is the exact schema for "Request Update" messages from Agents to the Orchestrator?
