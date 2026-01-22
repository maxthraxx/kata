---
name: kata-transforming-from-gsd
description: Use this skill when transforming get-shit-done repository files to kata format. Handles copying, renaming, text replacement, skill conversion, command generation, validation, and deployment. Triggers include "transform from gsd", "gsd to kata", "update from gsd", "sync from gsd".
version: 0.1.0
user-invocable: true
disable-model-invocation: false
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - AskUserQuestion
---

# Transforming GSD to Kata

Synchronize Kata with the latest get-shit-done (GSD) source.

## Workflow Overview

1. Pull latest GSD from GitHub
2. Prepare staging: copy GSD → gsd-source, copy Kata production → kata-staging
3. Apply GSD updates to kata-staging (agents, workflows)
4. Run text replacements (gsd → kata)
5. Convert GSD commands to Kata skills (preserve frontmatter, update content)
6. Post-process skill frontmatter
7. Generate Kata commands (thin wrappers)
8. Validate transformation
9. Request user approval
10. Deploy kata-staging → production

## Paths

**GSD Source:** `/Users/gannonhall/dev/oss/get-shit-done`

**Staging Area:** `/Users/gannonhall/dev/oss/kata/dev/transform/`
- `gsd-source/` — Snapshot of GSD repo (what we're syncing FROM)
- `kata-staging/` — Snapshot of Kata production (what we're UPDATING)

**Scripts:**
- `dev/transform-gsd-to-kata.py` — Prepare staging (copy both repos)
- `dev/apply-gsd-updates.py` — Apply GSD agent/workflow updates
- `dev/replace-gsd-with-kata.py` — Text replacement
- `.claude/skills/kata-transforming-from-gsd/convert-commands-to-skills.py` — Command→skill conversion
- `dev/post-process-skill-frontmatter.py` — Add skill frontmatter fields
- `dev/generate-kata-commands.js` — Generate thin wrapper commands

## Process

### Step 1: Pull Latest GSD

```bash
cd /Users/gannonhall/dev/oss/get-shit-done
git pull origin main
```

Display output. If pull fails, STOP.

### Step 2: Prepare Staging

```bash
cd /Users/gannonhall/dev/oss/kata
python3 dev/transform-gsd-to-kata.py
```

This copies:
- GSD repo → `gsd-source/`
- Kata production (agents, commands, kata, skills, docs) → `kata-staging/`

Display: "✓ Staging prepared"

### Step 3: Apply GSD Updates

```bash
python3 dev/apply-gsd-updates.py
```

This updates kata-staging with:
- Transformed agents from GSD (gsd-* → kata-*)
- Workflows from GSD

**Note:** Hooks are excluded — Kata has custom implementations with improvements over GSD (local/global install awareness, cache context validation).

Display: "✓ GSD updates applied"

### Step 4: Text Replacement

```bash
cd dev/transform/kata-staging
python3 ../../../dev/replace-gsd-with-kata.py
cd ../../..
```

Replaces all "gsd" → "kata" text in kata-staging files.

Display: "✓ Text replaced"

### Step 5: Convert Commands to Skills

```bash
python3 .claude/skills/kata-transforming-from-gsd/convert-commands-to-skills.py
```

For each GSD command:
- If skill EXISTS in kata-staging: preserve frontmatter, replace content
- If skill DOES NOT EXIST: create new skill with generated frontmatter

Display: "✓ Commands converted to skills"

### Step 6: Post-Process Skill Frontmatter

```bash
python3 dev/post-process-skill-frontmatter.py
```

Adds missing fields to skills: version, user-invocable, disable-model-invocation, allowed-tools.

Display: "✓ Skill frontmatter completed"

### Step 7: Generate Kata Commands

```bash
node dev/generate-kata-commands.js
```

Creates thin wrapper commands that invoke skills.

Display: "✓ Kata commands generated"

### Step 8: Validate

```bash
bash .claude/hooks/validate-gsd-transform.sh
```

Checks:
- Agent frontmatter has kata- prefix
- No remaining GSD references
- Skills have complete frontmatter
- Kata commands exist
- Files in correct locations

If validation fails, STOP.

Display: "✓ Validation passed"

### Step 9: Request Approval

Display summary:

```
═══════════════════════════════════════════════════════════
  TRANSFORMATION COMPLETE - AWAITING APPROVAL
═══════════════════════════════════════════════════════════

Kata-staging is ready for deployment:
  Location: dev/transform/kata-staging/

Validation: ✅ PASSED

Review:
  - Agents: dev/transform/kata-staging/agents/
  - Skills: dev/transform/kata-staging/skills/
  - Commands: dev/transform/kata-staging/commands/kata/
  - Workflows: dev/transform/kata-staging/kata/

───────────────────────────────────────────────────────────
```

Use AskUserQuestion:
- Question: "Deploy transformed files to Kata production?"
- Options:
  1. "Yes, deploy now" — Copy kata-staging → production
  2. "No, let me review" — Keep staging for inspection

If "No": Display "Files in kata-staging/ for review." and STOP.

### Step 10: Deploy

```bash
# Deploy all directories (hooks excluded - Kata has custom implementations)
cp -r dev/transform/kata-staging/agents/* agents/
cp -r dev/transform/kata-staging/commands/* commands/
cp -r dev/transform/kata-staging/kata/* kata/
cp -r dev/transform/kata-staging/skills/* skills/

# Deploy documentation
cp dev/transform/kata-staging/KATA-STYLE.md KATA-STYLE.md
cp dev/transform/kata-staging/CHANGELOG.md CHANGELOG-GSD.md
cp dev/transform/kata-staging/README.md README-GSD.md
```

Display completion summary with file counts.

## Success Criteria

- [ ] GSD pulled from GitHub
- [ ] Staging prepared (both repos copied)
- [ ] GSD updates applied to staging
- [ ] Text replacements complete
- [ ] Commands converted to skills
- [ ] Skill frontmatter complete
- [ ] Kata commands generated
- [ ] Validation passed
- [ ] User approved deployment
- [ ] Files deployed to production
