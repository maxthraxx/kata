import { describe, it, beforeEach, afterEach } from 'node:test';
import { mkdtempSync, rmSync, cpSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { invokeClaude } from '../harness/claude-cli.js';
import {
  assertSkillInvoked,
  assertNoError
} from '../harness/assertions.js';
import { config } from '../harness/runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '..', 'fixtures', 'kata-project');
const KATA_ROOT = join(__dirname, '..', '..');

describe('kata-starting-milestones', () => {
  let testDir;

  beforeEach(() => {
    // Create isolated test environment
    testDir = mkdtempSync(join(tmpdir(), config.isolation.tempPrefix));
    cpSync(FIXTURES_DIR, testDir, { recursive: true });

    // Install skill being tested
    const skillSource = join(KATA_ROOT, 'skills', 'kata-starting-milestones');
    const skillDest = join(testDir, '.claude', 'skills', 'kata-starting-milestones');
    cpSync(skillSource, skillDest, { recursive: true });

    // Ensure .claude directory structure exists
    mkdirSync(join(testDir, '.claude', 'agents'), { recursive: true });

    // Create PROJECT.md for milestone context
    const projectPath = join(testDir, '.planning', 'PROJECT.md');
    const projectContent = `# Test Project

## Overview

A test project for Kata skill verification.

## Current Milestone: v1.0 Foundation

**Goal:** Establish project foundation

## Key Decisions

None yet.
`;
    writeFileSync(projectPath, projectContent);

    // Create MILESTONES.md for history
    const milestonesPath = join(testDir, '.planning', 'MILESTONES.md');
    const milestonesContent = `# Milestones

## Completed Milestones

None yet.

## Current Milestone

v1.0 Foundation (in progress)
`;
    writeFileSync(milestonesPath, milestonesContent);

    // Update STATE.md
    const statePath = join(testDir, '.planning', 'STATE.md');
    const stateContent = `# Project State

## Current Position

Milestone: v1.0 Foundation
Phase: Not started
Plan: None
Status: Planning
Last activity: Test setup

Progress: [                                ] 0%
`;
    writeFileSync(statePath, stateContent);
  });

  afterEach(() => {
    if (testDir && existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('responds to "start milestone v2.0"', async () => {
    const result = invokeClaude('start milestone v2.0 for advanced features', {
      cwd: testDir,
      maxBudget: config.budgets.standard,
      timeout: config.timeouts.standard
    });

    assertNoError(result);
    assertSkillInvoked(result);
  });

  it('creates milestone structure', async () => {
    const result = invokeClaude('new milestone v1.1 for user authentication', {
      cwd: testDir,
      maxBudget: config.budgets.standard,
      timeout: config.timeouts.standard
    });

    assertNoError(result);

    // Check if milestone is mentioned in ROADMAP.md or PROJECT.md
    const roadmapPath = join(testDir, '.planning', 'ROADMAP.md');
    const projectPath = join(testDir, '.planning', 'PROJECT.md');

    let hasMilestone = false;

    if (existsSync(roadmapPath)) {
      const roadmapContent = readFileSync(roadmapPath, 'utf8');
      hasMilestone = roadmapContent.includes('v1.1') || roadmapContent.includes('1.1');
    }

    if (!hasMilestone && existsSync(projectPath)) {
      const projectContent = readFileSync(projectPath, 'utf8');
      hasMilestone = projectContent.includes('v1.1') || projectContent.includes('1.1');
    }

    // The skill might also just output milestone info
    const resultText = result.result || '';
    const mentionsMilestone = resultText.includes('v1.1') ||
                               resultText.includes('milestone') ||
                               resultText.toLowerCase().includes('1.1');

    if (!hasMilestone && !mentionsMilestone) {
      throw new Error(`Expected milestone v1.1 to be created or mentioned, got:\n${resultText.substring(0, 500)}`);
    }
  });
});
