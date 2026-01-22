# GSD JavaScript Infrastructure Analysis & Kata Integration Plan

## Executive Summary

GSD v1.9.0 introduced a **Codebase Intelligence System** with significant JavaScript infrastructure:
- Build system for bundling hooks with dependencies (esbuild)
- Five Node.js hooks for statusline, intel tracking, and update checking
- Enhanced installer with hook registration and orphaned file cleanup

This analysis identifies what Kata needs from these updates and how to integrate them.

---

## GSD JavaScript Components Analysis

### 1. Build System (`scripts/build-hooks.js`)

**Purpose**: Bundle hooks that have npm dependencies (sql.js with WASM) into self-contained files

**Architecture**:
- Uses esbuild to bundle `gsd-intel-index.js` (only hook with dependencies)
- Copies pure Node.js hooks unchanged (statusline, intel-session, intel-prune, check-update)
- Outputs to `hooks/dist/` for npm distribution

**Key Features**:
- Inline WASM binary as base64 for sql.js portability
- Minification with name preservation for debugging
- Target: Node 18, CommonJS format

**Kata Relevance**: **HIGH** - Kata will need identical build system if adopting codebase intelligence

---

### 2. Statusline Hook (`hooks/gsd-statusline.js`)

**Purpose**: Display model, task, directory, context usage in Claude Code statusline

**Features**:
- Reads session todos to show current `in_progress` task
- Color-coded context usage (green < 50%, yellow < 65%, orange < 80%, red flashing 80%+)
- Shows update available indicator from cache
- Pure Node.js (no dependencies)

**Output Format**: `⬆ /gsd:update │ Model │ Task │ directory ███░░░░░░░ 30%`

**Kata Relevance**: **HIGH** - Kata users need identical statusline (just rename gsd→kata)

---

### 3. Intel Session Hook (`hooks/gsd-intel-session.js`)

**Purpose**: Inject codebase intelligence summary into Claude's context at session start

**Architecture**:
- Runs on SessionStart (startup/resume)
- Reads pre-generated `.planning/intel/summary.md`
- Injects as `<codebase-intelligence>` XML tag
- Silent failure if no intel exists

**Kata Relevance**: **MEDIUM** - Kata hasn't adopted codebase intelligence yet (see below)

---

### 4. Intel Prune Hook (`hooks/gsd-intel-prune.js`)

**Purpose**: Remove stale entries from index when files are deleted

**Architecture**:
- Runs on Stop event (after each Claude response)
- Checks `fs.existsSync()` for all indexed files
- Removes deleted files from `index.json`
- Fast (no file reading, just existence checks)

**Kata Relevance**: **MEDIUM** - Only needed if Kata adopts codebase intelligence

---

### 5. Intel Index Hook (`hooks/gsd-intel-index.js`)

**Purpose**: Build and maintain codebase intelligence graph database

**Architecture** (1,218 lines - most complex):
- PostToolUse hook (triggers on Write/Edit)
- Extracts imports/exports via regex AST parsing
- Updates `.planning/intel/index.json` incrementally
- Generates entity files via `claude -p` prompt
- Maintains SQLite graph database (sql.js) with nodes/edges
- CLI query interface for dependency analysis
- Detects naming conventions, directory purposes, file suffixes

**Key Features**:
- **Entity generation**: Spawns `claude -p` to analyze files and create semantic `.md` entities
- **Graph database**: Tracks dependencies for hotspot/dependent queries
- **Convention detection**: Learns camelCase vs PascalCase, suffix patterns
- **Summary generation**: Creates `.planning/intel/summary.md` for context injection

**Kata Relevance**: **LOW/DEFERRED** - Complex feature, Kata hasn't decided to adopt codebase intelligence

---

### 6. Update Check Hook (`hooks/gsd-check-update.js`)

**Purpose**: Check npm for new version, cache result for statusline display

**Architecture**:
- Runs on SessionStart
- Spawns background process (detached, windowsHide for no console flash)
- Checks local/global VERSION file vs npm registry
- Writes result to `~/.claude/cache/gsd-update-check.json`
- 10-second timeout, silent failure

