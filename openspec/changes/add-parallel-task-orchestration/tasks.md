# Tasks: Add Parallel Task Orchestration System

## 1. Core Skills Implementation

### 1.1 Spec Planner Skill
- [x] 1.1.1 Create `.opencode/command/spec-planner.md` skill file
- [x] 1.1.2 Define workflow: read project context → create proposal → break into tasks
- [x] 1.1.3 Add beads integration: `bd create` for each task, `bd dep add` for dependencies
- [x] 1.1.4 Add `bv --robot-insights` validation step
- [x] 1.1.5 Add approval gate (STOP before implementation)

### 1.2 Task Execution Skill
- [x] 1.2.1 Create `.opencode/command/task-execution.md` skill file
- [x] 1.2.2 Define worktree creation: `git worktree add ../worktree-<id> -b task/<id>`
- [x] 1.2.3 Add Agent Mail file reservation integration
- [x] 1.2.4 Define implementation workflow with todo tracking
- [x] 1.2.5 Add commit and cleanup steps
- [x] 1.2.6 Define completion reporting format

### 1.3 Batch Orchestration Skill
- [x] 1.3.1 Create `.opencode/command/batch-orchestration.md` skill file
- [x] 1.3.2 Add `bv --robot-triage` and `bv --robot-plan` integration
- [x] 1.3.3 Define task selection logic (max 4, no conflicts)
- [x] 1.3.4 Add human approval gate with task summary
- [x] 1.3.5 Define parallel agent spawning via `task(subagent_type="general")`
- [x] 1.3.6 Add result collection and merge trigger

### 1.4 Merge Coordinator Skill
- [x] 1.4.1 Create `.opencode/command/merge-coordinator.md` skill file
- [x] 1.4.2 Define sequential merge workflow
- [x] 1.4.3 Add conflict detection and human escalation
- [x] 1.4.4 Add worktree cleanup steps
- [x] 1.4.5 Add beads close and sync integration

## 2. Agent Configuration

### 2.1 Coder Agent
- [ ] 2.1.1 Add `coder` agent to `oh-my-opencode.json`
- [ ] 2.1.2 Configure model (Claude Sonnet 4.5) and temperature (0.1)

### 2.2 Categories
- [ ] 2.2.1 Add `spec-changes` category with Opus model and spec-planner prompt
- [ ] 2.2.2 Add `task-execution` category with Sonnet model and task-execution prompt

## 3. Integration Testing

### 3.1 Skill Validation
- [ ] 3.1.1 Test `/spec-planner` with sample feature request
- [ ] 3.1.2 Verify beads tasks created with correct dependencies
- [ ] 3.1.3 Test `/task-execution` in isolated worktree
- [ ] 3.1.4 Verify file reservations work correctly

### 3.2 End-to-End Flow
- [ ] 3.2.1 Test full workflow: spec → tasks → parallel execution → merge
- [ ] 3.2.2 Verify no file conflicts with concurrent agents
- [ ] 3.2.3 Test merge conflict handling

## 4. Documentation

### 4.1 Setup Guide
- [x] 4.1.1 Create `WORKFLOW.md` with manual setup instructions
- [x] 4.1.2 Document prerequisites (bd, bv, openspec, agent-mail)
- [x] 4.1.3 Add troubleshooting section

---

## Parallelization Notes

**Can run in parallel:**
- 1.1.x, 1.2.x, 1.3.x, 1.4.x (all skill files are independent)
- 2.1.x and 2.2.x (config changes are independent)

**Must run sequentially:**
- 3.x depends on 1.x and 2.x completion
- 4.x can start after 1.x but benefits from 3.x insights

**Recommended execution order:**
1. Batch 1: Tasks 1.1.1-1.1.5, 1.2.1-1.2.6, 1.3.1-1.3.6, 1.4.1-1.4.5 (4 parallel tracks)
2. Batch 2: Tasks 2.1.1-2.1.2, 2.2.1-2.2.2 (2 parallel tracks)
3. Batch 3: Tasks 3.1.1-3.2.3 (sequential testing)
4. Batch 4: Tasks 4.1.1-4.1.3 (documentation)
