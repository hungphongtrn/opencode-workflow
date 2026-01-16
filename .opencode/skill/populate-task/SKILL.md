---
name: populate-task
description: |
  Load tasks from an approved OpenSpec tasks.md into beads issue tracker.
  Use when: (1) User approves a spec proposal, (2) User says "populate tasks", "create beads", "load tasks",
  (3) After /spec-planner completes and user approves, (4) User wants to sync tasks.md to beads.
  This skill parses tasks.md, creates beads issues with dependencies, and marks tasks.md items as synced.
  Supports two modes: Sequential (default for <5 tasks) or Parallel Phase Population (5+ tasks).
---

# Populate Task

Load tasks from an approved OpenSpec change's tasks.md into beads issue tracker.

## Prerequisites

- An approved OpenSpec change with `tasks.md` file
- Beads CLI (`bd`) installed and initialized
- Run after `/spec-planner` and user approval

## Workflow Selection

**Choose based on task count:**

| Task Count | Mode | Rationale |
|------------|------|-----------|
| 1-4 tasks | **Sequential** (Section A) | Low overhead, direct population |
| 5+ tasks | **Parallel Phase** (Section B) | Deep analysis per phase, richer descriptions |

Count unchecked tasks (`- [ ]`) in tasks.md to decide.

---

# Section A: Sequential Population (1-4 tasks)

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

#### Required Description Template

Every task description MUST include ALL of the following sections:

```markdown
## Summary
<1-2 sentence overview of what this task accomplishes and why it matters>

## Background
<Context a junior developer needs to understand:>
- What problem does this solve?
- How does this fit into the larger feature?
- Any relevant business logic or domain knowledge

## Step-by-Step Implementation

### Step 1: <First action>
<Detailed instructions with exact commands or code patterns>

### Step 2: <Second action>
<Detailed instructions with exact commands or code patterns>

### Step 3: <Continue as needed>
...

## Files to Create/Modify

| File | Action | What to Do |
|------|--------|------------|
| `src/path/to/file.ts` | CREATE | <Detailed description of file purpose and contents> |
| `src/path/to/existing.ts` | MODIFY | <Exact changes: add function X, update import Y> |

## Code Examples

### Example 1: <What this example shows>
```typescript
// Provide actual code the developer can reference or copy
// Include imports, types, and implementation
```

### Example 2: <Pattern to follow>
```typescript
// Show existing patterns in the codebase they should match
// Reference: src/existing/similar-feature.ts
```

## Dependencies & Imports
- Import X from `package-name`
- This task depends on: <list any beads IDs or completed work>
- This task blocks: <list any downstream tasks>

## Testing Requirements
- [ ] Unit test: <specific test case to write>
- [ ] Integration test: <if applicable>
- [ ] Manual verification: <steps to manually verify>

## Acceptance Criteria
- [ ] <Specific, measurable criterion 1>
- [ ] <Specific, measurable criterion 2>
- [ ] <Specific, measurable criterion 3>
- [ ] Code passes linting (`npm run lint` or equivalent)
- [ ] All tests pass (`npm test` or equivalent)

## Common Pitfalls to Avoid
- <Mistake 1 and how to avoid it>
- <Mistake 2 and how to avoid it>

## References
- Spec: openspec/changes/<change-id>/specs/<capability>/spec.md
- Design: openspec/changes/<change-id>/design.md
- Similar code: <path to existing similar implementation>
- Docs: <link to relevant documentation>

## Questions? Ask About
- <Topic 1 that might need clarification>
- <Topic 2 that might need clarification>
```

#### Quality Checklist for Each Task

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

---

# Section B: Parallel Phase Population (5+ tasks)

Use this workflow for larger task sets to get deeper analysis and richer descriptions.

## B.1. Identify the Change

```bash
openspec list
CHANGE_ID="<change-id>"

# Read and parse tasks.md
cat openspec/changes/$CHANGE_ID/tasks.md
```

## B.2. Parse Phases from tasks.md

Identify distinct phases/sections in tasks.md:
- Each `## N. Section Name` is a phase
- Count tasks per phase
- Note cross-phase dependencies

Example structure:
```
## 1. Core Infrastructure     → Phase 1 (4 tasks)
## 2. API Implementation      → Phase 2 (3 tasks)  
## 3. Frontend Integration    → Phase 3 (3 tasks)
## 4. Testing & Documentation → Phase 4 (2 tasks)
```

## B.3. Setup Agent Mail

