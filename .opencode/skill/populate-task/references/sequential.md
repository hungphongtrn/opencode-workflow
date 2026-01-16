# Sequential Population (1-4 tasks)

Use this workflow for small task sets where parallel overhead isn't justified.

## A.1. Identify the Change

```bash
# List active changes
openspec list

# User specifies which change to populate, or use most recent
CHANGE_ID="<change-id>"
```

## A.2. Parse tasks.md

Read the tasks.md file and extract:
- Task hierarchy (sections → tasks)
- Task titles and descriptions
- Priority indicators (P0-P4)
- Dependencies (based on numbering: 2.1 depends on 1.x if specified)
- File paths mentioned
- Acceptance criteria

```bash
# Read the tasks file
cat openspec/changes/$CHANGE_ID/tasks.md

# Also read design.md and proposal.md for context
cat openspec/changes/$CHANGE_ID/proposal.md
cat openspec/changes/$CHANGE_ID/design.md
```

## A.3. Create Beads Issues (CRITICAL - Junior Developer Ready)

**IMPORTANT**: Each beads issue MUST be self-explanatory so a junior developer can complete it without asking questions or needing additional context.

For each unchecked task (`- [ ]`) in tasks.md, create a comprehensive issue:

```bash
bd create "<Action-oriented title>" --type task --priority <0-4> \
  --description="<FULL_DESCRIPTION>"
```

### Required Description Template

Every task description MUST include ALL of the following sections. See `task-template.md` for detailed template.

### Quality Checklist for Each Task

Before creating the beads issue, verify:

- [ ] **Self-contained**: Developer doesn't need to read other docs to start
- [ ] **Actionable**: Clear first step they can take immediately
- [ ] **Specific files**: Exact paths, not vague references
- [ ] **Code examples**: At least one concrete code snippet
- [ ] **Testable**: Clear way to verify completion
- [ ] **No jargon**: Explains domain terms if used
- [ ] **Estimated scope**: Completable in 1-4 hours

## A.4. Add Dependencies

Based on task numbering and explicit dependencies:

```bash
# Add dependencies (child depends on parent)
bd dep add <child-id> <parent-id>
```

Dependency rules:
- Tasks in section 2.x that reference 1.x → depend on those 1.x tasks
- Explicit "Depends On" in task description → create dependency
- Same-section tasks are typically independent (parallel)

## A.5. Verify and Report

```bash
# MUST show created tasks
bd ready

# Get dependency graph
bv --robot-insights
bv --robot-plan
```

**If `bd ready` shows no tasks, STOP and fix the issue.**

Add sync marker to tasks.md:
```markdown
<!-- BEADS_SYNCED: 2024-01-15T10:30:00Z -->
<!-- BEADS_IDS: proj-abc, proj-def, proj-ghi -->
```