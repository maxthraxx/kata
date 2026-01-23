import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

describe('NPM build', () => {
  before(() => {
    execSync('npm run build:npm', { cwd: ROOT, stdio: 'pipe' });
  });

  test('creates dist/npm directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/npm')));
  });

  test('includes bin/install.js', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/npm/bin/install.js')));
  });

  test('includes package.json', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/npm/package.json')));
  });

  test('includes commands directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/npm/commands')));
  });

  test('includes skills directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/npm/skills')));
  });

  test('includes hooks directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/npm/hooks')));
  });

  test('includes kata directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/npm/kata')));
  });

  test('includes agents directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/npm/agents')));
  });

  test('skills reference valid paths (static or dynamic)', () => {
    const skillPath = path.join(ROOT, 'dist/npm/skills/kata-executing-phases/SKILL.md');
    if (fs.existsSync(skillPath)) {
      const content = fs.readFileSync(skillPath, 'utf8');
      // NPM skills can use:
      // - @~/.claude/ paths (static)
      // - @./.claude/ paths (static, local)
      // - $KATA_BASE paths (dynamic resolution)
      assert.ok(
        content.includes('@~/.claude/') || content.includes('@./.claude/') || content.includes('$KATA_BASE'),
        'NPM skills should reference valid path patterns'
      );
    }
  });

  test('package.json has correct name', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/npm/package.json'), 'utf8'));
    assert.strictEqual(pkg.name, '@gannonh/kata');
  });
});

describe('Plugin build', () => {
  before(() => {
    execSync('npm run build:plugin', { cwd: ROOT, stdio: 'pipe' });
  });

  test('creates dist/plugin directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/plugin')));
  });

  test('includes .claude-plugin/plugin.json', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/plugin/.claude-plugin/plugin.json')));
  });

  test('includes commands directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/plugin/commands')));
  });

  test('includes skills directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/plugin/skills')));
  });

  test('includes hooks directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/plugin/hooks')));
  });

  test('includes kata directory', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/plugin/kata')));
  });

  test('includes VERSION file', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'dist/plugin/VERSION')));
  });

  test('skills reference ./kata/ paths (not ~/.claude/)', () => {
    const skillPath = path.join(ROOT, 'dist/plugin/skills/kata-executing-phases/SKILL.md');
    if (fs.existsSync(skillPath)) {
      const content = fs.readFileSync(skillPath, 'utf8');
      assert.ok(
        !content.includes('@~/.claude/kata/'),
        'Plugin skills should NOT reference ~/.claude/kata/ paths'
      );
    }
  });

  test('no ~/.claude/ references in plugin distribution', () => {
    const result = execSync(
      'grep -r "@~/.claude/" dist/plugin/ 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' }
    );
    assert.strictEqual(result.trim(), '', 'Plugin should not have ~/.claude/ references');
  });

  test('plugin.json has correct name', () => {
    const plugin = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'dist/plugin/.claude-plugin/plugin.json'), 'utf8')
    );
    assert.strictEqual(plugin.name, 'kata');
  });
});

describe('Version consistency', () => {
  test('package.json and plugin.json have same version', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const plugin = JSON.parse(
      fs.readFileSync(path.join(ROOT, '.claude-plugin/plugin.json'), 'utf8')
    );
    assert.strictEqual(pkg.version, plugin.version,
      `Version mismatch: package.json=${pkg.version}, plugin.json=${plugin.version}`);
  });

  test('built plugin VERSION matches package.json', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const versionFile = path.join(ROOT, 'dist/plugin/VERSION');
    if (fs.existsSync(versionFile)) {
      const version = fs.readFileSync(versionFile, 'utf8').trim();
      assert.strictEqual(version, pkg.version,
        `Plugin VERSION mismatch: ${version} vs package.json ${pkg.version}`);
    }
  });

  test('built npm VERSION matches package.json', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const versionFile = path.join(ROOT, 'dist/npm/kata/VERSION');
    if (fs.existsSync(versionFile)) {
      const version = fs.readFileSync(versionFile, 'utf8').trim();
      assert.strictEqual(version, pkg.version,
        `NPM VERSION mismatch: ${version} vs package.json ${pkg.version}`);
    }
  });
});

