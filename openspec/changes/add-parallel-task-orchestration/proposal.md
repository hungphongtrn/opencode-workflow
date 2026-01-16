# Change: Add Parallel Task Orchestration System

## Why
Currently, OpenCode agents work sequentially on tasks. For complex features with multiple independent subtasks, this creates unnecessary delays. We need a system that:
1. Breaks spec changes into parallelizable beads tasks
2. Spawns multiple coder agents working in isolated git worktrees
3. Coordinates file access to prevent conflicts
4. Merges completed work safely back to the main branch

## What Changes
- **NEW**: `/spec-planner` skill - Creates OpenSpec proposals and populates beads with parallelizable tasks
- **NEW**: `/task-execution` skill - Executes single beads task in isolated worktree
- **NEW**: `/batch-orchestration` skill - Orchestrates parallel coder agent execution
- **NEW**: `/merge-coordinator` skill - Safely merges completed worktrees
- **NEW**: `coder` agent configuration in oh-my-opencode.json
- **NEW**: `OpenCode-Builder` subagent type (google/gemini-3-flash) for task execution

## Impact
- Affected specs: orchestration, task-execution, agent-coordination (all new)
- Affected code: `.opencode/command/*.md`, `.opencode/oh-my-opencode.json`
- Dependencies: Beads, Beads Viewer, MCP Agent Mail, Git worktrees
