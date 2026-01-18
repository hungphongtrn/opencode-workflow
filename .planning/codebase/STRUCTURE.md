# Codebase Structure

**Analysis Date:** 2026-01-18

## Directory Layout

```
opencode-workflow/
├── .beads/                    # Beads issue tracking system
│   ├── beads.db              # SQLite database
│   ├── beads.db-shm          # Shared memory
│   ├── beads.db-wal          # Write-ahead log
│   ├── config.yaml           # Beads configuration
│   ├── daemon.log            # Process logs
│   ├── daemon.pid            # Daemon process ID
│   ├── issues.jsonl          # Issue definitions
│   └── metadata.json         # Beads metadata
├── .claude/                   # Claude Code configuration (local install)
│   ├── agents/               # Agent prompts
│   ├── commands/             # Slash commands
│   ├── hooks/                # Git hooks
│   └── get-shit-done/        # GSD templates and workflows
├── .git/                      # Git repository
├── .opencode/                 # OpenCode configuration
│   ├── agents/               # Agent definitions (symlinked from get-shit-done)
│   ├── command/              # Slash command definitions
│   ├── get-shit-done/        # GSD system
│   │   ├── agents/           # Specialized agent prompts
│   │   ├── commands/         # Command implementations
│   │   ├── references/       # Reference documentation
│   │   ├── templates/        # Document templates
│   │   │   ├── codebase/     # Codebase analysis templates
│   │   │   └── research-project/  # Research templates
│   │   └── workflows/        # Workflow definitions
│   ├── node_modules/         # Dependencies (zod, @opencode-ai/sdk)
│   ├── skill/                # Skill definitions
│   │   ├── batch-orchestration/
│   │   ├── coder/
│   │   ├── merge-coordinator/
│   │   ├── orchestrator/
│   │   ├── populate-task/
│   │   ├── populator/
│   │   ├── skill-creator/
│   │   ├── spec-planner/
│   │   ├── task-execution/
│   │   └── task-populator/
│   ├── oh-my-opencode.json   # Agent and category configuration
│   └── opencode.json         # MCP server configuration
├── .planning/                 # Planning documents
│   └── codebase/             # Codebase analysis output
├── docs/                      # Documentation
├── get-shit-done/             # GSD source (npm package)
│   ├── agents/               # Agent prompts
│   ├── commands/             # Command implementations
│   ├── workflows/            # Workflow definitions
│   ├── templates/            # Templates
│   ├── GSD-STYLE.md          # Style guide
│   ├── CHANGELOG.md          # Version history
│   ├── README.md             # GSD documentation
│   └── package.json          # NPM package config
├── openspec/                  # OpenSpec system
│   ├── changes/              # Active specification changes
│   │   └── add-parallel-task-orchestration/
│   │       ├── proposal.md
│   │       ├── tasks.md
│   │       ├── design.md
│   │       └── specs/
│   │           ├── orchestration/
│   │           ├── agent-coordination/
│   │           └── task-execution/
│   ├── project.md            # Project context
│   └── specs/                # Spec templates
├── AGENTS.md                 # Agent role instructions
└── README.md                 # Project overview
```

## Directory Purposes

**`.beads/`:**
- Purpose: AI-native issue tracking system
- Contains: SQLite database, issue definitions, configuration, daemon logs
- Key files: `beads.db`, `config.yaml`, `issues.jsonl`

**`.opencode/`:**
- Purpose: OpenCode CLI and oh-my-opencode configuration
- Contains: Agent definitions, skills, commands, MCP configs
- Key files: `oh-my-opencode.json`, `opencode.json`

**`.opencode/skill/`:**
- Purpose: Skill definitions for workflow automation
- Contains: Markdown files defining agent behaviors
- Subdirectories: orchestrator, spec-planner, coder, populate-task, etc.

**`.opencode/get-shit-done/`:**
- Purpose: Get Shit Done meta-prompting system
- Contains: Agents, commands, workflows, templates
- Structure: Mirrors `.claude/get-shit-done/` for local installation