describe('No stale references', () => {
  test('no kata-cc references in source', () => {
    const result = execSync(
      'grep -r "kata-cc" commands/ skills/ kata/ agents/ 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' }
    );
    assert.strictEqual(result.trim(), '', 'Should not have stale kata-cc references');
  });

  test('no GSD references in source', () => {
    const result = execSync(
      'grep -ri "get-shit-done\\|glittercowboy/gsd" commands/ skills/ kata/ agents/ 2>/dev/null || true',
      { cwd: ROOT, encoding: 'utf8' }
    );
    // Allow references in README or historical docs, but not in functional code
    const lines = result.trim().split('\n').filter(l => l && !l.includes('README') && !l.includes('CHANGELOG'));
    assert.strictEqual(lines.length, 0, 'Should not have stale GSD references in functional code');
  });
});

describe('Command structure', () => {
  test('all commands have kata: prefix', () => {
    const commandsDir = path.join(ROOT, 'commands/kata');
    if (fs.existsSync(commandsDir)) {
      const commands = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
      for (const cmd of commands) {
        const content = fs.readFileSync(path.join(commandsDir, cmd), 'utf8');
        const nameMatch = content.match(/^name:\s*(.+)$/m);
        if (nameMatch) {
          assert.ok(
            nameMatch[1].startsWith('kata:'),
            `Command ${cmd} should have kata: prefix, got: ${nameMatch[1]}`
          );
        }
      }
    }
  });
});

describe('Hook scripts', () => {
  test('hooks use ES module syntax', () => {
    const hooksDir = path.join(ROOT, 'hooks');
    if (fs.existsSync(hooksDir)) {
      const jsFiles = fs.readdirSync(hooksDir).filter(f => f.endsWith('.js'));
      for (const file of jsFiles) {
        const content = fs.readFileSync(path.join(hooksDir, file), 'utf8');
        // Check for ESM patterns (import/export) or lack of CommonJS patterns
        const hasESM = content.includes('import ') || content.includes('export ');
        const hasCJS = content.includes('require(') || content.includes('module.exports');
        if (hasCJS && !hasESM) {
          assert.fail(`Hook ${file} uses CommonJS but should use ES modules`);
        }
      }
    }
  });
});

describe('Skill frontmatter validation', () => {
  /**
   * Recursively find all SKILL.md files
   */
  function findSkillFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findSkillFiles(fullPath, files);
      } else if (entry.name === 'SKILL.md') {
        files.push(fullPath);
      }
    }
    return files;
  }

  /**
   * Parse YAML frontmatter from markdown content
   */
  function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const frontmatter = {};
    const lines = match[1].split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        frontmatter[key] = value;
      }
    }
    return frontmatter;
  }

  test('all skills have description in frontmatter', () => {
    const skillsDir = path.join(ROOT, 'skills');
    const skillFiles = findSkillFiles(skillsDir);
    const errors = [];

    for (const file of skillFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const frontmatter = parseFrontmatter(content);
      const relativePath = path.relative(ROOT, file);

      if (!frontmatter) {
        errors.push(`${relativePath}: Missing frontmatter`);
        continue;
      }

      if (!frontmatter.description) {
        errors.push(`${relativePath}: Missing 'description' in frontmatter`);
      }
    }

    if (errors.length > 0) {
      assert.fail(`Skill frontmatter errors:\n${errors.join('\n')}`);
    }
  });

  test('skill descriptions are meaningful (not empty or too short)', () => {
    const skillsDir = path.join(ROOT, 'skills');
    const skillFiles = findSkillFiles(skillsDir);
    const errors = [];

    for (const file of skillFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const frontmatter = parseFrontmatter(content);
      const relativePath = path.relative(ROOT, file);

      if (frontmatter && frontmatter.description) {
        const desc = frontmatter.description.replace(/^["']|["']$/g, '');
        if (desc.length < 10) {
          errors.push(`${relativePath}: Description too short (${desc.length} chars)`);
        }
      }
    }

    if (errors.length > 0) {
      assert.fail(`Skill description errors:\n${errors.join('\n')}`);
    }
  });
});