**Kata Relevance**: **HIGH** - Kata should adopt identical update checking (rename package)

---

### 7. Enhanced Installer (`bin/install.js`)

**New Features in v1.9.0**:
- **Clean install**: Deletes destination dirs before copy (removes orphaned files)
- **Orphaned file cleanup**: Removes renamed hooks (statusline.js → gsd-statusline.js)
- **Orphaned hook cleanup**: Removes stale hook registrations from settings.json
- **Four intel hooks registered**: PostToolUse (index), SessionStart (session), Stop (prune), SessionStart (update-check)
- **Installation verification**: Checks directories/files exist after copy, errors if missing
- **Hook bundling**: Copies from `hooks/dist/` (pre-bundled with dependencies)

**Changes from Kata's installer**:
- GSD: Copies from `hooks/dist/`, registers 4 intel hooks, cleans orphaned files
- Kata: Copies from `hooks/` source, only registers update-check hook

**Kata Relevance**: **HIGH** - Kata needs orphaned file cleanup, verification, and update-check hook

---

## Integration Recommendations

### Must Integrate (High Priority)

1. **Statusline Hook** (30 min)
   - Copy `gsd-statusline.js` → `kata-statusline.js`
   - Replace `/gsd:update` → `/kata:update`
   - Replace `gsd-update-check.json` → `kata-update-check.json`
   - Update installer to register statusline

2. **Update Check Hook** (20 min)
   - Copy `gsd-check-update.js` → `kata-check-update.js`
   - Change npm package: `get-shit-done-cc` → `@gannonh/kata`
   - Change cache file: `gsd-update-check.json` → `kata-update-check.json`
   - Change VERSION file path: `get-shit-done/` → `kata/`

3. **Installer Enhancements** (1 hour)
   - Add `cleanupOrphanedFiles()` function
   - Add `cleanupOrphanedHooks()` function
   - Add `verifyInstalled()` / `verifyFileInstalled()` checks
   - Register update-check hook in SessionStart
   - Register statusline in settings (with prompt in interactive mode)

### Should Integrate (Medium Priority)

4. **Build System** (30 min - only if adopting intel)
   - Copy `scripts/build-hooks.js`
   - Add esbuild to package.json devDependencies
   - Add `npm run build:hooks` script
   - Update .gitignore for `hooks/dist/`
   - Update installer to copy from `hooks/dist/` instead of `hooks/`

### Defer (Low Priority - Pending Decision)

5. **Codebase Intelligence System** (8-12 hours - major feature)
   - Copy intel hooks (index, session, prune)
   - Add sql.js dependency
   - Build bundled hooks
   - Register intel hooks in installer
   - Create `/kata:analyze-codebase` command
   - Create `/kata:query-intel` command
   - Update agents to reference intel context

**Decision needed**: Does Kata want automatic codebase intelligence? This is a major fork difference from GSD's "solo developer" philosophy. Kata targets teams, so this feature might be valuable, but it's complex.

---

## File Mapping (GSD → Kata)

```
scripts/build-hooks.js               → scripts/build-hooks.js
hooks/gsd-statusline.js             → hooks/kata-statusline.js
hooks/gsd-check-update.js           → hooks/kata-check-update.js
hooks/gsd-intel-index.js            → hooks/kata-intel-index.js (deferred)
hooks/gsd-intel-session.js          → hooks/kata-intel-session.js (deferred)
hooks/gsd-intel-prune.js            → hooks/kata-intel-prune.js (deferred)
bin/install.js (cleanup functions)  → bin/install.js (merge)
```

---

## Implementation Phases

### Phase 1: Statusline & Update Check (2 hours)

**Objective**: Give Kata users visual progress feedback and update notifications

**Tasks**:
1. Copy and rename statusline hook, update branding
2. Copy and rename update-check hook, update package name
3. Test hooks in isolation
4. Update installer to register both hooks
5. Test full installation flow

**Files Modified**:
- `hooks/kata-statusline.js` (new)
- `hooks/kata-check-update.js` (new)
- `bin/install.js` (enhanced)

