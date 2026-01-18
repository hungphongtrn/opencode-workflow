<purpose>
Execute all plans in a phase using wave-based parallel execution with git worktrees. Orchestrator stays lean by delegating plan execution to subagents in isolated worktrees, coordinated via Agent Mail.
</purpose>

<core_principle>
The orchestrator's job is coordination, not execution. Each subagent works in its own git worktree with file reservations via Agent Mail. Orchestrator discovers plans, groups into waves, sets up Agent Mail, spawns parallel executors, merges worktrees, handles checkpoints, collects results.
</core_principle>

<prerequisites>
- **MCP Agent Mail** server running at `http://127.0.0.1:8765/mcp/`
- **Git** with worktree support
</prerequisites>

<required_reading>
Read STATE.md before any operation to load project context.
</required_reading>

<process>

<step name="load_project_state" priority="first">
Before any operation, read project state:

```bash
cat .planning/STATE.md 2>/dev/null
```

**If file exists:** Parse and internalize:
- Current position (phase, plan, status)
- Accumulated decisions (constraints on this execution)
- Blockers/concerns (things to watch for)

**If file missing but .planning/ exists:**
```
STATE.md missing but planning artifacts exist.
Options:
1. Reconstruct from existing artifacts
2. Continue without project state (may lose accumulated context)
```

**If .planning/ doesn't exist:** Error - project not initialized.
</step>

<step name="validate_phase">
Confirm phase exists and has plans:

```bash
# Match both zero-padded (05-*) and unpadded (5-*) folders
PADDED_PHASE=$(printf "%02d" ${PHASE_ARG} 2>/dev/null || echo "${PHASE_ARG}")
PHASE_DIR=$(ls -d .planning/phases/${PADDED_PHASE}-* .planning/phases/${PHASE_ARG}-* 2>/dev/null | head -1)
if [ -z "$PHASE_DIR" ]; then
  echo "ERROR: No phase directory matching '${PHASE_ARG}'"
  exit 1
fi

PLAN_COUNT=$(ls -1 "$PHASE_DIR"/*-PLAN.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$PLAN_COUNT" -eq 0 ]; then
  echo "ERROR: No plans found in $PHASE_DIR"
  exit 1
fi
```

Report: "Found {N} plans in {phase_dir}"
</step>

<step name="discover_plans">
List all plans and extract metadata:

```bash
# Get all plans
ls -1 "$PHASE_DIR"/*-PLAN.md 2>/dev/null | sort

# Get completed plans (have SUMMARY.md)
ls -1 "$PHASE_DIR"/*-SUMMARY.md 2>/dev/null | sort
```

For each plan, read frontmatter to extract:
- `wave: N` - Execution wave (pre-computed)
- `autonomous: true/false` - Whether plan has checkpoints
- `gap_closure: true/false` - Whether plan closes gaps from verification/UAT

Build plan inventory:
- Plan path
- Plan ID (e.g., "03-01")
- Wave number
- Autonomous flag
- Gap closure flag
- Completion status (SUMMARY exists = complete)

**Filtering:**
- Skip completed plans (have SUMMARY.md)
- If `--gaps-only` flag: also skip plans where `gap_closure` is not `true`

If all plans filtered out, report "No matching incomplete plans" and exit.
</step>

<step name="group_by_wave">
Read `wave` from each plan's frontmatter and group by wave number:

```bash
# For each plan, extract wave from frontmatter
for plan in $PHASE_DIR/*-PLAN.md; do
  wave=$(grep "^wave:" "$plan" | cut -d: -f2 | tr -d ' ')
  autonomous=$(grep "^autonomous:" "$plan" | cut -d: -f2 | tr -d ' ')
  echo "$plan:$wave:$autonomous"
done
```

**Group plans:**
```
waves = {
  1: [plan-01, plan-02],
  2: [plan-03, plan-04],
  3: [plan-05]
}
```

**No dependency analysis needed.** Wave numbers are pre-computed during `/gsd/plan-phase`.

Report wave structure with context:
```
## Execution Plan

**Phase {X}: {Name}** — {total_plans} plans across {wave_count} waves

| Wave | Plans | What it builds |
|------|-------|----------------|
| 1 | 01-01, 01-02 | {from plan objectives} |
| 2 | 01-03 | {from plan objectives} |
| 3 | 01-04 [checkpoint] | {from plan objectives} |

```

