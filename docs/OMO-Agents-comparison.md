# Oh-My-OpenCode Agents vs GSD Agents Comparison

### Executive Summary
- OMO agents are general-purpose specialists with different models optimized for different tasks
- GSD agents are workflow-specific skills tied to GSD's `.planning/` structure
- Recommendation: Keep OMO agents, convert GSD agents to skills

### Section 1: Oh-My-OpenCode Agents (Current)

Table with columns: Agent | Model | Purpose

| Agent | Model | Purpose |
|-------|-------|---------|
| Sisyphus | Claude Opus 4.5 | Main orchestrator |
| explore | OpenCode Grok-Code | Codebase exploration, contextual grep |
| librarian | Gemini 3 Flash | External docs, library research, GitHub search |
| oracle | Claude Sonnet 4.5 | Strategic guidance, architecture decisions |
| frontend-ui-ux-engineer | Gemini 3 Pro High | UI/UX design specialist |
| document-writer | Gemini 3 Flash | Documentation |
| multimodal-looker | Gemini 3 Flash | Visual/PDF analysis |
| OpenCode-Builder | OpenCode GLM-4.7 | Task execution in worktrees |

### Section 2: GSD Agents (Get-Shit-Done)

Table with columns: Agent | Tools | Purpose

| Agent | Tools | Purpose |
|-------|-------|---------|
| gsd-executor | Read, Write, Edit, Bash, Grep, Glob | Execute PLAN.md files with atomic commits, deviation handling |
| gsd-planner | Read, Write, Bash, Glob, Grep, WebFetch, Context7 | Create executable phase plans with task breakdown |
| gsd-debugger | Read, Write, Edit, Bash, Grep, Glob, WebSearch | Scientific debugging with hypothesis testing |
| gsd-verifier | Read, Bash, Grep, Glob | Goal-backward verification (not just task completion) |
| gsd-phase-researcher | Read, Write, Bash, Grep, Glob, WebSearch, WebFetch, Context7 | Research before planning |
| gsd-codebase-mapper | Read, Bash, Grep, Glob, Write | Analyze codebase structure/conventions |

### Section 3: Comparison Table

Table mapping GSD agents to OMO equivalents with key differences:

| GSD Agent | Closest OMO Equivalent | Key Differences |
|-----------|------------------------|-----------------|
| gsd-executor | OpenCode-Builder + /coder skill | GSD has richer deviation rules, checkpoint protocols, TDD support. OMO has worktree isolation + file reservations |
| gsd-planner | /spec-planner + /populate-task | GSD has wave-based parallelism, goal-backward must-haves. OMO has beads integration + dependency graphs |
| gsd-debugger | oracle (partial) | GSD is specialized debugger with persistent state. Oracle is general advisor |
| gsd-verifier | No equivalent | GSD verifies goal achievement, not just task completion. Unique value |
| gsd-phase-researcher | librarian (partial) | GSD is phase-focused research. Librarian is general external research |
| gsd-codebase-mapper | explore (partial) | GSD writes structured docs. Explore is contextual grep |

### Section 4: Recommendation

**Do NOT remove Oh-My-OpenCode agents.**

Reasons:
1. Different Purposes - OMO agents are general-purpose specialists, GSD agents are workflow-specific
2. Model Diversity - OMO agents use different models optimized for their tasks
3. Complementary, Not Competing - They serve different needs
4. GSD Agents Add Value, Don't Replace - gsd-verifier and gsd-debugger are unique

### Section 5: Integration Strategy

Table showing what to keep vs convert:

| Keep (OMO Agents) | Convert to Skills (GSD Agents) |
|-------------------|-------------------------------|
| explore - contextual grep | gsd-executor → enhance /coder skill with deviation rules |
| librarian - external research | gsd-planner → enhance /spec-planner with wave-based planning |
| oracle - strategic advisor | gsd-debugger → new /debug skill |
| frontend-ui-ux-engineer - UI/UX | gsd-verifier → new /verify-work skill |
| document-writer - docs | gsd-phase-researcher → enhance /spec-planner with research phase |
| multimodal-looker - visual analysis | gsd-codebase-mapper → new /map-codebase skill |

### Section 6: Why This Works

- **OMO agents = model configurations** (which LLM, temperature, specialized prompts)
- **GSD agents = workflow instructions** (how to structure work, what files to create)
- **Skills can invoke OMO agents** (e.g., `/debug` skill could spawn `oracle` for hard bugs, `/spec-planner` could spawn `librarian` for research)

This separation allows:
1. **Best models for each task** - Oracle uses Claude Sonnet for reasoning, librarian uses Gemini for speed
2. **Reusable workflow patterns** - GSD's deviation rules, verification, debugging can be applied across different agent configurations
3. **Flexibility** - Swap models without changing workflow logic

---

*Generated: 2026-01-18*
*Sources: `.opencode/oh-my-opencode.json`, `get-shit-done/agents/`*
