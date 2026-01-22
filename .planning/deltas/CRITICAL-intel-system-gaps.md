# CRITICAL: Kata Has Intel References But No Implementation

## Problem Summary

**Kata agents reference `.planning/intel/summary.md` but the hooks to generate it don't exist.**

This creates **silent failures** where agents try to load codebase intelligence context but get nothing.

---

## Affected Files

### 1. `agents/kata-executor.md` (line 55-60)

```xml
<step name="load_codebase_intelligence">
Check for codebase intelligence:

```bash
cat .planning/intel/summary.md 2>/dev/null
```
</step>
```

**Impact**: Executor tries to load intel, gets nothing, continues without codebase context

---

### 2. `agents/kata-planner.md` (lines 420, 1042-1047)

```
@.planning/intel/summary.md   # Line 420: Passive reference

<step name="load_codebase_intelligence">  # Line 1042-1047: Active load
cat .planning/intel/summary.md 2>/dev/null
</step>
```

**Impact**: Planner tries to load intel, gets nothing, plans without codebase conventions

---

### 3. `agents/kata-entity-generator.md` (entire agent, 232 lines)

This agent is **completely orphaned**:
- Generates entity `.md` files to `.planning/intel/entities/`
- Expects PostToolUse hook (`kata-intel-index.js`) to sync entities to graph.db
- Expects summary generation to aggregate entities into `summary.md`

**Impact**: If this agent runs, it creates entities that are **never consumed** by anything

**Question**: Does Kata have a command that spawns this agent?

---

## Root Cause

Kata forked from GSD v1.5.21 (2026-01-16) **before** GSD added codebase intelligence (v1.9.0, 2025-01-20).

However, Kata appears to have **copied agent files** from a later GSD version that included intel references, creating a mismatch.

---

## What Breaks Right Now

### Silent Failures (Users Don't See)

1. **Every time kata-executor runs**: Tries `cat .planning/intel/summary.md`, gets nothing
2. **Every time kata-planner runs**: Tries to load intel summary, gets nothing

### Dead Code (No User Impact Unless Triggered)

3. **kata-entity-generator agent**: If spawned, creates entities that go nowhere

**Impact severity**: **Low to Moderate**
- Agents work fine without intel (they use `2>/dev/null` to suppress errors)
- Missing context is subtle (agents don't know codebase conventions)
- Only breaks if user explicitly runs analyze-codebase (if such command exists)

---

## Does Kata Have `/kata:analyze-codebase`?

**Finding**: NO

Kata removed all `codebase` commands. Only has `/kata:codebase-map` which uses a different approach (spawns Explore agents, doesn't create entities or intel/).

**Conclusion**: `kata-entity-generator` agent is **completely orphaned** - nothing spawns it.

---

## Recommendation

### Option 1: Remove Intel References (Clean Break) ⭐

**Action**: Remove intel references from agents, delete entity-generator
**Time**: 30 minutes
**Risk**: Low - dead code removal

Files to modify:
- `agents/kata-executor.md` - Remove `load_codebase_intelligence` step
- `agents/kata-planner.md` - Remove `@.planning/intel/summary.md` reference and step
- `agents/kata-entity-generator.md` - Delete entirely (orphaned)

**Pros**:
- Clean, no dead code
- No misleading references
- Kata doesn't support intel yet

**Cons**:
- Harder to integrate intel later (need to re-add references)

---

### Option 2: Implement Intel System (Full Integration)

**Action**: Adopt GSD's intel hooks, build system, commands
**Time**: 8-12 hours (see main analysis doc)
**Risk**: High - complex feature, WASM dependencies, 1,200+ lines

**Pros**:
- Agents work as designed
- Get automatic codebase learning
- Feature parity with GSD v1.9.0

**Cons**:
- Major complexity addition
- Unclear fit for team-oriented workflows
- Requires decision on architecture (see main doc)

---

### Option 3: Implement Minimal Intel (Stub)

**Action**: Create simple `.planning/intel/summary.md` from existing codebase-map output
**Time**: 2 hours
**Risk**: Low - simple transformation

Implementation:
1. Keep intel references in agents
2. Create `kata-intel-session.js` hook (reads summary.md, injects as `<codebase-intelligence>`)
3. Update `/kata:codebase-map` to write `summary.md` in addition to existing codebase map files
4. Skip: indexing, graph db, entity generation, conventions detection

**Pros**:
- Agents work correctly (get context)
- Minimal complexity
- Leverages existing codebase-map workflow

**Cons**:
- Manual updates (no automatic learning)
- No graph queries, no hotspots
- Limited compared to full intel

---

## Immediate Action Required

**Short term** (next 1 hour):
1. Verify no `/kata:analyze-codebase` command exists (DONE - confirmed missing)
2. Update main analysis doc with findings
3. Decision: Which option?

**Before next Kata release**:
- Must either remove intel references OR implement minimal system
- Cannot ship with broken references that do nothing

---

## Files to Save

```
.planning/deltas/CRITICAL-intel-system-gaps.md              (this file)
.planning/deltas/2026-01-21-gsd-js-infrastructure.md        (main analysis)
```
