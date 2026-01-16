# Spec File Format

## Critical: Scenario Formatting

**CORRECT** (use #### headers):
```markdown
#### Scenario: User login success
- **WHEN** valid credentials provided
- **THEN** return JWT token
```

**WRONG** (don't use bullets or bold):
```markdown
- **Scenario: User login**  ❌
**Scenario**: User login     ❌
### Scenario: User login      ❌
```

Every requirement MUST have at least one scenario.

## Requirement Wording

- Use SHALL/MUST for normative requirements
- Avoid should/may unless intentionally non-normative

## Delta Operations

| Operation | Use For |
|-----------|---------|
| `## ADDED Requirements` | New capabilities |
| `## MODIFIED Requirements` | Changed behavior |
| `## REMOVED Requirements` | Deprecated features |
| `## RENAMED Requirements` | Name changes |

Headers matched with `trim(header)` - whitespace ignored.

## ADDED vs MODIFIED

- **ADDED**: New capability that stands alone
- **MODIFIED**: Changes existing requirement behavior

## MODIFIED Correctly

1. Locate existing requirement in `openspec/specs/<capability>/spec.md`
2. Copy entire requirement block (header + scenarios)
3. Paste under `## MODIFIED Requirements`
4. Edit to reflect new behavior
5. Keep at least one `#### Scenario:`

**Common pitfall**: Using MODIFIED without including previous text causes loss of detail at archive time.

## RENAMED Example

```markdown
## RENAMED Requirements
- FROM: `### Requirement: Login`
- TO: `### Requirement: User Authentication`
```

## Multi-Capability Changes

Create separate delta files per capability:
```
changes/add-2fa-notify/specs/
├── auth/spec.md           # ADDED: Two-Factor Authentication
└── notifications/spec.md  # ADDED: OTP email notification
```