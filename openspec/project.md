# Project Context

## Purpose
OpenCode workflow orchestration system that enables parallel multi-agent task execution using OpenSpec for spec-driven development, Beads for issue tracking, and MCP Agent Mail for agent coordination.

## Tech Stack
- OpenCode CLI with oh-my-opencode extensions
- Beads (bd) for AI-native issue tracking
- Beads Viewer (bv) for graph-aware triage
- OpenSpec for spec-driven development
- MCP Agent Mail for multi-agent coordination
- Git worktrees for isolated parallel execution

## Project Conventions

### Code Style
- Skills are defined as Markdown files in `.opencode/command/`
- Agent configurations in `oh-my-opencode.json`
- MCP server configs in `.opencode/opencode.json`

### Architecture Patterns
- **Orchestrator pattern**: Sisyphus coordinates, specialized agents execute
- **Worktree isolation**: Each parallel task runs in its own git worktree
- **Async-first communication**: Agents use Agent Mail for non-blocking coordination
- **File reservation**: Agents reserve files before editing to prevent conflicts

### Testing Strategy
- Run `lsp_diagnostics` on all changed files
- Run project build/test commands if configured
- Validate with `openspec validate --strict`

### Git Workflow
- Main work on feature branches
- Worktrees created as `.worktrees/worktree-<task-id>` with branch `task/<id>`
- Merge back to feature branch after task completion
- Beads syncs to `beads-sync` branch

## Domain Context
- **Sisyphus**: Main orchestrator agent (Claude Opus 4.5)
- **Coder agents**: Task executors spawned in parallel (Claude Sonnet 4.5)
- **Skills**: Markdown-based workflow definitions triggered by slash commands
- **Categories**: Runtime presets for task() delegation with subagent_type

## Important Constraints
- Maximum 4 parallel coder agents per batch
- User approval required before task execution
- Agents must reserve files before editing
- Only Sisyphus handles merging (not individual coders)

## External Dependencies
- MCP Agent Mail server at `http://127.0.0.1:8765/mcp/`
- Beads CLI (`bd`) and Beads Viewer (`bv`)
- OpenSpec CLI (`openspec`)
- Git with worktree support
