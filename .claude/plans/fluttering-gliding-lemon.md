# GSD Fork Decisions: Intel Removal, Hooks, and Plugin Distribution

## Summary

This plan addresses three interconnected issues:
1. **Codebase Intelligence** — GSD removed it in v1.9.2; Kata inherited broken references
2. **Hooks/Statusline** — Currently clean but need verification
3. **Plugin Distribution** — Move from JS installer to Claude Code plugin model

## Key Discovery

**GSD removed codebase intelligence in v1.9.2** due to overengineering concerns. Kata copied agent references to the intel system without implementing the underlying hooks. This creates **silent failures** where agents try to load intel context that doesn't exist.

## Phase 1: Clean Break from Intel System (30 min)

Remove all codebase intelligence references. This aligns with GSD's architectural decision.

### Files to Modify

| File | Action | Lines |
|------|--------|-------|
| `agents/kata-executor.md` | Remove `load_codebase_intelligence` step | ~55-60 |
| `agents/kata-planner.md` | Remove `@.planning/intel/summary.md` ref and load step | ~420, ~1042-1047 |
| `agents/kata-entity-generator.md` | **Delete entire file** (orphaned, 232 lines) | All |
| `KATA-STYLE.md` | Remove "Codebase Intelligence" section | ~80 lines |
| `dev/transform/kata-staging/agents/*` | Same changes in staging | Mirror above |

### Verification
```bash
# Confirm no intel references remain
grep -r "intel" agents/ kata/ skills/ --include="*.md" | grep -v "intelligence"
grep -r "summary.md" agents/ --include="*.md"
```

---

## Phase 2: Verify Hooks Are Working (15 min)

Current hooks are **clean** (no GSD references) but need runtime verification.

### Current State
- `hooks/statusline.js` — Displays model, task, context% in status bar
- `hooks/kata-check-update.js` — Background npm version check on SessionStart

### Verification Steps
1. Check hooks are installed:
   ```bash
   ls -la ~/.claude/hooks/
   cat ~/.claude/settings.json | jq '.hooks, .statusLine'
   ```

2. Check cache working:
   ```bash
   cat ~/.claude/kata/cache/update-check.json
   ```

3. Verify statusline displays in Claude Code (visual check)

### Potential Issues
- Cache path mismatch (local vs global install detection)
- npm registry timeout (10s, silent failure)
- VERSION file missing after install

---

## Phase 3: Plugin Distribution Model (1-2 hours)

Convert Kata from JS installer to Claude Code plugin.

### Create Plugin Manifest

**New file: `.claude-plugin/plugin.json`**
```json
{
  "name": "kata",
  "version": "0.2.0",
  "description": "Spec-driven development framework for Claude Code",
  "author": {
    "name": "Gannon Hall"
  },
  "commands": "../commands",
  "skills": "../skills",
  "agents": "../agents",
  "hooks": "../hooks/hooks.json"
}
```

### Consolidate Hooks to JSON

**New file: `hooks/hooks.json`**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/kata-check-update.js"
          }
        ]
      }
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/statusline.js"
  }
}
```

### Directory Structure (Final)
```
kata/
├── .claude-plugin/
│   └── plugin.json           # NEW: Plugin manifest
├── commands/kata/            # Existing
├── skills/                   # Existing (29 skills)
├── agents/                   # Existing
├── hooks/
│   ├── hooks.json            # NEW: Consolidated hook config
│   ├── statusline.js         # Existing
│   └── kata-check-update.js  # Existing
├── kata/                     # Workflows, templates, references
└── bin/install.js            # KEEP: For npm/development use
```

### What Happens to bin/install.js

**Keep it** for:
- Local development (`node bin/install.js --local`)
- npm users who want bleeding-edge versions
- CI/CD pipelines

**Users choose:**
- **Plugin install**: `/plugin install kata` (marketplace)
- **npm install**: `npm i @gannonh/kata && npx kata --local`

---

## Phase 4: Update Transform Pipeline (30 min)

Modify the GSD→Kata transform to handle the intel removal cleanly.

### Changes to Transform Scripts

1. **`dev/apply-gsd-updates.py`** — Skip copying `kata-entity-generator.md`
2. **`dev/replace-gsd-with-kata.py`** — Add step to remove intel references from agents
3. **Validation script** — Add check for orphaned intel references

### Add to `.claude/hooks/validate-gsd-transform.sh`
```bash
# Check no intel references in transformed files
echo "Checking for orphaned intel references..."
if grep -r "\.planning/intel" dev/transform/kata-staging/agents/ 2>/dev/null; then
  echo "⚠️  WARNING: Intel references found in agents"
fi
```

---

## Files Changed Summary

| File | Change Type |
|------|-------------|
| `agents/kata-executor.md` | Edit (remove intel step) |
| `agents/kata-planner.md` | Edit (remove intel refs) |
| `agents/kata-entity-generator.md` | Delete |
| `KATA-STYLE.md` | Edit (remove intel section) |
| `.claude-plugin/plugin.json` | Create |
| `hooks/hooks.json` | Create |
| `dev/apply-gsd-updates.py` | Edit (skip entity-generator) |
| `.claude/hooks/validate-gsd-transform.sh` | Edit (add intel check) |

---

## Verification

### After Phase 1 (Intel Removal)
```bash
# No intel references should exist
grep -rn "intel" agents/ kata/ --include="*.md" | wc -l  # Should be 0 or minimal
ls agents/kata-entity-generator.md  # Should not exist
```

### After Phase 3 (Plugin)
```bash
# Plugin manifest exists
cat .claude-plugin/plugin.json | jq .

# Hooks JSON valid
cat hooks/hooks.json | jq .

# Test plugin loading (in Claude Code)
# /plugin validate ./
```

### After Phase 4 (Transform)
```bash
# Run full transform
/kata-transforming-from-gsd

# Verify no intel in staging
grep -r "intel" dev/transform/kata-staging/agents/
```

---

## Decision Points

1. **Intel removal vs stub** — Plan assumes clean removal. Alternative: create minimal stub that reads from `/kata:map-codebase` output.

2. **Installer deprecation timeline** — Plan keeps both. Could deprecate installer after plugin model proven.

3. **Marketplace publishing** — Not covered. Can add `.claude-plugin/marketplace.json` later for public distribution.
