# Task Execution Specification

## Purpose
Defines the behavior of individual coder agents executing tasks in isolated git worktrees.

## ADDED Requirements

### Requirement: Task Execution Skill
The system SHALL provide a `/task-execution` skill that executes a single beads task in an isolated worktree.

#### Scenario: Task claiming and setup
- **WHEN** a coder agent receives a task assignment
- **THEN** the agent claims the task via `bd update <id> --status in_progress`
- **AND** reads task details via `bd show <id>`
- **AND** creates a worktree via `git worktree add ../worktree-<id> -b task/<id>`
- **AND** changes to the worktree directory for all subsequent operations

#### Scenario: File reservation
- **WHEN** the agent identifies files to modify
- **THEN** the agent reserves files via Agent Mail `file_reservation_paths`
- **AND** sets appropriate TTL (default 3600 seconds)
- **AND** uses exclusive mode for files being edited
- **AND** checks for conflicts before proceeding
- **AND** waits or reports if files are reserved by another agent

#### Scenario: Task implementation
- **WHEN** files are successfully reserved
- **THEN** the agent creates local todos for subtasks
- **AND** implements changes following existing codebase patterns
- **AND** runs `lsp_diagnostics` on all changed files
- **AND** fixes any errors before proceeding
- **AND** marks todos complete as work progresses

#### Scenario: Task completion
- **WHEN** implementation is complete and diagnostics pass
- **THEN** the agent commits changes via `git add . && git commit -m "feat(<id>): <description>"`
- **AND** releases file reservations via Agent Mail
- **AND** sends completion message via Agent Mail to Sisyphus
- **AND** reports back with: files changed, commit SHA, any blockers encountered

#### Scenario: Task failure
- **WHEN** the agent cannot complete the task
- **THEN** the agent documents the failure reason
- **AND** releases any held file reservations
- **AND** sends failure message via Agent Mail
- **AND** leaves worktree intact for debugging
- **AND** reports failure details to Sisyphus

### Requirement: Worktree Isolation
The system SHALL ensure complete isolation between parallel coder agents via git worktrees.

#### Scenario: Worktree creation
- **WHEN** a coder agent starts a task
- **THEN** a new worktree is created at `../worktree-<task-id>`
- **AND** a new branch `task/<task-id>` is created from current HEAD
- **AND** the worktree has its own working directory and index
- **AND** changes in one worktree do not affect others

#### Scenario: Worktree cleanup
- **WHEN** a task is merged or abandoned
- **THEN** the worktree is removed via `git worktree remove`
- **AND** the task branch is optionally deleted
- **AND** no orphaned worktrees remain after batch completion

### Requirement: Coder Agent Configuration
The system SHALL provide a `coder` agent configuration optimized for task execution.

#### Scenario: Agent model selection
- **WHEN** spawning a coder agent
- **THEN** the agent uses Claude Sonnet 4.5 model
- **AND** temperature is set to 0.1 for deterministic output
- **AND** the agent has access to all standard tools

#### Scenario: Agent prompt configuration
- **WHEN** a coder agent is spawned
- **THEN** the prompt includes the specific task ID
- **AND** the prompt includes the worktree path
- **AND** the prompt references the `/task-execution` skill
- **AND** the prompt emphasizes staying focused on the assigned task only
