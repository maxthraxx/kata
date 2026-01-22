#!/usr/bin/env node
/**
 * README Sanitizer Script
 *
 * Transforms GSD references to Kata references in README.md
 * Only affects content below the <!-- sanitize --> marker.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const README_PATH = path.join(__dirname, '../../README.md');
const SANITIZE_MARKER = '<!-- sanitize -->';

// Transformation rules (order matters - more specific patterns first)
const TRANSFORMATIONS = [
  // NPX/package names
  { from: /npx get-shit-done-cc@latest/g, to: 'npx @gannonh/kata@latest' },
  { from: /npx get-shit-done-cc/g, to: 'npx @gannonh/kata' },
  { from: /get-shit-done-cc/g, to: '@gannonh/kata' },

  // GitHub URLs and references
  { from: /glittercowboy\/get-shit-done/g, to: 'gannonh/kata' },
  { from: /github\.com\/glittercowboy\/get-shit-done/g, to: 'github.com/gannonh/kata' },

  // Directory/repo name references
  { from: /cd get-shit-done/g, to: 'cd kata' },
  { from: /get-shit-done\.git/g, to: 'kata.git' },

  // Slash commands
  { from: /\/gsd:/g, to: '/kata:' },

  // Directory paths
  { from: /\.claude\/commands\/gsd\//g, to: '.claude/commands/kata/' },
  { from: /commands\/gsd\//g, to: 'commands/kata/' },

  // Branded references (case-sensitive)
  { from: /\bGSD\b/g, to: 'Kata' },

  // Lowercase references in specific contexts
  { from: /gsd-source/g, to: 'kata-source' },
  { from: /\bgsd\b(?![-_])/g, to: 'kata' },
];

// Track statistics
const stats = {
  totalReplacements: 0,
  replacementsByRule: new Map(),
};

function applyTransformations(content) {
  let result = content;

  for (const rule of TRANSFORMATIONS) {
    const matches = result.match(rule.from);
    if (matches) {
      const count = matches.length;
      stats.totalReplacements += count;
      const key = `${rule.from.source} → ${rule.to}`;
      stats.replacementsByRule.set(key, (stats.replacementsByRule.get(key) || 0) + count);
    }
    result = result.replace(rule.from, rule.to);
  }

  return result;
}

function main() {
  console.log('=' .repeat(60));
  console.log('  README Sanitizer');
  console.log('=' .repeat(60));
  console.log();

  // Read README
  if (!fs.existsSync(README_PATH)) {
    console.error(`Error: README not found at ${README_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(README_PATH, 'utf-8');

  // Find sanitize marker
  const markerIndex = content.indexOf(SANITIZE_MARKER);
  if (markerIndex === -1) {
    console.error(`Error: Marker "${SANITIZE_MARKER}" not found in README.md`);
    process.exit(1);
  }

  // Split content at marker
  const markerEndIndex = markerIndex + SANITIZE_MARKER.length;
  const preserved = content.substring(0, markerEndIndex);
  const toSanitize = content.substring(markerEndIndex);

  console.log(`Found marker at position ${markerIndex}`);
  console.log(`Preserved: ${preserved.split('\n').length} lines`);
  console.log(`To sanitize: ${toSanitize.split('\n').length} lines`);
  console.log();

  // Apply transformations
  console.log('Applying transformations...');
  const sanitized = applyTransformations(toSanitize);

  // Combine and write
  const result = preserved + sanitized;
  fs.writeFileSync(README_PATH, result);

  // Report
  console.log();
  console.log('=' .repeat(60));
  console.log('  SANITIZATION COMPLETE');
  console.log('=' .repeat(60));
  console.log();
  console.log(`Total replacements: ${stats.totalReplacements}`);
  console.log();

  if (stats.replacementsByRule.size > 0) {
    console.log('Replacements by rule:');
    for (const [rule, count] of stats.replacementsByRule) {
      console.log(`  ${count}x  ${rule}`);
    }
  } else {
    console.log('No replacements made (content may already be sanitized)');
  }

  console.log();
  console.log(`Output: ${README_PATH}`);
  console.log('-' .repeat(60));

  return 0;
}

main();