The "What it builds" column comes from skimming plan names/objectives. Keep it brief (3-8 words).
</step>

<step name="setup_agent_mail">
Before executing any waves, setup Agent Mail coordination:

```python
# Get absolute project path
import os
PROJECT_PATH = os.getcwd()

# Ensure project exists in Agent Mail
mcp-agent-mail_ensure_project(
    human_key=PROJECT_PATH,
    identity_mode="directory"
)

# Register as orchestrator - SAVE the returned name!
result = mcp-agent-mail_register_agent(
    project_key=PROJECT_PATH,
    program="gsd-orchestrator",
    model="opencode-default",
    task_description=f"Phase {phase} Execution Orchestrator"
)
ORCHESTRATOR_NAME = result["name"]  # e.g., "BoldMarsh"
```

**CRITICAL**: Save the `name` from the response. You MUST pass this to all subagents so they can send messages back to you.
</step>

<step name="execute_waves">
Execute each wave in sequence. Plans within a wave run in parallel using isolated worktrees.

**For each wave:**

1. **Describe what's being built (BEFORE spawning):**

   Read each plan's `<objective>` section. Extract what's being built and why it matters.

   **Output:**
   ```
   ---

   ## Wave {N}

   **{Plan ID}: {Plan Name}**
   {2-3 sentences: what this builds, key technical approach, why it matters in context}

   **{Plan ID}: {Plan Name}** (if parallel)
   {same format}

   Creating worktrees and spawning {count} agent(s)...

   ---
   ```

   **Examples:**
   - Bad: "Executing terrain generation plan"
   - Good: "Procedural terrain generator using Perlin noise — creates height maps, biome zones, and collision meshes. Required before vehicle physics can interact with ground."

2. **Create worktrees for each plan in wave:**

   ```bash
   # Create isolated worktree for each plan
   git worktree add .worktrees/wt-{phase}-{plan} -b gsd/{phase}-{plan}
   ```

   Each plan gets its own worktree at `.worktrees/wt-{phase}-{plan}` on branch `gsd/{phase}-{plan}`.

3. **Spawn all executors in wave simultaneously:**

   Use Task tool with multiple parallel calls. Each agent gets:

   ```python
   Task(
       subagent_type="gsd-executor",
       description=f"Execute plan {phase}-{plan}",
       prompt=f"""
   Execute GSD plan in isolated worktree.

   Plan Path: {plan_path}
   Worktree Path: .worktrees/wt-{phase}-{plan}
   Project Path: {PROJECT_PATH}
   Orchestrator Name: {ORCHESTRATOR_NAME}
   Phase: {phase}
   Plan: {plan}

   <execution_context>
   @./.opencode/get-shit-done/workflows/execute-plan.md
   @./.opencode/get-shit-done/templates/summary.md
   @./.opencode/get-shit-done/references/checkpoints.md
   @./.opencode/get-shit-done/references/tdd.md
   </execution_context>

   <context>
   Plan: @{plan_path}
   Project state: @.planning/STATE.md
   Config: @.planning/config.json (if exists)
   </context>

   <instructions>
   1. Register with Agent Mail using Project Path
   2. Reserve files before editing via mcp-agent-mail_file_reservation_paths
   3. Work ONLY in your worktree directory
   4. Execute all tasks, commit each atomically IN YOUR WORKTREE
   5. Create SUMMARY.md in phase directory (in worktree)
   6. Release file reservations when done
   7. Send completion message to {ORCHESTRATOR_NAME}
   </instructions>

   <success_criteria>
   - [ ] All tasks executed in worktree
   - [ ] Each task committed individually
   - [ ] SUMMARY.md created in plan directory
   - [ ] File reservations released
   - [ ] Completion message sent to orchestrator
   </success_criteria>
   """
   )
   ```

   **CRITICAL**: Spawn ALL plans in wave in ONE response for true parallelism.

4. **Wait for all agents in wave to complete:**

   Task tool blocks until each agent finishes. All parallel agents return together.

