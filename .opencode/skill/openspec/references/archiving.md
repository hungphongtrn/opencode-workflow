# Archiving Changes

After deployment, archive the change.

## Workflow

1. Create separate PR for archiving
2. Move `changes/[name]/` → `changes/archive/YYYY-MM-DD-[name]/`
3. Update `specs/` if capabilities changed
4. Validate: `openspec validate --strict`

## Commands

```bash
# Standard archive (updates specs)
openspec archive <change-id> --yes

# Tooling-only changes (skip spec updates)
openspec archive <change-id> --skip-specs --yes
```

## Post-Archive Checklist

- [ ] Archived change passes validation
- [ ] Specs updated to reflect new state
- [ ] PR merged to main branch