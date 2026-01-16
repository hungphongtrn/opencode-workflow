# Agent Coordination Specification

## Purpose
Defines how agents communicate and coordinate via MCP Agent Mail to prevent conflicts and share status.

## ADDED Requirements

### Requirement: Agent Registration
The system SHALL register all agents with MCP Agent Mail for coordination.

#### Scenario: Sisyphus registration
- **WHEN** Sisyphus starts a batch orchestration session
- **THEN** Sisyphus ensures project exists via `ensure_project`
- **AND** registers as coordinator via `register_agent`
- **AND** uses task description "Orchestrator - Batch <n>"

#### Scenario: Coder agent registration
- **WHEN** a coder agent is spawned for a task
- **THEN** the agent registers via `register_agent`
- **AND** uses auto-generated adjective+noun name
- **AND** uses task description "Executing <task-id>"
- **AND** sets program to "opencode-coder"

### Requirement: File Reservation Protocol
The system SHALL use file reservations to prevent concurrent edits to the same files.

#### Scenario: Reserving files before edit
- **WHEN** an agent needs to modify files
- **THEN** the agent calls `file_reservation_paths` with specific paths or globs
- **AND** sets `exclusive=true` for files being edited
- **AND** sets appropriate `ttl_seconds` based on expected task duration
- **AND** includes `reason` describing the task

#### Scenario: Handling reservation conflicts
- **WHEN** a file reservation conflicts with an existing reservation
- **THEN** the agent receives conflict information with holder details
- **AND** the agent waits for the reservation to expire or be released
- **OR** the agent sends a message to the holder requesting release
- **AND** the agent does not proceed with conflicting edits

#### Scenario: Releasing reservations
- **WHEN** an agent completes or abandons a task
- **THEN** the agent releases all held reservations via `release_file_reservations`
- **AND** reservations are released even on task failure
- **AND** expired reservations are automatically cleaned up

### Requirement: Status Communication
The system SHALL use Agent Mail messages for status updates between agents.

#### Scenario: Task completion notification
- **WHEN** a coder agent completes a task
- **THEN** the agent sends a message to Sisyphus
- **AND** the message includes: task ID, commit SHA, files changed, duration
- **AND** the message uses importance "normal"
- **AND** the message uses a consistent thread ID for the batch

#### Scenario: Task failure notification
- **WHEN** a coder agent fails to complete a task
- **THEN** the agent sends a message to Sisyphus with importance "high"
- **AND** the message includes: task ID, failure reason, attempted actions
- **AND** the message includes any partial progress made

#### Scenario: Merge status notification
- **WHEN** Sisyphus completes merging worktrees
- **THEN** Sisyphus sends a summary message to all participating agents
- **AND** the message includes: merged tasks, any conflicts, final status

### Requirement: Subagent Configuration
The system SHALL provide subagent types for task() delegation.

#### Scenario: Task execution with OpenCode-Builder
- **WHEN** delegating task execution work
- **THEN** use `task(subagent_type="OpenCode-Builder", ...)`
- **AND** OpenCode-Builder is configured with google/gemini-3-flash model
- **AND** prompt includes reference to `/task-execution` skill
- **AND** prompt emphasizes isolated worktree execution
- **AND** all task() calls are made in ONE response for parallel execution
