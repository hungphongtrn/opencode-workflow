---
name: spec-planner
description: |
  Transform user feature requests into OpenSpec proposals with parallelizable tasks.
  Use when: (1) User requests a new feature or spec change, (2) User mentions "proposal", "spec", "plan", or "change",
  (3) User wants to break down work into parallel tasks, (4) User asks to create tasks for a feature.
  This skill creates proposal.md, tasks.md, design.md, and stops for approval.
  NOTE: This skill does NOT populate beads. Use /populate-task after approval to create beads issues.
---

# Spec Planner

Transform feature requests into structured OpenSpec proposals with parallelizable tasks.

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
- Use checkbox format: `- [ ] 1.1 Task description`

### 4. Write Self-Explanatory Tasks in tasks.md

Each task in tasks.md MUST be **self-contained** so a coder agent can complete it without asking questions:

1. **Clear Title**: Action-oriented (e.g., "Add JWT validation middleware")
2. **Complete Description** including:
   - **What**: Specific deliverable (not vague goals)
   - **Where**: Exact file paths to create/modify
   - **How**: Key implementation approach or patterns to follow
   - **References**: Links to related specs, design docs, or example code
   - **Acceptance Criteria**: How to verify the task is complete

#### Task Format in tasks.md

```markdown
## 1. Category Name

### 1.1 Task Title
- [ ] Implement the feature

**What**: Specific deliverable description

**Files**:
- `path/to/file1.ts` - what to do
- `path/to/file2.ts` - what to do

**Approach**: Key implementation details, patterns to follow

**References**:
- See: openspec/changes/<change-id>/design.md
- Pattern: src/existing/similar-feature.ts

**Done When**:
- [ ] Verification step 1
- [ ] Verification step 2
```

#### Priority Mapping (for later beads creation)
- P0: Critical/blocking
- P1: High priority
- P2: Medium (default)
- P3: Low priority
- P4: Backlog

### 5. Validate and Report

```bash
# Validate OpenSpec
openspec validate $CHANGE_ID --strict
```

### 6. STOP - Await Approval

**Do NOT proceed to implementation or beads creation.** Present:
1. Summary of the proposal
2. List of tasks from tasks.md with parallelization notes
3. Recommended execution order

Wait for explicit user approval before:
- Running `/populate-task` to create beads issues
- Any implementation begins

## Example Output

```
## Proposal Created: add-user-authentication

### Files Created:
- openspec/changes/add-user-authentication/proposal.md
- openspec/changes/add-user-authentication/tasks.md
- openspec/changes/add-user-authentication/design.md
- openspec/changes/add-user-authentication/specs/auth/spec.md

### Tasks Defined (in tasks.md):
| # | Title | Priority | Depends On |
|---|-------|----------|------------|
| 1.1 | Create auth middleware | P1 | - |
| 1.2 | Add login endpoint | P1 | - |
| 2.1 | Add JWT validation | P1 | 1.1 |
| 2.2 | Create login UI | P2 | 1.2 |

### Parallel Execution Tracks:
- Track 1: 1.1 → 2.1
- Track 2: 1.2 → 2.2

### Next Steps:
1. Review and approve this proposal
2. Run `/populate-task` to create beads issues from tasks.md
3. Run `/batch-orchestration` to execute tasks
```

## References

- Load `/openspec` skill for OpenSpec conventions
- Run `/populate-task` after approval to create beads issues
- Run `bd prime` for beads workflow context