5. **Merge worktrees sequentially:**

   After all agents complete, merge each worktree back to main:

   ```bash
   # Return to main worktree (project root)
   cd {PROJECT_PATH}

   # Merge first worktree
   git merge gsd/{phase}-{plan_1} --no-ff -m "Merge gsd/{phase}-{plan_1}: {plan_name}"

   # Run validation after merge
   # lsp_diagnostics on changed files, or build/test if configured

   # Continue for each plan in wave...
   ```

   **Conflict handling:**
   - For trivial conflicts (whitespace, imports): auto-resolve
   - For complex conflicts: STOP, report to user with diff context

6. **Cleanup worktrees:**

   After successful merge:
   ```bash
   git worktree remove .worktrees/wt-{phase}-{plan}
   git branch -d gsd/{phase}-{plan}
   ```

7. **Report completion and what was built:**

   For each completed agent:
   - Verify SUMMARY.md exists at expected path
   - Read SUMMARY.md to extract what was built
   - Note any issues or deviations

   **Output:**
   ```
   ---

   ## Wave {N} Complete

   **{Plan ID}: {Plan Name}**
   {What was built — from SUMMARY.md deliverables}
   {Notable deviations or discoveries, if any}

   **{Plan ID}: {Plan Name}** (if parallel)
   {same format}

   Merge status: ✓ All worktrees merged successfully
   {If more waves: brief note on what this enables for next wave}

   ---
   ```

   **Examples:**
   - Bad: "Wave 2 complete. Proceeding to Wave 3."
   - Good: "Terrain system complete — 3 biome types, height-based texturing, physics collision meshes. Vehicle physics (Wave 3) can now reference ground surfaces."

8. **Handle failures:**

   If any agent in wave fails:
   - Report which plan failed and why
   - Leave failed worktree intact for debugging
   - Ask user: "Continue with remaining waves?" or "Stop execution?"
   - If continue: proceed to next wave (dependent plans may also fail)
   - If stop: exit with partial completion report

9. **Execute checkpoint plans between waves:**

   See `<checkpoint_handling>` for details.

10. **Proceed to next wave**

</step>

<step name="checkpoint_handling">
Plans with `autonomous: false` require user interaction.

**Detection:** Check `autonomous` field in frontmatter.

**Execution flow for checkpoint plans:**

1. **Spawn agent for checkpoint plan:**
   ```
   Task(prompt="{subagent-task-prompt}", subagent_type="general-purpose")
   ```

2. **Agent runs until checkpoint:**
   - Executes auto tasks normally
   - Reaches checkpoint task (e.g., `type="checkpoint:human-verify"`) or auth gate
   - Agent returns with structured checkpoint (see checkpoint-return.md template)

3. **Agent return includes (structured format):**
   - Completed Tasks table with commit hashes and files
   - Current task name and blocker
   - Checkpoint type and details for user
   - What's awaited from user

4. **Orchestrator presents checkpoint to user:**

   Extract and display the "Checkpoint Details" and "Awaiting" sections from agent return:
   ```
   ## Checkpoint: [Type]

   **Plan:** 03-03 Dashboard Layout
   **Progress:** 2/3 tasks complete

   [Checkpoint Details section from agent return]

   [Awaiting section from agent return]
   ```

5. **User responds:**
   - "approved" / "done" → spawn continuation agent
   - Description of issues → spawn continuation agent with feedback
   - Decision selection → spawn continuation agent with choice

6. **Spawn continuation agent (NOT resume):**

   Use the continuation-prompt.md template:
   ```
   Task(
     prompt=filled_continuation_template,
     subagent_type="general-purpose"
   )
   ```

   Fill template with:
   - `{completed_tasks_table}`: From agent's checkpoint return
   - `{resume_task_number}`: Current task from checkpoint
   - `{resume_task_name}`: Current task name from checkpoint
   - `{user_response}`: What user provided
   - `{resume_instructions}`: Based on checkpoint type (see continuation-prompt.md)

7. **Continuation agent executes:**
   - Verifies previous commits exist
   - Continues from resume point
   - May hit another checkpoint (repeat from step 4)
   - Or completes plan

8. **Repeat until plan completes or user stops**