describe('Agent file validation', () => {
  test('all agent files have description in frontmatter', () => {
    const agentsDir = path.join(ROOT, 'agents');
    if (!fs.existsSync(agentsDir)) return;

    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
    const errors = [];

    for (const file of agentFiles) {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
      const match = content.match(/^---\n([\s\S]*?)\n---/);

      if (!match) {
        errors.push(`${file}: Missing frontmatter`);
        continue;
      }

      if (!match[1].includes('description:')) {
        errors.push(`${file}: Missing 'description' in frontmatter`);
      }
    }

    if (errors.length > 0) {
      assert.fail(`Agent frontmatter errors:\n${errors.join('\n')}`);
    }
  });

});

describe('Workflow @-reference validation', () => {
  /**
   * Extract @-references from content
   * Stops at whitespace, newlines, backticks, quotes, and XML brackets
   */
  function extractReferences(content) {
    const refs = [];
    // Match @~/.claude/... or @./... references
    // Stop at whitespace, newlines, backticks, quotes, parentheses, XML brackets
    const patterns = [
      /@~\/\.claude\/[^\s\n<>`"'()]+/g,
      /@\.\/[^\s\n<>`"'()]+/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        refs.push(match[0]);
      }
    }
    return refs;
  }

  /**
   * Resolve a reference to a file path
   */
  function resolveRef(ref) {
    if (ref.startsWith('@~/.claude/')) {
      // For source validation, map to local path
      const relativePath = ref.replace('@~/.claude/', '');
      return path.join(ROOT, relativePath);
    } else if (ref.startsWith('@./')) {
      const relativePath = ref.replace('@./', '');
      return path.join(ROOT, relativePath);
    }
    return null;
  }

  test('workflow @-references point to existing files', () => {
    const workflowsDir = path.join(ROOT, 'kata/workflows');
    if (!fs.existsSync(workflowsDir)) return;

    const workflowFiles = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.md'));
    const errors = [];

    for (const file of workflowFiles) {
      const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
      const refs = extractReferences(content);

      for (const ref of refs) {
        const resolved = resolveRef(ref);
        if (resolved && !fs.existsSync(resolved)) {
          errors.push(`${file}: Reference not found: ${ref}`);
        }
      }
    }

    if (errors.length > 0) {
      assert.fail(`Broken @-references:\n${errors.join('\n')}`);
    }
  });

  test('skill @-references point to existing files', () => {
    const skillsDir = path.join(ROOT, 'skills');
    if (!fs.existsSync(skillsDir)) return;

    const errors = [];

    function checkDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.name.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const refs = extractReferences(content);
          const relativePath = path.relative(ROOT, fullPath);

          for (const ref of refs) {
            const resolved = resolveRef(ref);
            if (resolved && !fs.existsSync(resolved)) {
              errors.push(`${relativePath}: Reference not found: ${ref}`);
            }
          }
        }
      }
    }

    checkDir(skillsDir);

    if (errors.length > 0) {
      assert.fail(`Broken @-references in skills:\n${errors.join('\n')}`);
    }
  });

  test('template @-references point to existing files', () => {
    const templatesDir = path.join(ROOT, 'kata/templates');
    if (!fs.existsSync(templatesDir)) return;

    const templateFiles = fs.readdirSync(templatesDir).filter(f => f.endsWith('.md'));
    const errors = [];

    for (const file of templateFiles) {
      const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
      const refs = extractReferences(content);

      for (const ref of refs) {
        const resolved = resolveRef(ref);
        if (resolved && !fs.existsSync(resolved)) {
          errors.push(`${file}: Reference not found: ${ref}`);
        }
      }
    }

    if (errors.length > 0) {
      assert.fail(`Broken @-references in templates:\n${errors.join('\n')}`);
    }
  });
});

