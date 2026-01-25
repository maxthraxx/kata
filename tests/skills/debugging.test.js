/**
 * Tests for kata-debugging skill.
 *
 * Verifies that the debugging skill correctly triggers on debugging prompts
 * and provides diagnostic analysis for issues.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { mkdtempSync, rmSync, cpSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { invokeClaude } from '../harness/claude-cli.js';
import { assertSkillInvoked, assertNoError, assertResultContains } from '../harness/assertions.js';
import { config } from '../harness/runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '..', 'fixtures', 'kata-project');
const KATA_ROOT = join(__dirname, '..', '..');

describe('kata-debugging skill', () => {
  let testDir;

  beforeEach(() => {
    // Create isolated test environment
    testDir = mkdtempSync(join(tmpdir(), 'kata-test-debugging-'));
    cpSync(FIXTURES_DIR, testDir, { recursive: true });

    // Install skill being tested
    const skillSource = join(KATA_ROOT, 'skills', 'kata-debugging');
    const skillDest = join(testDir, '.claude', 'skills', 'kata-debugging');
    cpSync(skillSource, skillDest, { recursive: true });

    // Install the agent that debugging skill spawns
    const agentSource = join(KATA_ROOT, 'agents', 'kata-debugger.md');
    const agentDest = join(testDir, '.claude', 'agents', 'kata-debugger.md');
    mkdirSync(join(testDir, '.claude', 'agents'), { recursive: true });
    if (existsSync(agentSource)) {
      cpSync(agentSource, agentDest);
    }

    // Create a scenario with an error state for debugging
    // Create a broken file reference in STATE.md
    const stateContent = `# Project State

## Current Position

Phase: 1 of 3
Plan: 1 of 2
Status: Blocked
Last activity: 2026-01-25 - Error encountered

## Error State

**Issue:** Missing required file
**Expected:** .planning/phases/01-setup/01-CONTEXT.md
**Actual:** File not found
**Impact:** Cannot proceed with planning

## Session Continuity

Last session: 2026-01-25
Stopped at: Error during phase 1 planning
Resume file: None`;

    writeFileSync(join(testDir, '.planning', 'STATE.md'), stateContent);

    // Create a partial phase directory (missing expected file)
    mkdirSync(join(testDir, '.planning', 'phases', '01-setup'), { recursive: true });
    // Intentionally NOT creating the CONTEXT.md file to create an error scenario
  });

  afterEach(() => {
    if (testDir && existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('responds to "debug this issue" prompt', () => {
    const result = invokeClaude('debug this issue - the planning state shows an error', {
      cwd: testDir,
      maxBudget: config.budgets.standard,
      timeout: config.timeouts.standard
    });

    assertNoError(result);
    assertSkillInvoked(result, 'Expected debugging skill to be invoked for debug prompt');
  });

  it('analyzes problem and provides diagnosis', () => {
    const result = invokeClaude('investigate why phase planning is blocked', {
      cwd: testDir,
      maxBudget: config.budgets.standard,
      timeout: config.timeouts.standard
    });

    assertNoError(result);
    assertSkillInvoked(result);

    // Verify result mentions diagnostic/investigative concepts
    assertResultContains(
      result,
      /diagnos|error|issue|investig|problem|missing|block/i,
      'Expected result to mention diagnosis, error, investigation, or problem'
    );
  });
});
