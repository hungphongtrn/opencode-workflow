# Orchestration Specification

## Purpose
Defines the orchestration layer that coordinates parallel task execution across multiple coder agents.

## ADDED Requirements

### Requirement: Spec Planner Skill
The system SHALL provide a `/spec-planner` skill that transforms user requests into OpenSpec proposals with parallelizable beads tasks.

#### Scenario: User requests a spec change
- **WHEN** user provides a feature request or spec change
- **THEN** the skill reads `openspec/project.md` and existing specs
- **AND** creates a change proposal with `proposal.md`, `tasks.md`, and optional `design.md`
- **AND** breaks tasks into parallelizable units with clear dependencies
- **AND** creates beads issues via `bd create` for each task
- **AND** adds dependencies via `bd dep add` where required
- **AND** runs `bv --robot-insights` to validate the task graph
- **AND** stops execution awaiting user approval

#### Scenario: Task parallelization analysis
- **WHEN** creating tasks from a proposal
- **THEN** the skill identifies independent tasks that can run in parallel
- **AND** marks dependencies between tasks that must run sequentially
- **AND** limits task scope to single-responsibility units
- **AND** includes file paths affected by each task

### Requirement: Batch Orchestration Skill
The system SHALL provide a `/batch-orchestration` skill that coordinates parallel execution of ready tasks.

#### Scenario: User requests task execution
- **WHEN** user requests to execute pending tasks
- **THEN** the skill runs `bv --robot-triage` to get recommendations
- **AND** runs `bv --robot-plan` to identify parallel execution tracks
- **AND** selects up to 4 tasks from non-conflicting tracks
- **AND** presents task summary to user for approval
- **AND** waits for explicit user confirmation before proceeding

#### Scenario: Parallel agent spawning
- **WHEN** user approves the selected tasks
- **THEN** the skill spawns coder agents via `task(subagent_type="general")` in a single response
- **AND** each agent receives: task ID, worktree path, and `/task-execution` skill reference
- **AND** all agents execute in parallel
- **AND** the skill collects results from all agents
- **AND** triggers `/merge-coordinator` after all agents complete

#### Scenario: Batch completion
- **WHEN** all coder agents have completed and merge is successful
- **THEN** the skill closes completed beads issues via `bd close <id1> <id2> ...`
- **AND** runs `bd sync` to synchronize with git
- **AND** reports summary to user with files changed and any issues encountered

### Requirement: Merge Coordinator Skill
The system SHALL provide a `/merge-coordinator` skill that safely merges completed worktrees.

#### Scenario: Sequential worktree merging
- **WHEN** coder agents have completed their tasks
- **THEN** the skill lists all completed worktrees with their commits
- **AND** merges each worktree sequentially via `git merge task/<id> --no-ff`
- **AND** runs `lsp_diagnostics` after each merge
- **AND** removes merged worktrees via `git worktree remove .worktrees/worktree-<id>`

#### Scenario: Merge conflict handling
- **WHEN** a merge conflict occurs
- **THEN** the skill attempts automatic resolution for trivial conflicts
- **AND** flags complex conflicts for human intervention
- **AND** provides diff context and affected files
- **AND** pauses execution until conflict is resolved

#### Scenario: Final validation
- **WHEN** all worktrees have been merged
- **THEN** the skill runs project build command if configured
- **AND** runs project test command if configured
- **AND** reports final status with all changes summarized
