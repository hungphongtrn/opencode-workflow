# Technology Stack: Orchestration & Isolation

**Project:** Multi-Agent Workflow Orchestration
**Researched:** 2026-01-18

## Recommended Stack

### Core Framework/Tooling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Git Worktrees | 2.31+ | Task Isolation | Allows parallel agents to work on the same repo in separate directories without full clones. |
| Agent Mail | Custom | Reservation | File-based messaging/locking to prevent edit conflicts. |
| PLAN.md | Markdown | SOT | Human-readable and machine-parsable single source of truth for task state. |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Fast-Glob | Latest | File Discovery | Used by agents to find files for reservation/editing. |
| Zod | Latest | Plan Parsing | Strongly typing the PLAN.md structure to prevent corruption. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Isolation | Worktrees | Full Clones | Clones are too slow and disk-intensive for high-frequency parallel agents. |
| Locking | Agent Mail | Redis/DB | Adding a database adds significant complexity; file-based is simpler for git-centric workflows. |

## Sources
- [Git Worktree Docs](https://git-scm.com/docs/git-worktree)
- [Agent Mail Specs]