describe('Command validation', () => {
  /**
   * Parse YAML frontmatter from markdown content
   */
  function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const frontmatter = {};
    const lines = match[1].split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        frontmatter[key] = value;
      }
    }
    return frontmatter;
  }

  test('commands with $ARGUMENTS have argument-hint', () => {
    const commandsDir = path.join(ROOT, 'commands/kata');
    if (!fs.existsSync(commandsDir)) return;

    const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
    const errors = [];

    for (const file of commandFiles) {
      const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');

      // Check if command uses $ARGUMENTS
      if (content.includes('$ARGUMENTS')) {
        const frontmatter = parseFrontmatter(content);
        if (frontmatter && !frontmatter['argument-hint']) {
          errors.push(`${file}: Uses $ARGUMENTS but missing 'argument-hint' in frontmatter`);
        }
      }
    }

    if (errors.length > 0) {
      assert.fail(`Command argument-hint errors:\n${errors.join('\n')}`);
    }
  });

  test('all commands have description', () => {
    const commandsDir = path.join(ROOT, 'commands/kata');
    if (!fs.existsSync(commandsDir)) return;

    const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
    const errors = [];

    for (const file of commandFiles) {
      const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
      const frontmatter = parseFrontmatter(content);

      if (!frontmatter) {
        errors.push(`${file}: Missing frontmatter`);
      } else if (!frontmatter.description) {
        errors.push(`${file}: Missing 'description' in frontmatter`);
      }
    }

    if (errors.length > 0) {
      assert.fail(`Command description errors:\n${errors.join('\n')}`);
    }
  });
});

