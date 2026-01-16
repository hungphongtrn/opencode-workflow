---
name: task-populator
description: |
  Populate a single phase/section of tasks from tasks.md into beads with deep codebase analysis.
  Use when: (1) Spawned by /populate-task to handle one phase of task population,
  (2) Need focused, deep analysis for a subset of tasks, (3) Creating junior-dev-ready beads issues.
  This skill: analyzes codebase patterns, finds similar implementations, creates comprehensive issues.
  NOTE: This is a SUBAGENT skill - invoked by /populate-task orchestrator, not directly by users.
---

# Task Populator

Populate ONE phase of tasks with deep codebase analysis to create junior-dev-ready beads issues.

## Input (Provided by Orchestrator)

You will receive:
- `CHANGE_ID`: The OpenSpec change ID
- `PHASE_ID`: Phase/section identifier (e.g., "1", "2.1")
- `PHASE_TASKS`: The tasks to populate (markdown section)
- `PROJECT_PATH`: Absolute path to project
- `ORCHESTRATOR_NAME`: Agent name to report back to

## Workflow

### 1. Load Context

```bash
# Read change context
cat openspec/changes/$CHANGE_ID/proposal.md
cat openspec/changes/$CHANGE_ID/design.md
cat openspec/changes/$CHANGE_ID/tasks.md
```

Parse your assigned phase tasks from the provided `PHASE_TASKS` content.

### 2. Deep Codebase Analysis (Per Task)

For EACH task in your phase, perform focused analysis:

#### 2.1 Identify Affected Files
```bash
# Find files mentioned in task
# Search for similar patterns
```

#### 2.2 Find Similar Implementations
```python
# Use explore agents or grep to find:
# - Similar features already implemented
# - Patterns to follow
# - Test patterns to match
```

#### 2.3 Gather Code Examples
- Find 1-2 concrete code examples from the codebase
- Identify imports and dependencies needed
- Note any gotchas or edge cases from similar code

### 3. Create Beads Issue (Per Task)

For each task, create a comprehensive beads issue:

```bash
bd create "<Action-oriented title>" --type task --priority <0-4> \
  --description="<FULL_DESCRIPTION>"
```

#### Required Description Template

Every task description MUST include ALL sections:

```markdown
## Summary
<1-2 sentence overview of what this task accomplishes>

## Background
<Context a junior developer needs:>
- What problem does this solve?
- How does this fit into the larger feature?
- Any relevant business logic

## Step-by-Step Implementation

### Step 1: <First action>
<Detailed instructions with exact commands or code patterns>

### Step 2: <Second action>
<Detailed instructions>

### Step 3: <Continue as needed>
...

## Files to Create/Modify

| File | Action | What to Do |
|------|--------|------------|
| `src/path/to/file.ts` | CREATE | <Detailed description> |
| `src/path/to/existing.ts` | MODIFY | <Exact changes needed> |

## Code Examples

### Example 1: <What this example shows>
```<language>
// Actual code from THIS codebase the developer can reference
// Include imports, types, and implementation
```

### Example 2: <Pattern to follow>
```<language>
// Show existing patterns in the codebase they should match
// Reference: src/existing/similar-feature.ts
```

## Dependencies & Imports
- Import X from `package-name`
- This task depends on: <list any beads IDs>
- This task blocks: <list any downstream tasks>

## Testing Requirements
- [ ] Unit test: <specific test case>
- [ ] Integration test: <if applicable>
- [ ] Manual verification: <steps>

## Acceptance Criteria
- [ ] <Specific, measurable criterion 1>
- [ ] <Specific, measurable criterion 2>
- [ ] Code passes linting
- [ ] All tests pass

## Common Pitfalls to Avoid
- <Mistake 1 and how to avoid it>
- <Mistake 2 and how to avoid it>

## References
- Spec: openspec/changes/<change-id>/specs/<capability>/spec.md
- Design: openspec/changes/<change-id>/design.md
- Similar code: <path to existing similar implementation>
```

### 4. Track Created Issues

Keep a list of created beads IDs for reporting:
```
CREATED_ISSUES=[]
# After each bd create, capture the ID
```

### 5. Report Back to Orchestrator

Send completion message:

```python
mcp-agent-mail_send_message(
    project_key="<PROJECT_PATH>",
    sender_name="<YourAgentName>",
    to=["<ORCHESTRATOR_NAME>"],
    subject="Phase <PHASE_ID> Population Complete",
    body_md="""
## Phase Population Complete: <PHASE_ID>

**Tasks Populated**: <count>
**Beads IDs Created**:
- <id-1>: <title>
- <id-2>: <title>
- <id-3>: <title>

**Intra-Phase Dependencies**:
- <id-2> depends on <id-1>

**Cross-Phase Dependencies Needed**:
- <id-1> should depend on Phase 1's <task-description>

**Blockers/Questions**:
- None (or list any)
"""
)
```

### 6. Return Results

Return to orchestrator with:
- List of created beads IDs with titles
- Intra-phase dependencies (already added)
- Cross-phase dependencies (for orchestrator to add)
- Any blockers or questions

## Quality Checklist

Before creating each beads issue, verify:

- [ ] **Self-contained**: Developer doesn't need to read other docs
- [ ] **Actionable**: Clear first step they can take immediately
- [ ] **Specific files**: Exact paths, not vague references
- [ ] **Code examples**: At least one concrete snippet FROM THIS CODEBASE
- [ ] **Testable**: Clear way to verify completion
- [ ] **No jargon**: Explains domain terms if used
- [ ] **Estimated scope**: Completable in 1-4 hours

## Failure Handling

If you cannot complete population:

1. Document what was completed
2. Document what failed and why
3. Send failure message to orchestrator:

```python
mcp-agent-mail_send_message(
    project_key="<PROJECT_PATH>",
    sender_name="<YourAgentName>",
    to=["<ORCHESTRATOR_NAME>"],
    subject="Phase <PHASE_ID> Population FAILED",
    importance="high",
    body_md="""
## Phase Population Failed: <PHASE_ID>

**Completed**: <count> tasks
**Failed**: <count> tasks

**Reason**: <why it failed>

**Partial Results**:
- <id-1>: <title> (created)
- Task X: <title> (FAILED - reason)
"""
)
```

## Important Rules

- **Deep analysis**: Spend time finding real code examples
- **Self-explanatory**: Junior dev should need NO clarification
- **Codebase patterns**: Match existing style exactly
- **One phase only**: Stay focused on your assigned phase
- **Report everything**: Send completion message to orchestrator
