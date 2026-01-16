# Creating Change Proposals

Create proposal when you need to:
- Add features or functionality
- Make breaking changes (API, schema)
- Change architecture or patterns
- Optimize performance (changes behavior)
- Update security patterns

## Triggers (examples)
- "Help me create a change proposal"
- "Help me plan a change"
- "Help me create a proposal"
- "I want to create a spec proposal"
- "I want to create a spec"

**Loose matching guidance**:
- Contains one of: `proposal`, `change`, `spec`
- With one of: `create`, `plan`, `make`, `start`, `help`

## Skip proposal for:
- Bug fixes (restore intended behavior)
- Typos, formatting, comments
- Dependency updates (non-breaking)
- Configuration changes
- Tests for existing behavior

## Workflow

1. **Review context**: `openspec/project.md`, `openspec list`, `openspec list --specs`
2. **Choose unique change-id**: kebab-case, verb-led (`add-`, `update-`, `remove-`, `refactor-`)
3. **Scaffold directory**: `openspec/changes/<id>/`
4. **Create files**: `proposal.md`, `tasks.md`, optional `design.md`, spec deltas
5. **Validate**: `openspec validate <id> --strict`
6. **Request approval** before implementation

## proposal.md Template

```markdown
# Change: [Brief description]

## Why
[1-2 sentences on problem/opportunity]

## What Changes
- [Bullet list of changes]
- [Mark breaking changes with **BREAKING**]

## Impact
- Affected specs: [list capabilities]
- Affected code: [key files/systems]
```

## tasks.md Template

```markdown
## 1. Implementation
- [ ] 1.1 Create database schema
- [ ] 1.2 Implement API endpoint
- [ ] 1.3 Add frontend component
- [ ] 1.4 Write tests
```

## design.md (When Needed)

Create if any apply:
- Cross-cutting change (multiple services/modules)
- New external dependency or significant data model changes
- Security, performance, or migration complexity
- Ambiguity benefiting from upfront decisions

**Skeleton**:
```markdown
## Context
[Background, constraints, stakeholders]

## Goals / Non-Goals
- Goals: [...]
- Non-Goals: [...]

## Decisions
- Decision: [What and why]
- Alternatives considered: [Options + rationale]

## Risks / Trade-offs
- [Risk] → Mitigation

## Migration Plan
[Steps, rollback]

## Open Questions
- [...]
```

## Spec Deltas

Create under `changes/<id>/specs/<capability>/spec.md`:

```markdown
## ADDED Requirements
### Requirement: New Feature
The system SHALL provide...

#### Scenario: Success case
- **WHEN** user performs action
- **THEN** expected result

## MODIFIED Requirements
### Requirement: Existing Feature
[Complete modified requirement - paste full text]

## REMOVED Requirements
### Requirement: Old Feature
**Reason**: [Why removing]
**Migration**: [How to handle]
```

## Change ID Naming

- Use kebab-case: `add-two-factor-auth`
- Verb-led prefixes: `add-`, `update-`, `remove-`, `refactor-`
- Ensure uniqueness; append `-2`, `-3` if taken

## Multi-Capability Changes

Create separate delta files per capability:
```
changes/add-2fa-notify/specs/
├── auth/spec.md           # ADDED: Two-Factor Authentication
└── notifications/spec.md  # ADDED: OTP email notification
```