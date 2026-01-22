Implement the following plan:

# Plan: Convert transform-from-gsd to Self-Contained Skill

## Overview

Convert `.claude/commands/kata/transform-from-gsd.md` into a comprehensive skill that handles everything in one place:
1. Copy GSD repo to gsd-source
2. Transform to kata-staging
3. Text replacements
4. **Convert GSD commands to Kata skills** (inline, not delegated)
5. Post-process skill frontmatter
6. **Generate Kata commands** (inline, not delegated)
7. Validate
8. Get user approval
9. Deploy

## Key Changes

**Current issues:**
- Delegates to `converting-commands-to-skills` skill which doesn't know our specific paths
- Delegates to `generate-kata-commands.py` Python script
- Confusing handoffs between components

**Solution:**
- Make it a skill at `.claude/skills/kata-transforming-from-gsd/SKILL.md`
- Incorporate command→skill conversion logic directly
- Incorporate command generation logic directly
- Hardcode our specific paths and transformations

## Implementation

### Step 1: Create Skill Structure

**File:** `.claude/skills/kata-transforming-from-gsd/SKILL.md`

**Frontmatter:**
```yaml
---
name: kata-transforming-from-gsd
description: Use this skill when transforming get-shit-done repository files to kata format. Handles copying, renaming, text replacement, skill conversion, command generation, validation, and deployment. Triggers include "transform from gsd", "gsd to kata", "update from gsd".
---
```

### Step 2: Inline Command→Skill Conversion

Incorporate logic from user level Skill: @/Users/gannonhall/.claude/skills/converting-commands-to-skills  

**For each GSD command in `gsd-source/commands/gsd/`:**
1. Determine skill name:
   - `gsd:add-phase` → `kata-adding-phases` (remove gsd, add kata, convert to gerund)
2. Check if skill exists in `kata-staging/skills/kata-adding-phases/SKILL.md`
3. **If exists:**
   - Read existing skill
   - Parse and preserve frontmatter
   - Read GSD command content (below frontmatter)
   - Replace skill content (below frontmatter) with GSD command content
   - Write updated skill
4. **If doesn't exist:**
   - Create new frontmatter:
     - `name: kata-{gerund-name}`
     - `description:` enhanced with triggers
     - Remove `allowed-tools`, `argument-hint`, etc.
   - Copy GSD command content (below frontmatter)
   - Write new skill

### Step 3: Inline Kata Command Generation

**For each GSD command in `gsd-source/commands/gsd/`:**
1. Determine command name:
   - `gsd:add-phase` → `kata:add-phase` (just change namespace)
   - File: `add-phase.md`
2. Check if command exists in `kata-staging/commands/kata/add-phase.md`
3. **If NOT exists:**
   - Create using thin wrapper pattern
   - Template:
     ```yaml
     ---
     name: {command-name}
     description: {first sentence from GSD description}
     argument-hint: <description>
     version: 0.1.0
     disable-model-invocation: true
     allowed-tools:
       - Read
       - Write
       - Bash
     ---

     ## Step 1: Parse Context

     Arguments: "$ARGUMENTS"

     ## Step 2: Invoke Skill

     Run the following skill:
     `Skill("kata-{skill-name}")`
     ```
4. **If exists:** Skip (preserve manually created example)

### Step 4: Full Workflow

The skill orchestrates:
1. Pull latest GSD from GitHub
2. Run `transform-gsd-to-kata.py` (copies to gsd-source, transforms to kata-staging)
3. Run `replace-gsd-with-kata.py` on kata-staging
4. **Inline command→skill conversion** (replaces converting-commands-to-skills invocation)
5. Run `post-process-skill-frontmatter.py`
6. **Inline Kata command generation** (replaces generate-kata-commands.py)
7. Run validation hook
8. Ask user for approval
9. Deploy if approved

### Step 5: Deprecate Python Script

**File:** `dev/generate-kata-commands.py`
- Can be deleted or kept as reference
- No longer used since logic is inline in skill

## Files to Create/Modify

**Create:**
- `.claude/skills/kata-transforming-from-gsd/SKILL.md` - Main skill

**Modify:**
- Delete or deprecate: `.claude/commands/kata/transform-from-gsd.md` (becomes skill)
- Delete or deprecate: `dev/generate-kata-commands.py` (logic moved to skill)

**Keep:**
- `dev/transform-gsd-to-kata.py` - Still needed
- `dev/replace-gsd-with-kata.py` - Still needed
- `dev/post-process-skill-frontmatter.py` - Still needed
- `.claude/hooks/validate-gsd-transform.sh` - Still needed

## Verification

After implementation:
1. Run the skill naturally: "transform from gsd"
2. Verify it processes all GSD commands
3. Verify it updates existing skills (preserves frontmatter)
4. Verify it creates new skills (with proper frontmatter)
5. Verify it generates missing Kata commands
6. Verify validation passes
7. Verify user approval flow works


If you need specific details from before exiting plan mode (like exact code snippets, error messages, or content you generated), read the full transcript at: /Users/gannonhall/.claude/projects/-Users-gannonhall-dev-oss-kata/375acae3-1e89-4c6c-b650-d0ef37191ab3.jsonl