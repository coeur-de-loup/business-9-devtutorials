# Post-Tool Hooks Configuration

**Date:** January 9, 2026
**Bead:** business_9-19
**Status:** ✅ Complete

## Overview

Post-tool hooks have been configured in `.claude/settings.json` to automatically export the beads database after bead operations, ensuring the git-backed beads database is always up-to-date.

## Configuration

### File: `.claude/settings.json`

```json
{
  "postToolHooks": [
    {
      "pattern": "^bd (close|compact)$",
      "command": "bd export --json -o .beads/issues.jsonl"
    }
  ]
}
```

### How It Works

1. **Trigger Events:** The hook activates after any `bd close` or `bd compact` command
2. **Automatic Export:** Runs `bd export` to save the beads database to `.beads/issues.jsonl`
3. **Git-Backed Storage:** The exported file can be committed to git for backup

### Pattern Matching

The regex pattern `^bd (close|compact)$` matches:
- `bd close <id>` - Closing a bead
- `bd compact` - Compacting old beads

## Benefits

✅ **Prevents Data Loss:** Automatic export ensures no bead closures are lost
✅ **Git-Backed Database:** `.beads/issues.jsonl` can be committed and pushed to remote
✅ **No Manual Steps:** Developers don't need to remember to run `bd export`
✅ **Consistent with Sibling Businesses:** Uses the same pattern as business_6 and business_7

## Testing

The automation was verified by:
1. Creating test bead business_9-20
2. Closing the bead
3. Verifying the bead appeared in `.beads/issues.jsonl`
4. Confirming the database was updated with the new bead

## Git Sync Workflow

With post-tool hooks configured, the git sync workflow is now:

```bash
# 1. Close bead (triggers automatic export via hook)
bd close <id> --reason "Done"

# 2. Export beads database (redundant now due to hook, but safe to keep)
bd export -o .beads/issues.jsonl

# 3. Stage changes
git add .beads/issues.jsonl
git add .

# 4. Commit
git commit -m "Complete <bead-id>: <description>"

# 5. Push
git push
```

**Note:** Step 2 is now technically redundant due to the hook, but it doesn't hurt to keep it as a safety measure.

## Next Steps

This configuration is complete and ready for the Build phase. Future bead closures will automatically trigger database exports, ensuring the git-backed beads database is always synchronized.

## Related Issues

- Original recommendation: `.agents/reviews/review-2026-01-09.md`
- Similar implementations: business_6, business_7
- Status: ✅ Complete
