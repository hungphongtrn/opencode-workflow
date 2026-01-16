# Agent Instructions

## Identify Your Role

Read ONLY the skill that matches your role:

| If you are... | Load this skill |
|---------------|-----------------|
| 🎯 **Main Orchestrator** (coordinating workflow, not spawned by another agent) | `/orchestrator` |
| 🔨 **Coder Agent** (received task ID + worktree path + orchestrator name) | `/coder` |
| 📝 **Task Populator** (received phase ID + PHASE_TASKS + orchestrator name) | `/populator` |

## How to Identify Your Role

- **Spawned with `Task ID` + `Worktree Path` + `Orchestrator Name`?** → You're a **Coder Agent**
- **Spawned with `Phase ID` + `PHASE_TASKS` + `Orchestrator Name`?** → You're a **Task Populator**  
- **Neither of the above?** → You're the **Main Orchestrator**

## Project Context

Read `openspec/project.md` for project-specific conventions.

## OpenSpec Work

When doing spec-related work, load `/openspec` skill.