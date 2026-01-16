# Parallel Phase Population (5+ tasks)

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
Populate Phase 1 tasks using /populator skill.

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

Follow /populator skill workflow:
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
Populate Phase 2 tasks using /populator skill.
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
Populate Phase 3 tasks using /populator skill.

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