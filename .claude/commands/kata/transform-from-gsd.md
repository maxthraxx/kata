---
name: kata:transform-from-gsd
description: Transform get-shit-done files to kata format (copy, rename, replace text, convert to skills)
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Skill
hooks:
  Stop:
    - matcher: ""
      hooks:
        - type: command
          command: .claude/hooks/validate-gsd-transform.sh
---

<objective>
Orchestrate complete transformation of get-shit-done (GSD) repository files into Kata format.

Performs four sequential operations:
1. Copy files from GSD repo (commands to staging, agents/workflows/style guide directly)
2. Rename agent files (gsd- → kata- prefix) and style guide (GSD-STYLE.md → KATA-STYLE.md)
3. Replace all textual references (gsd/get-shit-done → kata)
4. Convert staged commands to skills format

Output: Transformed skills in dev/transform/skills/ ready for selective deployment.

Use when forking/adapting GSD content into Kata codebase.
</objective>

<context>
**Source:** `/Users/gannonhall/dev/oss/get-shit-done`

**Target:** `/Users/gannonhall/dev/oss/kata/dev/transform/`

**Scripts:**
- @dev/transform-gsd-to-kata.py — Copy and rename
- @dev/replace-gsd-with-kata.py — Text replacement

**Skill:**
- converting-commands-to-skills — Command→skill conversion
</context>

<process>

<step name="validate_environment">
Check prerequisites exist before starting:

```bash
# Check source directory
if [ ! -d "/Users/gannonhall/dev/oss/get-shit-done" ]; then
  echo "Error: Source directory not found at /Users/gannonhall/dev/oss/get-shit-done"
  exit 1
fi

# Check transform script
if [ ! -f "dev/transform-gsd-to-kata.py" ]; then
  echo "Error: Transform script not found at dev/transform-gsd-to-kata.py"
  exit 1
fi

# Check replace script
if [ ! -f "dev/replace-gsd-with-kata.py" ]; then
  echo "Error: Replace script not found at dev/replace-gsd-with-kata.py"
  exit 1
fi

echo "✓ Environment validated"
echo "  - Source: /Users/gannonhall/dev/oss/get-shit-done"
echo "  - Target: dev/transform/"
echo ""
```

If any check fails, display error and STOP.
</step>

<step name="copy_and_rename">
Run copy-transform script:

```bash
python3 dev/transform-gsd-to-kata.py
```

Capture and display full output.

Display: "✓ Step 1: Files copied and renamed"
</step>

<step name="replace_text">
Run text replacement script on all transformed files (agents, workflows, commands):

```bash
python3 dev/replace-gsd-with-kata.py
```

This processes:
- agents/ (kata-* agent files)
- kata/ (workflow and template files)
- commands/gsd/ (if exists in current directory)

Then run on the transform staging area for commands:

```bash
cd dev/transform
python3 ../../dev/replace-gsd-with-kata.py
cd ../..
```

Capture and display full output showing replacements.

Display: "✓ Step 2: Text replaced (gsd → kata)"
</step>

<step name="convert_to_skills">
Check if converting-commands-to-skills skill is available:

```bash
if [ -d "$HOME/.claude/skills/converting-commands-to-skills" ] || [ -d ".claude/skills/converting-commands-to-skills" ]; then
  echo "skill_available"
else
  echo "skill_not_found"
fi
```

**If skill available:**

Invoke skill to convert commands to skills format:

Use Skill tool with:
- skill: "converting-commands-to-skills"
- args: "/Users/gannonhall/dev/oss/kata/dev/transform"

Display: "✓ Step 3: Commands converted to skills"

**If skill not found:**

Display:
```
⚠ Step 3: Skill conversion skipped

The converting-commands-to-skills skill is not installed.

To convert manually:
1. Install the skill
2. Run: /converting-commands-to-skills dev/transform
```
</step>

<step name="report_results">
Generate summary of transformation:

```bash
# Count transformed files
COMMANDS=$(find dev/transform/commands -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
AGENTS=$(find agents -name "kata-*.md" 2>/dev/null | wc -l | tr -d ' ')
WORKFLOWS=$(find kata/workflows -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
SKILLS=$(find dev/transform/skills -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')

echo "COMMANDS=$COMMANDS"
echo "AGENTS=$AGENTS"
echo "WORKFLOWS=$WORKFLOWS"
echo "SKILLS=$SKILLS"
```

Display final report:

```
═══════════════════════════════════════════════════════════
  GSD → KATA TRANSFORMATION COMPLETE
═══════════════════════════════════════════════════════════

Transformed Files:
  Commands (staged):  [N] files → dev/transform/commands/gsd/
  Agents (deployed):  [N] files → agents/ (gsd-* → kata-*)
  Workflows (deployed): [N] files → kata/
  Skills (OUTPUT):    [N] skills → dev/transform/skills/

Output Location: dev/transform/skills/

The transformed skills are ready for review in dev/transform/skills/
These are kata-* prefixed skills converted from GSD commands.

Next Actions:
  1. Review transformed skills in dev/transform/skills/
  2. Selectively copy skills you want to use to skills/ directory
  3. Test skills by invoking them naturally or with /skill-name
  4. Commit adapted files when satisfied

───────────────────────────────────────────────────────────
```

Replace [N] with actual counts from bash output.
</step>

</process>

<success_criteria>
- [ ] Source directory validated
- [ ] Transform scripts validated
- [ ] Files copied from GSD (commands to staging, agents/workflows/style directly)
- [ ] Agent files renamed (gsd-* → kata-*) with frontmatter updated
- [ ] Style guide copied and renamed (GSD-STYLE.md → KATA-STYLE.md)
- [ ] Text replacements applied (gsd/get-shit-done → kata)
- [ ] Skills converted from staged commands
- [ ] Final summary report displayed
- [ ] Stop hook validates transformation automatically
- [ ] User directed to review transformed skills in dev/transform/skills/
</success_criteria>

<note>
The transformation is automatically validated by a Stop hook (`.claude/hooks/validate-gsd-transform.sh`) that checks:
- Agent frontmatter has kata- prefix
- No remaining GSD references
- Kata references exist
- Skills have correct frontmatter
- Files are in correct locations

The hook runs automatically when the command completes.
</note>