**Verification**:
- Statusline shows model, task, directory, context%
- Update notification appears when new version available
- Hooks registered correctly in settings.json

---

### Phase 2: Installer Enhancements (1 hour)

**Objective**: Prevent orphaned files across Kata versions

**Tasks**:
1. Add cleanup functions to installer
2. Add verification checks post-install
3. Test upgrade path from 0.1.4 → new version
4. Ensure orphaned files removed, hooks cleaned

**Files Modified**:
- `bin/install.js`

**Verification**:
- Old hook files removed on upgrade
- Stale hook registrations cleaned from settings.json
- Installation fails fast if files not copied

---

### Phase 3: Build System (1 hour - conditional)

**Objective**: Enable bundled hook distribution (only if adopting intel)

**Tasks**:
1. Copy build script
2. Add esbuild dependency
3. Configure npm scripts
4. Test bundling process
5. Update installer to use dist/

**Files Modified**:
- `scripts/build-hooks.js` (new)
- `package.json` (scripts, devDependencies)
- `bin/install.js` (copy path)
- `.gitignore` (dist/)

**Verification**:
- `npm run build:hooks` produces bundled files
- Installer copies from hooks/dist/
- Hooks work from bundled version

---

### Phase 4: Codebase Intelligence (8-12 hours - deferred)

**Objective**: Automatic semantic understanding of codebases (major feature)

**Decision Required**: Kata needs to decide if this feature aligns with team-oriented goals

**Pros**:
- Automatic convention detection helps teams maintain consistency
- Dependency hotspots prevent breaking changes
- Entity graph enables impact analysis

**Cons**:
- Adds 1,218 lines of complex code
- Requires sql.js dependency (WASM complexity)
- Spawns `claude -p` for entity generation (may be slow/expensive)
- Focused on solo dev workflow (doesn't integrate with team tools)

**If Adopted**:
1. Copy intel hooks
2. Add sql.js dependency
3. Build bundled intel-index hook
4. Register intel hooks in installer
5. Create commands: analyze-codebase, query-intel
6. Update agent prompts to reference intel context
7. Document feature in README

---

## Critical Differences: GSD vs Kata

### Philosophy

**GSD**: Solo developer, anti-enterprise, automatic everything
**Kata**: Team-oriented, GitHub integration, skill-based architecture

### Codebase Intelligence Fit

**For GSD**: Perfect fit - solo dev learns their own conventions
**For Kata**: Uncertain fit - teams have explicit style guides, linters, docs

**Alternative for Kata**: Integrate with existing team tools instead of building parallel intelligence:
- Read `.prettierrc`, `eslint.json` for conventions
- Read `ARCHITECTURE.md`, `CONTRIBUTING.md` for patterns
- Use GitHub API for dependency graphs (not local SQLite)
- Reference project's actual documentation, not AI-generated entities

---

## Recommendation

### Immediate: Integrate High-Priority Items (Phase 1-2)

Kata should adopt:
1. ✅ Statusline hook (user-facing progress feedback)
2. ✅ Update check hook (version awareness)
3. ✅ Installer enhancements (clean upgrades)

These are low-risk, high-value improvements with clear benefits.

### Defer: Codebase Intelligence (Phase 4)

Kata should **defer** codebase intelligence until:
- User demand validated (do Kata users want this?)
- Team tooling integration explored (read existing configs vs generate new ones)
- Complexity justified (1,200 lines + WASM for what benefit?)

If adopted later, GSD's implementation provides clear reference.

---

## Files to Save

```
.planning/deltas/2026-01-21-gsd-js-infrastructure-analysis.md   (this file)
.planning/deltas/gsd-hooks-comparison.md                        (detailed hook diff)
```

---

## Next Steps

1. **User**: Review this analysis and decide on codebase intelligence
2. **Implementation**: Execute Phase 1-2 (4 hours total)
3. **Testing**: Verify hooks work, installer cleans up correctly
4. **Documentation**: Update Kata README with new hooks
