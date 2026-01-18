---
description: Execute all plans in a phase with wave-based parallelization using git worktrees and Agent Mail
---

<objective>
Execute all plans in a phase using wave-based parallel execution with git worktrees.

Each plan in a wave runs in an isolated git worktree. Agent Mail coordinates file reservations and completion messaging. After each wave completes, worktrees are merged back sequentially.

Orchestrator stays lean: discover plans, group into waves, setup Agent Mail, spawn parallel executors in worktrees, merge results, verify goals.

Context budget: ~15% orchestrator, 100% fresh per subagent.
</objective>

<execution_context>
@./.opencode/get-shit-done/references/ui-brand.md
@./.opencode/get-shit-done/workflows/execute-phase.md
</execution_context>

<context>
Phase: $ARGUMENTS

**Flags:**
- `--gaps-only` — Execute only gap closure plans (plans with `gap_closure: true` in frontmatter). Use after verify-work creates fix plans.

@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<prerequisites>
- **MCP Agent Mail** server running at `http://127.0.0.1:8765/mcp/`
- **Git** with worktree support
</prerequisites>

<process>
1. **Validate phase exists**
   - Find phase directory matching argument
   - Count PLAN.md files
   - Error if no plans found

2. **Discover plans**
   - List all *-PLAN.md files in phase directory
   - Check which have *-SUMMARY.md (already complete)
   - If `--gaps-only`: filter to only plans with `gap_closure: true`
   - Build list of incomplete plans

3. **Group by wave**
   - Read `wave` from each plan's frontmatter
   - Group plans by wave number
   - Report wave structure to user

4. **Setup Agent Mail**
   ```python
   # Ensure project exists
   mcp-agent-mail_ensure_project(
       human_key="{absolute_project_path}",
       identity_mode="directory"
   )
   
   # Register as orchestrator - SAVE the returned name!
   result = mcp-agent-mail_register_agent(
       project_key="{absolute_project_path}",
       program="gsd-orchestrator",
       model="opencode-default",
       task_description="Phase {phase} Execution Orchestrator"
   )
   ORCHESTRATOR_NAME = result["name"]  # e.g., "BoldMarsh"
   ```

5. **Execute waves with worktrees**
   For each wave in order:
   
   a. **Create worktrees for each plan in wave:**
      ```bash
      git worktree add .worktrees/wt-{phase}-{plan} -b gsd/{phase}-{plan}
      ```
   
   b. **Spawn parallel executors** (all in ONE response for true parallelism):
      ```python
      Task(
          subagent_type="gsd-executor",
          description="Execute plan {phase}-{plan}",
          prompt=f"""
      Execute GSD plan in isolated worktree.

      Plan Path: {plan_path}
      Worktree Path: .worktrees/wt-{phase}-{plan}
      Project Path: {absolute_project_path}
      Orchestrator Name: {ORCHESTRATOR_NAME}
      Phase: {phase}
      Plan: {plan}

      Load the plan file and execute all tasks in the worktree.
      Reserve files via Agent Mail before editing.
      Commit in worktree. Send completion message to orchestrator.
      """
      )
      # Spawn ALL plans in wave simultaneously
      ```
   
   c. **Wait for all agents to complete**
      Task tool blocks until all finish.
   
   d. **Merge worktrees sequentially:**
      For each completed worktree:
      ```bash
      git merge gsd/{phase}-{plan} --no-ff -m "Merge gsd/{phase}-{plan}: {plan_name}"
      ```
      - Run validation after each merge
      - Handle conflicts (stop for complex ones)
   
   e. **Cleanup worktrees:**
      ```bash
      git worktree remove .worktrees/wt-{phase}-{plan}
      git branch -d gsd/{phase}-{plan}
      ```
   
   f. **Verify SUMMARYs created, proceed to next wave**

6. **Aggregate results**
   - Collect summaries from all plans
   - Report phase completion status

7. **Commit any orchestrator corrections**
   Check for uncommitted changes before verification:
   ```bash
   git status --porcelain
   ```

   **If changes exist:** Orchestrator made corrections between executor completions. Commit them:
   ```bash
   git add -u && git commit -m "fix({phase}): orchestrator corrections"
   ```

   **If clean:** Continue to verification.

