#!/usr/bin/env node
// Check for Kata updates in background, write result to cache
// Called by SessionStart hook - runs once per session

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');

const homeDir = os.homedir();
const cwd = process.cwd();

// Detect local vs global installation
const localKataDir = path.join(cwd, '.claude', 'commands', 'kata');
const isLocalInstall = fs.existsSync(localKataDir);

// Use appropriate VERSION path based on installation type
// Cache always goes to home dir (statusline reads from there)
const cacheDir = path.join(homeDir, '.claude', 'cache');
const cacheFile = path.join(cacheDir, 'kata-update-check.json');
const versionFile = isLocalInstall
  ? path.join(cwd, '.claude', 'kata', 'VERSION')
  : path.join(homeDir, '.claude', 'kata', 'VERSION');

// Ensure cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Run check in background (spawn detached process)
const child = spawn(process.execPath, ['-e', `
  const fs = require('fs');
  const { execSync } = require('child_process');

  const cacheFile = ${JSON.stringify(cacheFile)};
  const versionFile = ${JSON.stringify(versionFile)};

  let installed = '0.0.0';
  try {
    installed = fs.readFileSync(versionFile, 'utf8').trim();
  } catch (e) {}

  let latest = null;
  try {
    latest = execSync('npm view @gannonh/kata version', { encoding: 'utf8', timeout: 10000 }).trim();
  } catch (e) {}

  const result = {
    update_available: latest && installed !== latest,
    installed,
    latest: latest || 'unknown',
    checked: Math.floor(Date.now() / 1000)
  };

  fs.writeFileSync(cacheFile, JSON.stringify(result));
`], {
  detached: true,
  stdio: 'ignore'
});

child.unref();