**Why fresh agent instead of resume:**
Resume relies on Claude Code's internal serialization which breaks with parallel tool calls.
Fresh agents with explicit state are more reliable and maintain full context.

**Checkpoint in parallel context:**
If a plan in a parallel wave has a checkpoint:
- Spawn as normal
- Agent pauses at checkpoint and returns with structured state
- Other parallel agents may complete while waiting
- Present checkpoint to user
- Spawn continuation agent with user response
- Wait for all agents to finish before next wave
</step>

<step name="aggregate_results">
After all waves complete (including merges), aggregate results:

```markdown
## Phase {X}: {Name} Execution Complete

**Waves executed:** {N}
**Plans completed:** {M} of {total}
**Worktrees merged:** {count}

### Wave Summary

| Wave | Plans | Merge Status |
|------|-------|--------------|
| 1 | plan-01, plan-02 | ✓ Merged |
| CP | plan-03 | ✓ Verified & Merged |
| 2 | plan-04 | ✓ Merged |
| 3 | plan-05 | ✓ Merged |

### Plan Details

1. **03-01**: [one-liner from SUMMARY.md]
2. **03-02**: [one-liner from SUMMARY.md]
...

### Issues Encountered
[Aggregate from all SUMMARYs, or "None"]
```
</step>

<step name="merge_conflict_handling">
If merge conflict occurs during wave execution:

**For trivial conflicts** (whitespace, import order):
```bash
# Attempt auto-resolution
git checkout --theirs <file>  # or --ours
git add <file>
git commit -m "Merge gsd/{phase}-{plan}: resolved conflict in <file>"
```

**For complex conflicts:**
1. STOP the merge process
2. Report to user with full context:

```markdown
## Merge Conflict Detected

**Plan:** {phase}-{plan}
**Branch:** gsd/{phase}-{plan}
**Conflicting Files:**
- src/auth/middleware.ts

**Conflict Details:**
\`\`\`diff
<<<<<<< HEAD
// Current branch code
=======
// Incoming worktree code
>>>>>>> gsd/{phase}-{plan}
\`\`\`

**Options:**
1. Keep current (HEAD) version
2. Keep incoming (task) version  
3. Manual resolution needed

**Please advise how to proceed.**
```

3. Wait for user decision before continuing
4. After resolution, continue with remaining merges
</step>

<step name="verify_phase_goal">
Verify phase achieved its GOAL, not just completed its TASKS.

**Spawn verifier:**

```
Task(
  prompt="Verify phase {phase_number} goal achievement.

Phase directory: {phase_dir}
Phase goal: {goal from ROADMAP.md}

Check must_haves against actual codebase. Create VERIFICATION.md.
Verify what actually exists in the code.",
  subagent_type="gsd-verifier"
)
```

**Read verification status:**

```bash
grep "^status:" "$PHASE_DIR"/*-VERIFICATION.md | cut -d: -f2 | tr -d ' '
```

**Route by status:**

| Status | Action |
|--------|--------|
| `passed` | Continue to update_roadmap |
| `human_needed` | Present items to user, get approval or feedback |
| `gaps_found` | Present gap summary, offer `/gsd/plan-phase {phase} --gaps` |

**If passed:**

Phase goal verified. Proceed to update_roadmap.

**If human_needed:**

```markdown
## ✓ Phase {X}: {Name} — Human Verification Required

All automated checks passed. {N} items need human testing:

### Human Verification Checklist

{Extract from VERIFICATION.md human_verification section}

---

**After testing:**
- "approved" → continue to update_roadmap
- Report issues → will route to gap closure planning
```

If user approves → continue to update_roadmap.
If user reports issues → treat as gaps_found.

**If gaps_found:**

Present gaps and offer next command:

```markdown
## ⚠ Phase {X}: {Name} — Gaps Found

**Score:** {N}/{M} must-haves verified
**Report:** {phase_dir}/{phase}-VERIFICATION.md

### What's Missing

{Extract gap summaries from VERIFICATION.md gaps section}

---

## ▶ Next Up

**Plan gap closure** — create additional plans to complete the phase

`/gsd/plan-phase {X} --gaps`

<sub>`/clear` first → fresh context window</sub>

---

**Also available:**
- `cat {phase_dir}/{phase}-VERIFICATION.md` — see full report
- `/gsd/verify-work {X}` — manual testing before planning
```