8. **Verify phase goal**
   - Spawn `gsd-verifier` subagent with phase directory and goal
   - Verifier checks must_haves against actual codebase (not SUMMARY claims)
   - Creates VERIFICATION.md with detailed report
   - Route by status:
     - `passed` → continue to step 9
     - `human_needed` → present items, get approval or feedback
     - `gaps_found` → present gaps, offer `/gsd/plan-phase {X} --gaps`

9. **Update roadmap and state**
   - Update ROADMAP.md, STATE.md

10. **Update requirements**
    Mark phase requirements as Complete:
    - Read ROADMAP.md, find this phase's `Requirements:` line (e.g., "AUTH-01, AUTH-02")
    - Read REQUIREMENTS.md traceability table
    - For each REQ-ID in this phase: change Status from "Pending" to "Complete"
    - Write updated REQUIREMENTS.md
    - Skip if: REQUIREMENTS.md doesn't exist, or phase has no Requirements line

11. **Commit phase completion**
    Bundle all phase metadata updates in one commit:
    - Stage: `git add .planning/ROADMAP.md .planning/STATE.md`
    - Stage REQUIREMENTS.md if updated: `git add .planning/REQUIREMENTS.md`
    - Commit: `docs({phase}): complete {phase-name} phase`

12. **Offer next steps**
    - Route to next action (see `<offer_next>`)
</process>

<offer_next>
Output this markdown directly (not as a code block). Route based on status:

| Status | Route |
|--------|-------|
| `gaps_found` | Route C (gap closure) |
| `human_needed` | Present checklist, then re-route based on approval |
| `passed` + more phases | Route A (next phase) |
| `passed` + last phase | Route B (milestone complete) |

---

**Route A: Phase verified, more phases remain**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PHASE {Z} COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

{Y} plans executed
Goal verified ✓

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Phase {Z+1}: {Name}** — {Goal from ROADMAP.md}

/gsd/discuss-phase {Z+1} — gather context and clarify approach

<sub>/clear first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- /gsd/plan-phase {Z+1} — skip discussion, plan directly
- /gsd/verify-work {Z} — manual acceptance testing before continuing

───────────────────────────────────────────────────────────────

---

**Route B: Phase verified, milestone complete**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► MILESTONE COMPLETE 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**v1.0**

{N} phases completed
All phase goals verified ✓

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Audit milestone** — verify requirements, cross-phase integration, E2E flows

/gsd/audit-milestone

<sub>/clear first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- /gsd/verify-work — manual acceptance testing
- /gsd/complete-milestone — skip audit, archive directly

───────────────────────────────────────────────────────────────

---

**Route C: Gaps found — need additional planning**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PHASE {Z} GAPS FOUND ⚠
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

Score: {N}/{M} must-haves verified
Report: .planning/phases/{phase_dir}/{phase}-VERIFICATION.md

### What's Missing

{Extract gap summaries from VERIFICATION.md}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Plan gap closure** — create additional plans to complete the phase

/gsd/plan-phase {Z} --gaps

<sub>/clear first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- cat .planning/phases/{phase_dir}/{phase}-VERIFICATION.md — see full report
- /gsd/verify-work {Z} — manual testing before planning

───────────────────────────────────────────────────────────────

---

After user runs /gsd/plan-phase {Z} --gaps:
1. Planner reads VERIFICATION.md gaps
2. Creates plans 04, 05, etc. to close gaps
3. User runs /gsd/execute-phase {Z} again
4. Execute-phase runs incomplete plans (04, 05...)
5. Verifier runs again → loop until passed
</offer_next>

<wave_execution>
**Parallel spawning with worktrees:**

For each wave, create worktrees and spawn all executors in a single message:

```bash
# 1. Create worktrees for each plan in wave
git worktree add .worktrees/wt-{phase}-01 -b gsd/{phase}-01
git worktree add .worktrees/wt-{phase}-02 -b gsd/{phase}-02
```

