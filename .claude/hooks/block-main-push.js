#!/usr/bin/env node
// Block direct pushes to main branch for this repo

import fs from 'fs';

const input = JSON.parse(fs.readFileSync(0, 'utf8'));

const command = input.tool_input?.command || '';

// Patterns that indicate pushing to main
const mainPushPattern = /git\s+push\s+(?:--[a-z-]+\s+)*(?:-[a-z]+\s+)*(?:origin\s+)?main\b/i;

if (mainPushPattern.test(command)) {
  // Block with new format
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Direct push to main blocked. Create a branch and open a PR instead. If this is a hotfix, ask the user to push manually."
    }
  }));
  process.exit(0);
}

// Allow silently - no output needed for non-matching commands
process.exit(0);
