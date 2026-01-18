# Architecture

**Analysis Date:** 2026-01-18

## Pattern Overview

**Overall:** Multi-Agent Orchestration with Spec-Driven Development

This is a meta-application framework for orchestrating parallel AI agent workflows using Claude Code. It implements a layered architecture where:
- **Main Orchestrator (Sisyphus)** coordinates the overall workflow
- **Specialized Agents** handle specific phases (planning, execution, verification)
- **Skills** (Markdown-based prompts) define workflow logic
- **File Reservation System** prevents parallel execution conflicts

**Key Characteristics:**
- **Agent-based architecture** - Multiple specialized AI agents work in parallel
- **Worktree isolation** - Each task executes in its own git worktree for conflict-free parallelization
- **Async-first communication** - Agents use MCP Agent Mail for non-blocking coordination
- **Spec-driven development** - All changes follow OpenSpec proposal → tasks → implementation flow
- **Context engineering** - System manages context to prevent quality degradation

## Layers

**Presentation/Command Layer:**
- Location: `.opencode/command/` and `get-shit-done/commands/gsd/`
- Contains: Slash command definitions (`.md` files) triggered by `/gsd:*` commands
- Purpose: Entry points for user interactions
- Depends on: Workflow layer
- Used by: Users via Claude Code CLI

**Workflow/Orchestration Layer:**
- Location: `.opencode/skill/` and `.opencode/get-shit-done/workflows/`
- Contains: Skill definitions (Markdown) and workflow definitions
- Purpose: Define how phases execute - research, planning, execution, verification
- Depends on: Agent layer
- Used by: Command layer

**Agent Layer:**
- Location: `.opencode/agents/` and `get-shit-done/agents/`
- Contains: Specialized agent prompts (gsd-*.md files)
- Purpose: Execute specific tasks - planning, verification, debugging, research
- Depends on: Infrastructure layer
- Used by: Workflow layer

**Infrastructure Layer:**
- Location: `.beads/`, `.opencode/node_modules/`, `openspec/`
- Contains: Issue tracking (Beads), dependencies, spec management
- Purpose: Provide coordination, state management, and integration infrastructure
- Used by: All upper layers

## Data Flow

**Feature Implementation Flow:**

1. **User Request** → `/gsd:new-project` or `/gsd:plan-phase N`
2. **Command Layer** parses slash command, loads relevant workflow
3. **Workflow Layer** determines phases and spawns agents
4. **Agent Layer** executes in parallel:
   - Researchers investigate domain patterns
   - Planners create task breakdown
   - Executors implement code
   - Verifiers validate results
5. **Infrastructure Layer** coordinates:
   - Beads tracks issues
   - Git worktrees isolate changes
   - Agent Mail coordinates messaging

**State Persistence:**
- `.beads/beads.db` - SQLite database for issue tracking
- `.beads/issues.jsonl` - Issue definitions
- `.planning/` - Project planning documents
- `openspec/changes/` - Specification documents

**Context Flow:**
```
PROJECT.md → ROADMAP.md → PHASE-CONTEXT.md → PLAN.md → SUMMARY.md
```

## Key Abstractions

**Skill Abstractions:**
- Purpose: Define reusable workflow patterns triggered by slash commands
- Examples: `.opencode/skill/orchestrator/`, `.opencode/skill/spec-planner/`, `.opencode/skill/coder/`
- Pattern: Markdown files with structured sections (role, instructions, examples)

**Workflow Abstractions:**
- Purpose: Define multi-step processes for project phases
- Examples: `.opencode/get-shit-done/workflows/execute-phase.md`, `plan-phase.md`
- Pattern: Sequential steps with agent spawning and result collection

**Agent Abstractions:**
- Purpose: Specialized prompts for specific tasks
- Examples: `gsd-planner.md`, `gsd-verifier.md`, `gsd-executor.md`
- Pattern: Role definition + task instructions + output format

## Entry Points

**Slash Commands:**
- Location: `.opencode/command/gsd/`
- Triggers: `/gsd:*` commands from Claude Code
- Responsibilities: Route to appropriate workflow, present results, request approval

**OpenSpec Commands:**
- Location: `.opencode/command/openspec-*.md`
- Triggers: `/openspec-proposal`, `/openspec-apply`, `/openspec-archive`
- Responsibilities: Spec-driven development workflow

**GSD Commands:**
- Location: `get-shit-done/commands/gsd/*.md`
- Triggers: `/gsd:new-project`, `/gsd:plan-phase`, `/gsd:execute-phase`, etc.
- Responsibilities: Core workflow commands

## Error Handling

**Strategy:** Agent-based debugging with retry workflows

**Patterns:**
- Verification failures spawn `gsd-debugger` agent
- Planning failures trigger recursive refinement
- Execution failures log to `daemon.log` in `.beads/`
- User approval required for retry or abort

## Cross-Cutting Concerns

**Logging:** `.beads/daemon.log` - Process logs for debugging
**Validation:** `openspec validate --strict` - Spec validation
**Authentication:** Google Auth configured in `oh-my-opencode.json`
**Coordination:** MCP Agent Mail at `http://127.0.0.1:8765/mcp/`

---

*Architecture analysis: 2026-01-18*
