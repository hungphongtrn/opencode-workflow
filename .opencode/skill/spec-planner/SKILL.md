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

### 4. Create Beads Issues (MANDATORY)

**CRITICAL**: You MUST create beads issues for EVERY task identified in tasks.md. Subagents will execute these tasks autonomously based solely on the issue description.

#### Self-Explanatory Task Requirements

Each task MUST be **self-contained** so a coder agent can complete it without asking questions:

1. **Clear Title**: Action-oriented (e.g., "Add JWT validation middleware")
2. **Complete Description** including:
   - **What**: Specific deliverable (not vague goals)
   - **Where**: Exact file paths to create/modify
   - **How**: Key implementation approach or patterns to follow
   - **References**: Links to related specs, design docs, or example code
   - **Acceptance Criteria**: How to verify the task is complete

#### Task Creation

```bash
# Create each task with comprehensive description
bd create "<Action-oriented title>" --type task --priority <0-4> \
  --description="## What
<Specific deliverable>

## Files
- <path/to/file1.ts> - <what to do>
- <path/to/file2.ts> - <what to do>

## Approach
<Key implementation details, patterns to follow>

## References
- See: openspec/changes/<change-id>/design.md
- Pattern: src/existing/similar-feature.ts

## Done When
- [ ] <Verification step 1>
- [ ] <Verification step 2>"

# Add dependencies (child depends on parent)
bd dep add <child-id> <parent-id>
```

#### Priority Mapping
- P0: Critical/blocking
- P1: High priority
- P2: Medium (default)
- P3: Low priority
- P4: Backlog

#### Verification (REQUIRED)

After creating ALL tasks, verify they exist:
```bash
bd ready  # MUST show created tasks
```

**If `bd ready` shows no tasks, STOP and fix the issue before proceeding.**

### 5. Validate and Report

```bash
# Validate OpenSpec
openspec validate $CHANGE_ID --strict

# VERIFY beads issues were created
bd ready  # If empty, bd creation failed - fix before continuing

# Get task graph insights
bv --robot-insights
bv --robot-plan
```

### 6. STOP - Await Approval

**Do NOT proceed to implementation.** Present:
1. Summary of the proposal
2. List of created beads issues with IDs (from `bd ready`)
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
