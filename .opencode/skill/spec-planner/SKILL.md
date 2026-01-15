---
name: spec-planner
description: |
  Transform user feature requests into OpenSpec proposals with parallelizable beads tasks.
  Use when: (1) User requests a new feature or spec change, (2) User mentions "proposal", "spec", "plan", or "change",
  (3) User wants to break down work into parallel tasks, (4) User asks to create tasks for a feature.
  This skill creates proposal.md, tasks.md, design.md, populates beads issues with dependencies, and stops for approval.
---

# Spec Planner

Transform feature requests into structured OpenSpec proposals with parallelizable beads tasks.

## Workflow

### 1. Gather Context
```bash
# Check existing specs and changes
openspec list --specs
openspec list
cat openspec/project.md
```

### 2. Create Change Proposal
```bash
# Scaffold change directory
CHANGE_ID="<verb>-<feature-name>"  # e.g., add-user-auth, update-payment-flow
mkdir -p openspec/changes/$CHANGE_ID/specs/<capability>
```

Create these files:
- `proposal.md` - Why and what changes
- `tasks.md` - Implementation checklist with parallelization notes
- `design.md` - Technical decisions (if cross-cutting or complex)
- `specs/<capability>/spec.md` - Delta specs with ADDED/MODIFIED/REMOVED

### 3. Break Into Parallelizable Tasks

Analyze the work and identify:
- **Independent tasks**: Can run in parallel (different files/modules)
- **Dependent tasks**: Must run sequentially (one builds on another)

Task guidelines:
- Each task should be completable in one focused session
- Include affected file paths in task description
- Mark clear boundaries between tasks
- Maximum 4 parallel tasks per batch

### 4. Create Beads Issues

```bash
# Create issues for each task
bd create "<Task title>" --type task --priority <0-4> \
  --description="<What to do and which files>"

# Add dependencies (child depends on parent)
bd dep add <child-id> <parent-id>
```

Priority mapping:
- P0: Critical/blocking
- P1: High priority
- P2: Medium (default)
- P3: Low priority
- P4: Backlog

### 5. Validate and Report

```bash
# Validate OpenSpec
openspec validate $CHANGE_ID --strict

# Get task graph insights
bv --robot-insights
bv --robot-plan
```

### 6. STOP - Await Approval

**Do NOT proceed to implementation.** Present:
1. Summary of the proposal
2. List of created beads issues with IDs
3. Dependency graph visualization
4. Recommended execution order from `bv --robot-next`

Wait for explicit user approval before any implementation begins.

## Example Output

```
## Proposal Created: add-user-authentication

### Files Created:
- openspec/changes/add-user-authentication/proposal.md
- openspec/changes/add-user-authentication/tasks.md
- openspec/changes/add-user-authentication/design.md
- openspec/changes/add-user-authentication/specs/auth/spec.md

### Beads Issues Created:
| ID | Title | Priority | Depends On |
|----|-------|----------|------------|
| proj-abc | Create auth middleware | P1 | - |
| proj-def | Add login endpoint | P1 | - |
| proj-ghi | Add JWT validation | P1 | proj-abc |
| proj-jkl | Create login UI | P2 | proj-def |

### Parallel Execution Tracks:
- Track 1: proj-abc → proj-ghi
- Track 2: proj-def → proj-jkl

### Next Steps:
Run `/batch-orchestration` to execute tasks after approval.
```

## References

- See `openspec/AGENTS.md` for OpenSpec conventions
- Run `bd prime` for beads workflow context
- Run `bv --robot-triage` for task prioritization
