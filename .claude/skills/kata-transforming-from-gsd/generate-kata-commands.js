#!/usr/bin/env node
/**
 * Generate thin wrapper Kata commands for each skill.
 *
 * For each skill in kata-staging/skills/:
 * - Creates a command that invokes Skill("kata-{skill-name}")
 * - Skips if command already exists
 */

import fs from 'fs';
import path from 'path';

const SKILLS_DIR = 'dev/transform/kata-staging/skills';
const COMMANDS_DIR = 'dev/transform/kata-staging/commands/kata';
const GSD_COMMANDS_DIR = 'dev/transform/gsd-source/commands/gsd';

// Mapping from generated command name to GSD command name
// (handles cases where skill→command conversion differs from original GSD command)
const GSD_COMMAND_NAME_MAP = {
  'check-todo': 'check-todos',
  'start-milestone': 'new-milestone',
  'start-new-milestone': 'new-milestone',
  'start-project': 'new-project',
  'update-kata': 'update',
};

/**
 * Parse YAML frontmatter from content.
 * Returns { frontmatter: {key: value}, body: string }
 */
function parseFrontmatter(content) {
  if (!content.startsWith('---')) {
    return { frontmatter: {}, body: content };
  }

  const parts = content.split('---');
  if (parts.length < 3) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterText = parts[1].trim();
  const body = parts.slice(2).join('---');

  // Simple YAML parsing for key: value pairs
  const frontmatter = {};
  for (const line of frontmatterText.split('\n')) {
    const match = line.match(/^(\S+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      frontmatter[key] = value.replace(/^["']|["']$/g, '');
    }
  }

  return { frontmatter, body };
}

/**
 * Convert skill name (gerund form) to command name (imperative form).
 * kata-adding-phases → add-phase
 */
function skillNameToCommandName(skillName) {
  // Remove kata- prefix
  let name = skillName.startsWith('kata-') ? skillName.slice(5) : skillName;

  // Handle special cases first
  const specialCases = {
    'showing-whats-new': 'whats-new',
    'providing-help': 'help',
    'tracking-progress': 'progress',
    'executing-quick-tasks': 'quick',
    'configuring-settings': 'settings',
  };

  if (specialCases[name]) {
    return specialCases[name];
  }

  // Gerund to imperative mapping
  const gerundMap = {
    'adding': 'add',
    'planning': 'plan',
    'executing': 'execute',
    'verifying': 'verify',
    'starting': 'start',
    'debugging': 'debug',
    'checking': 'check',
    'completing': 'complete',
    'discussing': 'discuss',
    'inserting': 'insert',
    'listing': 'list',
    'mapping': 'map',
    'pausing': 'pause',
    'removing': 'remove',
    'researching': 'research',
    'resuming': 'resume',
    'setting': 'set',
    'updating': 'update',
    'auditing': 'audit',
    'showing': 'show',
    'providing': 'provide',
    'tracking': 'track',
    'configuring': 'configure',
  };

  // Split into words
  const words = name.split('-');

  // Process each word
  const resultWords = words.map((word, idx) => {
    // Convert gerund to imperative (first word only)
    if (idx === 0 && gerundMap[word]) {
      return gerundMap[word];
    }

    // Singularize plurals (not first word)
    if (idx > 0) {
      if (word === 'phases') return 'phase';
      if (word === 'milestones') return 'milestone';
      if (word === 'todos') return 'todo';
      if (word === 'codebases') return 'codebase';
      if (word === 'tasks') return 'task';
      if (word === 'projects') return 'project';
      if (word === 'profiles') return 'profile';
    }

    return word;
  });

  return resultWords.join('-');
}

/**
 * Generate a thin wrapper command that invokes a skill.
 *
 * Looks up the original GSD command to use its description and argument-hint,
 * falling back to skill description if GSD command doesn't exist.
 */
function generateCommand(skillName, skillDescription) {
  const commandName = skillNameToCommandName(skillName);

  // Default: extract first sentence from skill description
  let description = (skillDescription.split('.')[0] || skillDescription).trim();
  let argumentHint = '<description>';

  // Look up original GSD command for its description and argument-hint
  const gsdCommandName = GSD_COMMAND_NAME_MAP[commandName] || commandName;
  const gsdCommandPath = path.join(GSD_COMMANDS_DIR, `${gsdCommandName}.md`);
  if (fs.existsSync(gsdCommandPath)) {
    const gsdContent = fs.readFileSync(gsdCommandPath, 'utf-8');
    const { frontmatter: gsdFm } = parseFrontmatter(gsdContent);

    if (gsdFm.description) {
      // Replace gsd/GSD with kata/Kata in the description
      description = gsdFm.description
        .replace(/\bgsd\b/g, 'kata')
        .replace(/\bGSD\b/g, 'Kata');
    }
    if (gsdFm['argument-hint']) {
      argumentHint = gsdFm['argument-hint'];
    }
  }

  const commandContent = `---
name: ${commandName}
description: ${description}
argument-hint: ${argumentHint}
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
\`Skill("${skillName}")\`
`;

  return { commandName, commandContent };
}

function main() {
  console.log('=== Kata Command Generator ===\n');

  if (!fs.existsSync(SKILLS_DIR)) {
    console.log(`Error: Skills directory not found at ${SKILLS_DIR}`);
    process.exit(1);
  }

  // Create commands directory
  fs.mkdirSync(COMMANDS_DIR, { recursive: true });

  console.log(`Reading skills from: ${SKILLS_DIR}`);
  console.log(`Generating commands in: ${COMMANDS_DIR}\n`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  // Find all skill directories
  const skillDirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  for (const skillDirName of skillDirs) {
    const skillMdPath = path.join(SKILLS_DIR, skillDirName, 'SKILL.md');

    if (!fs.existsSync(skillMdPath)) {
      console.log(`  ⚠ Skipping ${skillDirName}: No SKILL.md found`);
      continue;
    }

    try {
      const content = fs.readFileSync(skillMdPath, 'utf-8');
      const { frontmatter } = parseFrontmatter(content);

      const skillName = frontmatter.name;
      const skillDescription = frontmatter.description || '';

      if (!skillName) {
        console.log(`  ✗ ${skillDirName}: No 'name' field in frontmatter`);
        errors++;
        continue;
      }

      const { commandName, commandContent } = generateCommand(skillName, skillDescription);
      const commandPath = path.join(COMMANDS_DIR, `${commandName}.md`);

      // Check if command already exists
      if (fs.existsSync(commandPath)) {
        console.log(`  - ${skillName} → ${commandName}.md (exists, skipped)`);
        skipped++;
        continue;
      }

      fs.writeFileSync(commandPath, commandContent);
      console.log(`  ✓ ${skillName} → ${commandName}.md`);
      generated++;

    } catch (e) {
      console.log(`  ✗ ${skillDirName}: Error - ${e.message}`);
      errors++;
    }
  }

  console.log();
  console.log('─'.repeat(60));
  console.log(`Generated: ${generated} commands`);
  console.log(`Skipped:   ${skipped} (already exist)`);
  if (errors > 0) {
    console.log(`Errors:    ${errors} skills`);
  }
  console.log(`Output:    ${COMMANDS_DIR}`);
  console.log('─'.repeat(60));

  process.exit(errors > 0 ? 1 : 0);
}

main();
