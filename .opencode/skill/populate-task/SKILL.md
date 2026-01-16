---
name: populate-task
description: |
  Load tasks from an approved OpenSpec tasks.md into beads issue tracker.
  Use when: (1) User approves a spec proposal, (2) User says "populate tasks", "create beads", "load tasks",
  (3) After /spec-planner completes and user approves.
  Supports Sequential mode (1-4 tasks) or Parallel mode (5+ tasks).
---

# Populate Task

Load tasks from approved OpenSpec change into beads.

## Prerequisites

- Approved OpenSpec change with `tasks.md`
- Beads CLI (`bd`) installed
- Run after `/spec-planner` and user approval

## Mode Selection

Count unchecked tasks (`- [ ]`) in tasks.md:

| Task Count | Mode | Read |
|------------|------|------|
| 1-4 tasks | Sequential | `references/sequential.md` |
| 5+ tasks | Parallel | `references/parallel.md` |

## Quick Start

```bash
# Identify the change
openspec list
CHANGE_ID="<change-id>"

# Read tasks
cat openspec/changes/$CHANGE_ID/tasks.md

# Count unchecked tasks to choose mode
```

## Task Description Quality

**CRITICAL**: Each beads issue MUST be junior-dev-ready.

Read `references/task-template.md` for the required description format.

## After Population

```bash
# Verify tasks created
bd ready

# Get dependency graph
bv --robot-insights
bv --robot-plan
```

Add sync marker to tasks.md:
```markdown
<!-- BEADS_SYNCED: 2024-01-15T10:30:00Z -->
<!-- BEADS_IDS: proj-abc, proj-def, proj-ghi -->
```

## Next Steps

Run `/batch-orchestration` to execute tasks.