```python
# Ensure project exists
mcp-agent-mail_ensure_project(
    human_key="/absolute/path/to/project"
)

# Register as orchestrator
result = mcp-agent-mail_register_agent(
    project_key="/absolute/path/to/project",
    program="opencode",
    model="opencode-default",
    task_description="Task Population Orchestrator"
)
ORCHESTRATOR_NAME = result["name"]  # Save this!
```

## B.4. Present Phase Plan for Approval

**STOP and present to user:**

```markdown
## Parallel Population Plan

### Change: <CHANGE_ID>

### Phases Identified:
| Phase | Section | Tasks | Can Parallelize |
|-------|---------|-------|-----------------|
| 1 | Core Infrastructure | 4 | ✅ Yes |
| 2 | API Implementation | 3 | ✅ Yes |
| 3 | Frontend Integration | 3 | ⚠️ After Phase 2 |
| 4 | Testing & Docs | 2 | ⚠️ After Phase 1-3 |

### Parallel Batches:
- **Batch 1**: Phases 1, 2 (independent, run in parallel)
- **Batch 2**: Phase 3 (depends on Phase 2)
- **Batch 3**: Phase 4 (depends on all)

### Estimated Time: ~10-15 minutes

**Approve parallel population? (yes/no)**
```

Wait for explicit approval.

## B.5. Spawn Parallel Task Populator Agents

Spawn agents for independent phases in ONE response:

```python
# Phase 1 Agent
task(
    subagent_type="general",
    description="Populate Phase 1 tasks",
    prompt=f"""
Populate Phase 1 tasks using /task-populator skill.

CHANGE_ID: {CHANGE_ID}
PHASE_ID: 1
PROJECT_PATH: /absolute/path/to/project
ORCHESTRATOR_NAME: {ORCHESTRATOR_NAME}

PHASE_TASKS:
## 1. Core Infrastructure
### 1.1 Task Title
- [ ] Description...
### 1.2 Task Title
- [ ] Description...
[... paste full phase section ...]

Follow /task-populator skill workflow:
1. Load context (proposal.md, design.md)
2. Deep codebase analysis for each task
3. Create junior-dev-ready beads issues
4. Report back with created IDs and dependencies
"""
)

# Phase 2 Agent (in same response for parallelism)
task(
    subagent_type="general",
    description="Populate Phase 2 tasks",
    prompt=f"""
Populate Phase 2 tasks using /task-populator skill.
[... similar structure ...]
"""
)
```

**Key points:**
- Use `subagent_type="general"` for population agents
- Spawn ALL independent phases in ONE response
- Each agent gets its phase's tasks as input
- Each agent reports back via Agent Mail

## B.6. Collect Results

After agents complete, collect via Agent Mail:

```python
mcp-agent-mail_fetch_inbox(
    project_key="/absolute/path/to/project",
    agent_name=ORCHESTRATOR_NAME,
    include_bodies=True
)
```

Parse results from each agent:
- Created beads IDs
- Intra-phase dependencies (already added by agent)
- Cross-phase dependencies (need to add)

## B.7. Add Cross-Phase Dependencies

Based on agent reports and tasks.md structure:

```bash
# Phase 2 task depends on Phase 1 task
bd dep add <phase2-task-id> <phase1-task-id>

# Phase 3 depends on Phase 2
bd dep add <phase3-task-id> <phase2-task-id>
```

## B.8. Spawn Next Batch (if needed)

If phases have dependencies (e.g., Phase 3 depends on Phase 2 being populated):

```python
# After Batch 1 completes, spawn Batch 2
task(
    subagent_type="general",
    description="Populate Phase 3 tasks",
    prompt=f"""
Populate Phase 3 tasks using /task-populator skill.

Note: Phase 1 and 2 are already populated. Reference these beads IDs:
- Phase 1: proj-abc, proj-def, proj-ghi, proj-jkl
- Phase 2: proj-mno, proj-pqr, proj-stu

[... phase 3 tasks ...]
"""
)
```

## B.9. Verify and Report

```bash
# Verify all tasks created
bd ready
bd list

# Get full dependency graph
bv --robot-insights
bv --robot-plan
```

Add sync marker to tasks.md:
```markdown
<!-- BEADS_SYNCED: 2024-01-15T10:30:00Z -->
<!-- BEADS_IDS: proj-abc, proj-def, ... (all IDs) -->
<!-- POPULATION_MODE: parallel -->
<!-- PHASES_POPULATED: 1, 2, 3, 4 -->
```

