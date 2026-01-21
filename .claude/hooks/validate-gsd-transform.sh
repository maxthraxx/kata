#!/bin/bash
# Validation hook for GSD → Kata transformation
# Runs after /kata:transform-from-gsd completes

set -e

echo "🔍 Validating GSD → Kata transformation..."
echo ""

EXIT_CODE=0

# Check 1: Agent frontmatter has kata- prefix
echo "✓ Checking agent frontmatter..."
AGENT_NAME_ISSUES=$(grep -l "^name: gsd-" agents/kata-*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$AGENT_NAME_ISSUES" -gt 0 ]; then
  echo "  ❌ FAIL: $AGENT_NAME_ISSUES agent files still have 'name: gsd-' in frontmatter"
  grep -l "^name: gsd-" agents/kata-*.md 2>/dev/null | sed 's/^/    /'
  EXIT_CODE=1
else
  echo "  ✓ Agent frontmatter correct (all use kata- prefix)"
fi

# Check 2: No remaining GSD references in agent content (excluding name field)
echo ""
echo "✓ Checking for GSD references in agents..."
GSD_REFS=$(grep -i "gsd" agents/kata-*.md 2>/dev/null | grep -v "^[^:]*:name:" | wc -l | tr -d ' ')
if [ "$GSD_REFS" -gt 0 ]; then
  echo "  ⚠️  WARNING: $GSD_REFS 'gsd' references still found in agent files"
  echo "  Sample:"
  grep -i "gsd" agents/kata-*.md 2>/dev/null | grep -v "^[^:]*:name:" | head -3 | sed 's/^/    /'
  EXIT_CODE=1
else
  echo "  ✓ No GSD references in agents"
fi

# Check 3: Verify kata references exist (replacement worked)
echo ""
echo "✓ Checking kata references exist..."
KATA_REFS=$(grep -i "kata" agents/kata-*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$KATA_REFS" -gt 0 ]; then
  echo "  ✓ Found $KATA_REFS kata references in agents"
else
  echo "  ❌ FAIL: No kata references found in agents"
  EXIT_CODE=1
fi

# Check 4: Verify skills have correct frontmatter
echo ""
echo "✓ Checking skill frontmatter..."
if [ -d "dev/transform/skills" ]; then
  SKILL_ERRORS=$(find dev/transform/skills -name "SKILL.md" -exec grep -L "^name: kata-" {} \; 2>/dev/null | wc -l | tr -d ' ')
  if [ "$SKILL_ERRORS" -gt 0 ]; then
    echo "  ❌ FAIL: $SKILL_ERRORS skills missing 'name: kata-' prefix"
    find dev/transform/skills -name "SKILL.md" -exec grep -L "^name: kata-" {} \; 2>/dev/null | sed 's/^/    /'
    EXIT_CODE=1
  else
    SKILL_COUNT=$(find dev/transform/skills -name "SKILL.md" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✓ All $SKILL_COUNT skills have correct frontmatter"
  fi
else
  echo "  ⚠️  No skills directory found (skill conversion may have been skipped)"
fi

# Check 5: Verify files in correct locations
echo ""
echo "✓ Checking file locations..."
AGENTS_IN_KATA=$(find agents -name "kata-*.md" 2>/dev/null | wc -l | tr -d ' ')
WORKFLOWS_IN_KATA=$(find kata/workflows -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
COMMANDS_IN_TRANSFORM=$(find dev/transform/commands -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

echo "  Agents in kata/agents/: $AGENTS_IN_KATA"
echo "  Workflows in kata/workflows/: $WORKFLOWS_IN_KATA"
echo "  Commands in dev/transform/: $COMMANDS_IN_TRANSFORM"

if [ "$AGENTS_IN_KATA" -eq 0 ]; then
  echo "  ❌ FAIL: No agents found in kata/agents/"
  EXIT_CODE=1
fi
if [ "$WORKFLOWS_IN_KATA" -eq 0 ]; then
  echo "  ❌ FAIL: No workflows found in kata/workflows/"
  EXIT_CODE=1
fi
if [ "$COMMANDS_IN_TRANSFORM" -eq 0 ]; then
  echo "  ❌ FAIL: No commands found in dev/transform/commands/"
  EXIT_CODE=1
fi

echo ""
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✅ Validation passed - transformation looks good!"
else
  echo "❌ Validation failed - please review errors above"
fi

exit $EXIT_CODE