```python
# 2. Spawn all executors in ONE response for true parallelism
Task(
    subagent_type="gsd-executor",
    description="Execute plan {phase}-01",
    prompt=f"""
Execute GSD plan in isolated worktree.

Plan Path: {plan_01_path}
Worktree Path: .worktrees/wt-{phase}-01
Project Path: {absolute_project_path}
Orchestrator Name: {ORCHESTRATOR_NAME}
Phase: {phase}
Plan: 01

Load the plan and execute in worktree. Reserve files via Agent Mail.
Commit in worktree. Send completion message to orchestrator.
"""
)

Task(
    subagent_type="gsd-executor",
    description="Execute plan {phase}-02",
    prompt=f"""
Execute GSD plan in isolated worktree.

Plan Path: {plan_02_path}
Worktree Path: .worktrees/wt-{phase}-02
Project Path: {absolute_project_path}
Orchestrator Name: {ORCHESTRATOR_NAME}
Phase: {phase}
Plan: 02

Load the plan and execute in worktree. Reserve files via Agent Mail.
Commit in worktree. Send completion message to orchestrator.
"""
)
```

All executors run in parallel. Task tool blocks until all complete.

```bash
# 3. After all complete, merge sequentially
git merge gsd/{phase}-01 --no-ff -m "Merge gsd/{phase}-01: {plan_name}"
# Run validation
git merge gsd/{phase}-02 --no-ff -m "Merge gsd/{phase}-02: {plan_name}"
# Run validation

# 4. Cleanup
git worktree remove .worktrees/wt-{phase}-01
git worktree remove .worktrees/wt-{phase}-02
git branch -d gsd/{phase}-01
git branch -d gsd/{phase}-02
```

**No polling.** No background agents. No TaskOutput loops.
</wave_execution>

<checkpoint_handling>
Plans with `autonomous: false` have checkpoints. The execute-phase.md workflow handles the full checkpoint flow:
- Subagent pauses at checkpoint, returns structured state
- Orchestrator presents to user, collects response
- Spawns fresh continuation agent (not resume)

See `@./.opencode/get-shit-done/workflows/execute-phase.md` step `checkpoint_handling` for complete details.
</checkpoint_handling>

<deviation_rules>
During execution, handle discoveries automatically:

1. **Auto-fix bugs** - Fix immediately, document in Summary
2. **Auto-add critical** - Security/correctness gaps, add and document
3. **Auto-fix blockers** - Can't proceed without fix, do it and document
4. **Ask about architectural** - Major structural changes, stop and ask user

Only rule 4 requires user intervention.
</deviation_rules>

<commit_rules>
**Per-Task Commits:**

After each task completes:
1. Stage only files modified by that task
2. Commit with format: `{type}({phase}-{plan}): {task-name}`
3. Types: feat, fix, test, refactor, perf, chore
4. Record commit hash for SUMMARY.md

**Plan Metadata Commit:**

After all tasks in a plan complete:
1. Stage plan artifacts only: PLAN.md, SUMMARY.md
2. Commit with format: `docs({phase}-{plan}): complete [plan-name] plan`
3. NO code files (already committed per-task)

**Phase Completion Commit:**

After all plans in phase complete (step 7):
1. Stage: ROADMAP.md, STATE.md, REQUIREMENTS.md (if updated), VERIFICATION.md
2. Commit with format: `docs({phase}): complete {phase-name} phase`
3. Bundles all phase-level state updates in one commit

**NEVER use:**
- `git add .`
- `git add -A`
- `git add src/` or any broad directory

**Always stage files individually.**
</commit_rules>

<success_criteria>
- [ ] All incomplete plans in phase executed
- [ ] Each plan has SUMMARY.md
- [ ] Phase goal verified (must_haves checked against codebase)
- [ ] VERIFICATION.md created in phase directory
- [ ] STATE.md reflects phase completion
- [ ] ROADMAP.md updated
- [ ] REQUIREMENTS.md updated (phase requirements marked Complete)
- [ ] User informed of next steps
</success_criteria>
