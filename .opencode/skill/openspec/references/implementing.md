# Implementing Changes

Track these steps as TODOs and complete them one by one.

## Workflow

1. **Read proposal.md** - Understand what's being built
2. **Read design.md** (if exists) - Review technical decisions
3. **Read tasks.md** - Get implementation checklist
4. **Implement tasks sequentially** - Complete in order
5. **Confirm completion** - Ensure every item finished
6. **Update checklist** - Set every task to `- [x]`

## Important

- **Approval gate**: Do NOT start implementation until proposal is approved
- **Sequential execution**: Complete tasks in order unless explicitly parallel
- **Update as you go**: Mark tasks complete immediately after finishing

## Validation

After implementation:
```bash
openspec validate <change-id> --strict
```

Fix any issues before proceeding to archiving.