**`get-shit-done/`:**
- Purpose: Source for GSD npm package
- Contains: Same structure as `.opencode/get-shit-done/`
- Published to npm as `get-shit-done-cc`

**`openspec/`:**
- Purpose: Spec-driven development system
- Contains: Active changes, specifications, project context
- Structure: `changes/<change-id>/proposal.md, tasks.md, design.md, specs/`

**`.planning/`:**
- Purpose: Planning document storage
- Contains: Codebase analysis, project plans, research output
- Structure: Created by `/gsd:map-codebase` and workflow phases

## Key File Locations

**Entry Points:**
- `/gsd:new-project`: `get-shit-done/commands/gsd/new-project.md`
- `/gsd:plan-phase`: `get-shit-done/commands/gsd/plan-phase.md`
- `/gsd:execute-phase`: `get-shit-done/commands/gsd/execute-phase.md`
- `/gsd:verify-work`: `get-shit-done/commands/gsd/verify-work.md`
- `/gsd:map-codebase`: `get-shit-done/commands/gsd/map-codebase.md`

**Configuration:**
- `openspec/project.md`: Project context and conventions
- `.opencode/oh-my-opencode.json`: Agent and category configuration
- `.beads/config.yaml`: Beads tracking configuration

**Core Logic:**
- Skills: `.opencode/skill/*/*.md`
- Workflows: `.opencode/get-shit-done/workflows/*.md`
- Agents: `.opencode/agents/*.md`, `get-shit-done/agents/*.md`

## Naming Conventions

**Files:**
- Skills: `kebab-case.md` (e.g., `spec-planner.md`, `task-execution.md`)
- Commands: `kebab-case.md` (e.g., `new-project.md`, `plan-phase.md`)
- Agents: `gsd-{role}.md` (e.g., `gsd-planner.md`, `gsd-verifier.md`)
- Workflows: `kebab-case.md` (e.g., `execute-phase.md`, `verify-work.md`)
- Templates: `PascalCase.md` (e.g., `PROJECT.md`, `ROADMAP.md`)

**Directories:**
- Skills: `kebab-case` (e.g., `batch-orchestration`, `task-populator`)
- Commands: `gsd` subdirectory under `commands/`
- Changes: `kebab-case` (e.g., `add-parallel-task-orchestration`)

## Where to Add New Code

**New GSD Command:**
- Command file: `get-shit-done/commands/gsd/{command-name}.md`
- Symlink: `.opencode/command/gsd/{command-name}.md`
- Also add to `.claude/command/gsd/` if local install

**New Skill:**
- Skill definition: `.opencode/skill/{skill-name}/skill.md`
- Reference in: `oh-my-opencode.json` if new agent type

**New Agent:**
- Agent prompt: `get-shit-done/agents/gsd-{agent-name}.md`
- Symlink: `.opencode/agents/gsd-{agent-name}.md`

**New Workflow:**
- Workflow definition: `.opencode/get-shit-done/workflows/{workflow-name}.md`
- Template: Use `phase-prompt.md` pattern

**New OpenSpec Change:**
- Location: `openspec/changes/{change-id}/`
- Files: `proposal.md`, `tasks.md`, `design.md`, `specs/**/*.md`

## Special Directories

**`.beads/`:**
- Purpose: Issue tracking database and logs
- Generated: Yes, by `bd init`
- Committed: No (in `.gitignore`)

**`.opencode/node_modules/`:**
- Purpose: Dependencies for OpenCode
- Generated: Yes, by npm install
- Committed: No (in `.gitignore`)

**`.planning/`:**
- Purpose: Planning output and analysis
- Generated: Yes, by GSD commands
- Committed: Optional (contains project state)

**`openspec/changes/`:**
- Purpose: Active specification changes
- Generated: Yes, by `/openspec-proposal`
- Committed: Yes (part of project history)

**`.worktrees/`:**
- Purpose: Git worktrees for parallel task execution
- Generated: Yes, by task execution
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-01-18*
