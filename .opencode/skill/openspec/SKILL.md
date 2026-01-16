---
name: openspec
description: |
  OpenSpec instructions for spec-driven development.
  Use when: Working with specs, creating change proposals, implementing changes, or archiving.
  Covers the full OpenSpec workflow: creating, implementing, and archiving changes.
---

# OpenSpec Instructions

## TL;DR Quick Checklist

- Search existing work: `openspec list --specs`, `openspec list`
- Decide scope: new capability vs modify existing
- Pick unique `change-id`: kebab-case, verb-led (`add-`, `update-`, `remove-`)
- Scaffold: `proposal.md`, `tasks.md`, `design.md` (if needed), delta specs
- Write deltas: use `## ADDED|MODIFIED|REMOVED Requirements`
- Validate: `openspec validate <id> --strict`
- Request approval before implementation

## Three-Stage Workflow

| Stage | When | Reference |
|-------|------|-----------|
| **1. Creating Changes** | New feature, breaking change, architecture | Read `references/creating-changes.md` |
| **2. Implementing** | After approval, executing tasks | Read `references/implementing.md` |
| **3. Archiving** | After deployment | Read `references/archiving.md` |

## Before Any Task

- [ ] Read relevant specs in `specs/[capability]/spec.md`
- [ ] Check pending changes in `changes/` for conflicts
- [ ] Read `openspec/project.md` for conventions
- [ ] Run `openspec list` to see active changes

## Directory Structure

```
openspec/
├── project.md              # Project conventions
├── specs/                  # Current truth - what IS built
│   └── [capability]/
│       └── spec.md
└── changes/                # Proposals - what SHOULD change
    ├── [change-name]/
    │   ├── proposal.md     # Why, what, impact
    │   ├── tasks.md        # Implementation checklist
    │   ├── design.md       # Technical decisions (optional)
    │   └── specs/          # Delta changes
    └── archive/            # Completed changes
```

## Decision Tree

```
New request?
├─ Bug fix restoring spec behavior? → Fix directly
├─ Typo/format/comment? → Fix directly  
├─ New feature/capability? → Create proposal
├─ Breaking change? → Create proposal
├─ Architecture change? → Create proposal
└─ Unclear? → Create proposal (safer)
```

## Reference Files

- **Spec format & scenarios**: Read `references/spec-format.md`
- **Troubleshooting**: Read `references/troubleshooting.md`

## CLI Essentials

```bash
openspec list              # What's in progress?
openspec show [item]       # View details
openspec validate --strict # Is it correct?
openspec archive <id> -y   # Mark complete
```