Present final report:

```markdown
## Population Complete

### Summary:
| Phase | Tasks Created | Beads IDs |
|-------|---------------|-----------|
| 1 | 4 | proj-abc, proj-def, proj-ghi, proj-jkl |
| 2 | 3 | proj-mno, proj-pqr, proj-stu |
| 3 | 3 | proj-vwx, proj-yza, proj-bcd |
| 4 | 2 | proj-efg, proj-hij |

### Dependency Graph:
[Output from bv --robot-plan]

### Next Steps:
1. Review created issues: `bd show <id>`
2. Run `/batch-orchestration` to execute tasks
```

---

# Common Elements

## Handling Already-Checked Tasks

- Tasks marked `- [x]` in tasks.md are SKIPPED (already done)
- Only `- [ ]` tasks are created as beads issues
- This allows incremental population if some tasks were done manually

## Re-running Populate

If you need to re-populate (e.g., tasks.md was updated):

1. Check existing beads: `bd list`
2. Close or delete outdated issues if needed
3. Run populate again - it will create new issues for unchecked tasks

## Priority Mapping

| tasks.md | Beads Priority |
|----------|----------------|
| P0, Critical | --priority 0 |
| P1, High | --priority 1 |
| P2, Medium (default) | --priority 2 |
| P3, Low | --priority 3 |
| P4, Backlog | --priority 4 |

## Example: Well-Written Task

```markdown
## Summary
Create the JWT authentication middleware that validates tokens on protected API routes.
This is the foundation for all authenticated endpoints in the application.

## Background
We're adding user authentication to the app. This middleware will:
- Run before protected route handlers
- Extract JWT from Authorization header
- Validate token signature and expiration
- Attach user info to the request object

The login endpoint (separate task) will issue these tokens.

## Step-by-Step Implementation

### Step 1: Create the middleware file
Create `src/middleware/auth.ts` with the basic structure.

### Step 2: Implement token extraction
Parse the Authorization header to get the Bearer token.

### Step 3: Implement token validation
Use jsonwebtoken library to verify the token.

### Step 4: Attach user to request
Add the decoded user payload to `req.user`.

### Step 5: Export and integrate
Export the middleware and add to route definitions.

## Files to Create/Modify

| File | Action | What to Do |
|------|--------|------------|
| `src/middleware/auth.ts` | CREATE | Main middleware implementation |
| `src/middleware/index.ts` | MODIFY | Add export for auth middleware |
| `src/types/express.d.ts` | MODIFY | Extend Request type with user property |

## Code Examples

### Example 1: Middleware structure
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Example 2: Type extension pattern (follow existing pattern)
```typescript
// src/types/express.d.ts
declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}
```

## Dependencies & Imports
- `jsonwebtoken` - already in package.json
- `JWT_SECRET` env var - defined in .env.example
- This task blocks: proj-ghi (Add JWT validation to routes)

## Testing Requirements
- [ ] Unit test: Valid token passes and attaches user
- [ ] Unit test: Missing token returns 401
- [ ] Unit test: Invalid token returns 401
- [ ] Unit test: Expired token returns 401

## Acceptance Criteria
- [ ] Middleware exported from `src/middleware/auth.ts`
- [ ] Correctly extracts Bearer token from header
- [ ] Validates token using JWT_SECRET
- [ ] Attaches decoded user to `req.user`
- [ ] Returns 401 with JSON error for invalid/missing tokens
- [ ] TypeScript compiles without errors
- [ ] All tests pass

## Common Pitfalls to Avoid
- Don't forget to handle the case where JWT_SECRET is undefined
- Remember to call `next()` after successful validation
- The token is after "Bearer " (with space), use substring(7) not split

## References
- Spec: openspec/changes/add-user-auth/specs/auth/spec.md
- Design: openspec/changes/add-user-auth/design.md
- Similar: src/middleware/logging.ts (middleware pattern)
- Docs: https://github.com/auth0/node-jsonwebtoken

## Questions? Ask About
- Token expiration duration (currently 24h, see design.md)
- Whether to support refresh tokens (out of scope for this task)
```

## References

- Run after `/spec-planner` approval
- See `openspec/AGENTS.md` for OpenSpec conventions
- Run `bd prime` for beads workflow context
- Run `/batch-orchestration` after populating to execute tasks
- Use `/task-populator` skill for parallel phase population (Section B)
