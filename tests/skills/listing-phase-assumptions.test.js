/**
 * Tests for kata-listing-phase-assumptions skill
 *
 * This skill analyzes a phase and presents Claude's assumptions about
 * technical approach, implementation order, scope boundaries, risk areas,
 * and dependencies.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { mkdtempSync, rmSync, cpSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { invokeClaude } from '../harness/claude-cli.js';
import {
  assertSkillInvoked,
  assertNoError,
  assertResultContains
} from '../harness/assertions.js';
import { config } from '../harness/runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '..', 'fixtures', 'kata-project');
const KATA_ROOT = join(__dirname, '..', '..');

describe('kata-listing-phase-assumptions skill', () => {
  let testDir;

  beforeEach(() => {
    // Create isolated test environment
    testDir = mkdtempSync(join(tmpdir(), 'kata-test-'));
    cpSync(FIXTURES_DIR, testDir, { recursive: true });

    // Install skill being tested
    const skillSource = join(KATA_ROOT, 'skills', 'kata-listing-phase-assumptions');
    const skillDest = join(testDir, '.claude', 'skills', 'kata-listing-phase-assumptions');
    cpSync(skillSource, skillDest, { recursive: true });

    // Create a minimal phase structure with CONTEXT.md
    const phaseDir = join(testDir, '.planning', 'phases', '01-test-phase');
    mkdirSync(phaseDir, { recursive: true });

    // Create 01-CONTEXT.md with sample content
    const contextContent = `# Phase 1: Test Phase Context

## User Vision

This phase will implement authentication for the application.

## Essentials

- JWT-based authentication
- Login and logout functionality
- Protected routes

## Out of Scope

- OAuth integration
- Multi-factor authentication
`;
    writeFileSync(join(phaseDir, '01-CONTEXT.md'), contextContent);

    // Update ROADMAP.md to include the phase
    const roadmapPath = join(testDir, '.planning', 'ROADMAP.md');
    const roadmapContent = `# Roadmap: Test Fixture

## Overview

Test project for skill verification.

## Phases

### Phase 1: Authentication
Implement user authentication system.

## Progress

Phase 1 not started.
`;
    writeFileSync(roadmapPath, roadmapContent);
  });

  afterEach(() => {
    if (testDir && existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('responds to "list assumptions for phase 1" prompt', () => {
    const result = invokeClaude('list assumptions for phase 1', {
      cwd: testDir,
      maxBudget: config.budgets.standard,
      timeout: config.timeouts.standard
    });

    assertNoError(result);
    assertSkillInvoked(result);
  });

  it('displays phase context information', () => {
    const result = invokeClaude('what are you thinking about phase 1', {
      cwd: testDir,
      maxBudget: config.budgets.standard,
      timeout: config.timeouts.standard
    });

    assertNoError(result);
    // The skill should reference assumptions about the phase
    // or acknowledge the phase context (authentication, JWT, etc.)
    assertResultContains(result, /assumption|approach|authentication|phase|technical/i);
  });
});
