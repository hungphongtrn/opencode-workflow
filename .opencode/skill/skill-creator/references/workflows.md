# Workflow Patterns

## Sequential Workflows

For complex tasks, break operations into clear, sequential steps. It is often helpful to give Claude an overview of the process towards the beginning of SKILL.md:

```markdown
Filling a PDF form involves these steps:

1. Analyze the form (run analyze_form.py)
2. Create field mapping (edit fields.json)
3. Validate mapping (run validate_fields.py)
4. Fill the form (run fill_form.py)
5. Verify output (run verify_output.py)
```

## Conditional Workflows

For tasks with branching logic, guide Claude through decision points:

```markdown
1. Determine the modification type:
   **Creating new content?** → Follow "Creation workflow" below
   **Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow: [steps]
3. Editing workflow: [steps]
```

## Parallel Orchestration Workflows

For skills that can benefit from parallel execution, use an orchestrator pattern with subagent skills:

### When to Use

- Task involves multiple independent phases or sections
- Deep analysis per phase would benefit from focused context
- Workload can be divided without cross-dependencies
- Quality improves with concentrated attention per unit

### Pattern: Orchestrator + Subagent Skills

```
┌─────────────────────────────────────────────────────────────────┐
│  Main Skill (Orchestrator)                                      │
│  ├─ Parse input into independent units (phases, sections, etc.) │
│  ├─ Choose mode based on unit count:                            │
│  │   ├─ Small (1-4 units): Sequential (direct processing)       │
│  │   └─ Large (5+ units): Parallel (spawn subagents)            │
│  ├─ Present plan for approval (if needed)                       │
│  └─ Spawn parallel subagent skills:                             │
│      ┌─────────────────┬─────────────────┬─────────────────┐    │
│      ▼                 ▼                 ▼                 │    │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐            │    │
│  │Subagent │      │Subagent │      │Subagent │            │    │
│  │ Unit 1  │      │ Unit 2  │      │ Unit 3  │            │    │
│  │- Focused│      │- Focused│      │- Focused│            │    │
│  │  context│      │  context│      │  context│            │    │
│  │- Deep   │      │- Deep   │      │- Deep   │            │    │
│  │  analysis│     │  analysis│     │  analysis│           │    │
│  └────┬────┘      └────┬────┘      └────┬────┘            │    │
│       └────────────────┼────────────────┘                 │    │
│                        ▼                                  │    │
│  ├─ Collect results from all subagents                    │    │
│  ├─ Add cross-unit relationships/dependencies             │    │
│  └─ Report consolidated results                           │    │
└─────────────────────────────────────────────────────────────────┘
```

### Example: Task Population

The `/populate-task` skill uses this pattern:

**Orchestrator skill** (`/populate-task`):
- Parses tasks.md into phases (## sections)
- Counts tasks to choose mode
- Spawns `/task-populator` subagents for each phase
- Collects results and adds cross-phase dependencies

**Subagent skill** (`/task-populator`):
- Receives one phase of tasks
- Performs deep codebase analysis
- Creates rich, self-explanatory beads issues
- Reports back with created IDs

### Implementation Guidelines

1. **Orchestrator skill SKILL.md structure:**
```markdown
## Workflow Selection

| Unit Count | Mode | Rationale |
|------------|------|-----------|
| 1-4 units | Sequential | Low overhead |
| 5+ units | Parallel | Deep analysis per unit |

# Section A: Sequential Mode
[Direct processing workflow]

# Section B: Parallel Mode
[Subagent spawning workflow]
```

2. **Subagent skill SKILL.md structure:**
```markdown
## Input (Provided by Orchestrator)
- UNIT_ID: Which unit to process
- UNIT_CONTENT: The content to process
- ORCHESTRATOR_NAME: Agent to report back to

## Workflow
1. Load context
2. Deep analysis
3. Process unit
4. Report back to orchestrator
```

3. **Communication via Agent Mail:**
- Orchestrator registers and saves its name
- Passes orchestrator name to subagents
- Subagents send completion messages back
- Orchestrator collects via `fetch_inbox`

### Benefits

| Aspect | Sequential | Parallel |
|--------|------------|----------|
| Context per unit | Shared (diluted) | Dedicated (focused) |
| Analysis depth | Shallow | Deep |
| Output quality | Variable | Consistently rich |
| Execution time | Linear | Parallel |
| Downstream cost | Higher (needs smart agents) | Lower (dumb agents work) |