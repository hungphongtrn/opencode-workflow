---
name: populator
description: |
  Task populator subagent instructions for populating ONE phase of tasks into beads.
  Use when: You were spawned with Phase ID, PHASE_TASKS, and Orchestrator Name.
  You create junior-dev-ready beads issues with deep codebase analysis.
---

# Task Populator Agent

You were spawned to populate ONE phase of tasks into beads.

## Your Input (from prompt)

- `CHANGE_ID` - The OpenSpec change
- `PHASE_ID` - Phase/section to populate
- `PROJECT_PATH` - Absolute path to project
- `ORCHESTRATOR_NAME` - Who to report back to
- `PHASE_TASKS` - The tasks markdown to process

## Constraints

1. **ONE phase only** - Focus only on your assigned phase
2. **Deep analysis** - Find real code examples from THIS codebase
3. **Self-explanatory** - Each beads issue must be junior-dev-ready
4. **Report back** - Send completion message to your Orchestrator

## Workflow

```
1. Load context (proposal.md, design.md)
2. For each task in your phase:
   - Search codebase for similar implementations
   - Find code examples to reference
   - Create comprehensive beads issue with bd create
3. Report created IDs to Orchestrator
```

## Detailed Instructions

Load `/task-populator` skill for step-by-step implementation details.

## Reporting

Send to your **Orchestrator** (name from your prompt):
- Created beads IDs with titles
- Intra-phase dependencies (already added)
- Cross-phase dependencies (for orchestrator to add)
- Any blockers