describe('Dynamic path resolution', () => {
  /**
   * Files that should have the <kata_path> block for dynamic path resolution.
   * This is critical for plugin installations where paths differ from NPM installs.
   */
  const FILES_REQUIRING_PATH_RESOLUTION = {
    agents: [
      'kata-research-synthesizer.md',
      'kata-roadmapper.md',
      'kata-executor.md',
      'kata-planner.md',
    ],
    skills: [
      'kata-completing-milestones',
      'kata-discussing-phases',
      'kata-executing-phases',
      'kata-listing-phase-assumptions',
      'kata-mapping-codebases',
      'kata-planning-phases',
      'kata-resuming-work',
      'kata-showing-whats-new',
      'kata-starting-milestones',
      'kata-starting-projects',
      'kata-updating',
      'kata-verifying-work',
    ],
    workflows: [
      'discovery-phase.md',
      'execute-plan.md',
      'milestone-complete.md',
      'phase-execute.md',
      'phase-verify.md',
      'resume-project.md',
      'verify-work.md',
    ],
    templates: [
      'phase-prompt.md',
    ],
  };

  test('agent files have <kata_path> block', () => {
    const errors = [];
    for (const file of FILES_REQUIRING_PATH_RESOLUTION.agents) {
      const filePath = path.join(ROOT, 'agents', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('<kata_path>')) {
          errors.push(`agents/${file}: Missing <kata_path> block`);
        }
      }
    }
    if (errors.length > 0) {
      assert.fail(`Missing path resolution blocks:\n${errors.join('\n')}`);
    }
  });

  test('skill files have <kata_path> block', () => {
    const errors = [];
    for (const skillName of FILES_REQUIRING_PATH_RESOLUTION.skills) {
      const filePath = path.join(ROOT, 'skills', skillName, 'SKILL.md');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('<kata_path>')) {
          errors.push(`skills/${skillName}/SKILL.md: Missing <kata_path> block`);
        }
      }
    }
    if (errors.length > 0) {
      assert.fail(`Missing path resolution blocks:\n${errors.join('\n')}`);
    }
  });

  test('workflow files have <kata_path> block', () => {
    const errors = [];
    for (const file of FILES_REQUIRING_PATH_RESOLUTION.workflows) {
      const filePath = path.join(ROOT, 'kata/workflows', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('<kata_path>')) {
          errors.push(`kata/workflows/${file}: Missing <kata_path> block`);
        }
      }
    }
    if (errors.length > 0) {
      assert.fail(`Missing path resolution blocks:\n${errors.join('\n')}`);
    }
  });

  test('template files have <kata_path> block', () => {
    const errors = [];
    for (const file of FILES_REQUIRING_PATH_RESOLUTION.templates) {
      const filePath = path.join(ROOT, 'kata/templates', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('<kata_path>')) {
          errors.push(`kata/templates/${file}: Missing <kata_path> block`);
        }
      }
    }
    if (errors.length > 0) {
      assert.fail(`Missing path resolution blocks:\n${errors.join('\n')}`);
    }
  });

  test('<kata_path> blocks contain KATA_BASE resolution script', () => {
    const errors = [];
    const allFiles = [
      ...FILES_REQUIRING_PATH_RESOLUTION.agents.map(f => path.join(ROOT, 'agents', f)),
      ...FILES_REQUIRING_PATH_RESOLUTION.skills.map(s => path.join(ROOT, 'skills', s, 'SKILL.md')),
      ...FILES_REQUIRING_PATH_RESOLUTION.workflows.map(f => path.join(ROOT, 'kata/workflows', f)),
      ...FILES_REQUIRING_PATH_RESOLUTION.templates.map(f => path.join(ROOT, 'kata/templates', f)),
    ];

    for (const filePath of allFiles) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(ROOT, filePath);

        // Check for KATA_BASE assignment in the kata_path block
        if (content.includes('<kata_path>')) {
          if (!content.includes('KATA_BASE=')) {
            errors.push(`${relativePath}: <kata_path> block missing KATA_BASE assignment`);
          }
          if (!content.includes('CLAUDE_PLUGIN_ROOT')) {
            errors.push(`${relativePath}: <kata_path> block missing CLAUDE_PLUGIN_ROOT check`);
          }
        }
      }
    }

    if (errors.length > 0) {
      assert.fail(`Invalid <kata_path> blocks:\n${errors.join('\n')}`);
    }
  });

  test('files with <kata_path> use $KATA_BASE for path references', () => {
    const errors = [];
    const allFiles = [
      ...FILES_REQUIRING_PATH_RESOLUTION.agents.map(f => path.join(ROOT, 'agents', f)),
      ...FILES_REQUIRING_PATH_RESOLUTION.skills.map(s => path.join(ROOT, 'skills', s, 'SKILL.md')),
      ...FILES_REQUIRING_PATH_RESOLUTION.workflows.map(f => path.join(ROOT, 'kata/workflows', f)),
      ...FILES_REQUIRING_PATH_RESOLUTION.templates.map(f => path.join(ROOT, 'kata/templates', f)),
    ];

    for (const filePath of allFiles) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(ROOT, filePath);

        // Skip the kata_path block itself when checking for hardcoded paths
        let contentWithoutKataPath = content.replace(/<kata_path>[\s\S]*?<\/kata_path>/g, '');

        // Also skip bash file existence checks (e.g., [ -f ~/.claude/kata/VERSION ])
        // These are runtime conditionals, not path references that Claude reads
        contentWithoutKataPath = contentWithoutKataPath.replace(/\[ -[fd] [^\]]+\]/g, '');
        contentWithoutKataPath = contentWithoutKataPath.replace(/if \[ -[fd] [^\]]+\]/g, '');
        contentWithoutKataPath = contentWithoutKataPath.replace(/elif \[ -[fd] [^\]]+\]/g, '');

        // Check for hardcoded ~/.claude/kata/ paths (should be $KATA_BASE/)
        // Only flag @-style references that Claude reads (not bash file checks)
        const hardcodedRefs = contentWithoutKataPath.match(/@~\/\.claude\/kata\/[^\s\n<>`"'()]+/g) || [];

        for (const ref of hardcodedRefs) {
          errors.push(`${relativePath}: Hardcoded path found: ${ref} (should use $KATA_BASE/)`);
        }
      }
    }

    if (errors.length > 0) {
      assert.fail(`Hardcoded paths found (should use $KATA_BASE):\n${errors.join('\n')}`);
    }
  });

  test('no orphaned hardcoded ~/.claude/kata/ paths in source', () => {
    // Check all source files for any remaining hardcoded paths
    const dirsToCheck = ['agents', 'skills', 'kata/workflows', 'kata/templates'];
    const errors = [];

    for (const dir of dirsToCheck) {
      const fullDir = path.join(ROOT, dir);
      if (!fs.existsSync(fullDir)) continue;

      function checkDir(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            checkDir(fullPath);
          } else if (entry.name.endsWith('.md')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const relativePath = path.relative(ROOT, fullPath);

            // Skip the kata_path block when checking
            let contentWithoutKataPath = content.replace(/<kata_path>[\s\S]*?<\/kata_path>/g, '');

            // Also skip bash file existence checks and conditionals
            contentWithoutKataPath = contentWithoutKataPath.replace(/\[ -[fd] [^\]]+\]/g, '');
            contentWithoutKataPath = contentWithoutKataPath.replace(/if \[ -[fd] [^\]]+\]/g, '');
            contentWithoutKataPath = contentWithoutKataPath.replace(/elif \[ -[fd] [^\]]+\]/g, '');
            contentWithoutKataPath = contentWithoutKataPath.replace(/cat [^\n]+\/VERSION/g, '');

            // Look for @-style references that should use $KATA_BASE
            // These are the paths Claude reads, not bash file operations
            const patterns = [
              /@~\/\.claude\/kata\/templates\//g,
              /@~\/\.claude\/kata\/workflows\//g,
              /@~\/\.claude\/kata\/references\//g,
            ];

            for (const pattern of patterns) {
              const matches = contentWithoutKataPath.match(pattern) || [];
              for (const match of matches) {
                errors.push(`${relativePath}: Found ${match}`);
              }
            }
          }
        }
      }

      checkDir(fullDir);
    }

    if (errors.length > 0) {
      assert.fail(`Orphaned hardcoded paths found:\n${errors.join('\n')}`);
    }
  });
});

describe('Circular dependency check', () => {
  /**
   * Extract @-references from content (workflow files only)
   */
  function extractWorkflowRefs(content) {
    const refs = [];
    const pattern = /@~\/\.claude\/kata\/workflows\/([^\s\n<>]+\.md)/g;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      refs.push(match[1]);
    }
    return refs;
  }

  test('no circular references in workflows', () => {
    const workflowsDir = path.join(ROOT, 'kata/workflows');
    if (!fs.existsSync(workflowsDir)) return;

    // Build dependency graph
    const graph = {};
    const workflowFiles = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.md'));

    for (const file of workflowFiles) {
      const content = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
      const refs = extractWorkflowRefs(content);
      graph[file] = refs;
    }

    // Detect cycles using DFS
    function hasCycle(node, visited, recStack, path) {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const deps = graph[node] || [];
      for (const dep of deps) {
        if (!visited.has(dep)) {
          const result = hasCycle(dep, visited, recStack, path);
          if (result) return result;
        } else if (recStack.has(dep)) {
          path.push(dep);
          return path.slice(path.indexOf(dep));
        }
      }

      path.pop();
      recStack.delete(node);
      return null;
    }

    for (const file of workflowFiles) {
      const cycle = hasCycle(file, new Set(), new Set(), []);
      if (cycle) {
        assert.fail(`Circular dependency detected: ${cycle.join(' -> ')}`);
      }
    }
  });

  test('no circular references in skills', () => {
    const skillsDir = path.join(ROOT, 'skills');
    if (!fs.existsSync(skillsDir)) return;

    // Build dependency graph for skills referencing other skills
    const graph = {};

    function findSkillRefs(dir, skillName) {
      const refs = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          refs.push(...findSkillRefs(fullPath, skillName));
        } else if (entry.name.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          // Look for skill references
          const pattern = /skills\/([^\/\s]+)\/SKILL\.md/g;
          let match;
          while ((match = pattern.exec(content)) !== null) {
            if (match[1] !== skillName) {
              refs.push(match[1]);
            }
          }
        }
      }
      return refs;
    }

    const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name);

    for (const skillName of skillDirs) {
      const skillDir = path.join(skillsDir, skillName);
      graph[skillName] = findSkillRefs(skillDir, skillName);
    }

    // Detect cycles using DFS
    function hasCycle(node, visited, recStack, path) {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const deps = graph[node] || [];
      for (const dep of deps) {
        if (!visited.has(dep)) {
          const result = hasCycle(dep, visited, recStack, path);
          if (result) return result;
        } else if (recStack.has(dep)) {
          path.push(dep);
          return path.slice(path.indexOf(dep));
        }
      }

      path.pop();
      recStack.delete(node);
      return null;
    }

    for (const skillName of skillDirs) {
      const cycle = hasCycle(skillName, new Set(), new Set(), []);
      if (cycle) {
        assert.fail(`Circular skill dependency detected: ${cycle.join(' -> ')}`);
      }
    }
  });
});