User runs `/gsd/plan-phase {X} --gaps` which:
1. Reads VERIFICATION.md gaps
2. Creates additional plans (04, 05, etc.) with `gap_closure: true` to close gaps
3. User then runs `/gsd/execute-phase {X} --gaps-only`
4. Execute-phase runs only gap closure plans (04-05)
5. Verifier runs again after new plans complete

User stays in control at each decision point.
</step>

<step name="update_roadmap">
Update ROADMAP.md to reflect phase completion:

```bash
# Mark phase complete
# Update completion date
# Update status
```

Commit phase completion (roadmap, state, verification):
```bash
git add .planning/ROADMAP.md .planning/STATE.md .planning/phases/{phase_dir}/*-VERIFICATION.md
git add .planning/REQUIREMENTS.md  # if updated
git commit -m "docs(phase-{X}): complete phase execution"
```
</step>

<step name="offer_next">
Present next steps based on milestone status:

**If more phases remain:**
```
## Next Up

**Phase {X+1}: {Name}** — {Goal}

`/gsd/plan-phase {X+1}`

<sub>`/clear` first for fresh context</sub>
```

**If milestone complete:**
```
MILESTONE COMPLETE!

All {N} phases executed.

`/gsd/complete-milestone`
```
</step>

</process>

<context_efficiency>
**Why this works:**

Orchestrator context usage: ~10-15%
- Read plan frontmatter (small)
- Setup Agent Mail (one-time)
- Create worktrees (bash commands)
- Fill template strings
- Spawn Task calls
- Merge worktrees sequentially
- Collect results

Each subagent: Fresh 200k context
- Works in isolated worktree
- Reserves files via Agent Mail
- Loads full execute-plan workflow
- Loads templates, references
- Executes plan with full capacity
- Creates SUMMARY, commits in worktree
- Sends completion message

**No polling.** Task tool blocks until completion. No TaskOutput loops.

**No context bleed.** Orchestrator never reads workflow internals. Just paths and results.

**No file conflicts.** Agent Mail file reservations prevent parallel agents from editing same files.
</context_efficiency>

<failure_handling>
**Subagent fails mid-plan:**
- SUMMARY.md won't exist in worktree
- Worktree left intact for debugging
- Agent sends failure message via Agent Mail
- Orchestrator detects missing SUMMARY
- Reports failure, asks user how to proceed

**Dependency chain breaks:**
- Wave 1 plan fails
- Wave 2 plans depending on it will likely fail
- Orchestrator can still attempt them (user choice)
- Or skip dependent plans entirely

**All agents in wave fail:**
- Something systemic (git issues, permissions, etc.)
- Stop execution
- Report for manual investigation
- Leave all worktrees intact

**Merge conflict:**
- Trivial conflicts: auto-resolve
- Complex conflicts: stop, present to user, wait for decision
- See `merge_conflict_handling` step

**Checkpoint fails to resolve:**
- User can't approve or provides repeated issues
- Ask: "Skip this plan?" or "Abort phase execution?"
- Record partial progress in STATE.md

**Worktree cleanup on failure:**
```bash
# List orphaned worktrees
git worktree list

# Force remove if needed
git worktree remove --force .worktrees/wt-{phase}-{plan}

# Prune stale references
git worktree prune
```
</failure_handling>

<resumption>
**Resuming interrupted execution:**

If phase execution was interrupted (context limit, user exit, error):

1. Run `/gsd/execute-phase {phase}` again
2. discover_plans finds completed SUMMARYs (in main branch after merge)
3. Skips completed plans
4. Resumes from first incomplete plan
5. Creates new worktrees for remaining plans
6. Continues wave-based execution

**STATE.md tracks:**
- Last completed plan
- Current wave
- Any pending checkpoints
- Worktrees that need cleanup

**Orphaned worktree cleanup:**
```bash
# Check for leftover worktrees
git worktree list

# Remove orphaned worktrees
git worktree remove .worktrees/wt-{phase}-{plan}
git branch -d gsd/{phase}-{plan}
```
</resumption>
