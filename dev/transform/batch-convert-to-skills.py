#!/usr/bin/env python3

import re
from pathlib import Path

# Command name to skill name mappings (gerund form)
NAME_MAP = {
    'add-phase': 'adding-phases',
    'add-todo': 'adding-todos',
    'analyze-codebase': 'analyzing-codebase',
    'audit-milestone': 'auditing-milestones',
    'check-todos': 'checking-todos',
    'complete-milestone': 'completing-milestones',
    'debug': 'debugging-issues',
    'discuss-phase': 'discussing-phases',
    'execute-phase': 'executing-phases',
    'help': 'getting-help',
    'insert-phase': 'inserting-phases',
    'list-phase-assumptions': 'listing-phase-assumptions',
    'map-codebase': 'mapping-codebase',
    'new-milestone': 'starting-new-milestones',
    'new-project': 'starting-new-projects',
    'pause-work': 'pausing-work',
    'plan-milestone-gaps': 'planning-milestone-gaps',
    'plan-phase': 'planning-phases',
    'progress': 'showing-progress',
    'query-intel': 'querying-intelligence',
    'quick': 'quick-starting',
    'remove-phase': 'removing-phases',
    'research-phase': 'researching-phases',
    'resume-work': 'resuming-work',
    'set-profile': 'setting-profiles',
    'settings': 'managing-settings',
    'update': 'updating-kata',
    'verify-work': 'verifying-work',
    'whats-new': 'showing-updates',
}

# Description enhancements with triggers
DESCRIPTION_MAP = {
    'add-phase': 'Use this skill when adding planned phases to the roadmap, appending sequential work to milestones, or creating new phase entries. Triggers include "add phase", "append phase", "new phase", and "create phase".',
    'add-todo': 'Use this skill when capturing ideas, tasks, or issues that surface during a session as structured todos for later work. Triggers include "add todo", "capture todo", "new todo", and "create todo".',
    'analyze-codebase': 'Use this skill when analyzing codebase structure, architecture, or patterns. Triggers include "analyze codebase", "examine code", and "understand architecture".',
    'audit-milestone': 'Use this skill when verifying milestone achievement against definition of done, checking requirements coverage, or validating end-to-end flows. Triggers include "audit milestone", "verify milestone", and "check milestone".',
    'check-todos': 'Use this skill when reviewing pending todos, checking task status, or managing todo lists. Triggers include "check todos", "show todos", and "list tasks".',
    'complete-milestone': 'Use this skill when finishing a milestone, archiving work, or transitioning to next milestone. Triggers include "complete milestone", "finish milestone", and "close milestone".',
    'debug': 'Use this skill when diagnosing bugs, investigating issues, or troubleshooting problems. Triggers include "debug", "investigate bug", and "diagnose issue".',
    'discuss-phase': 'Use this skill when exploring phase requirements, clarifying goals, or discussing implementation approaches. Triggers include "discuss phase", "explore phase", and "talk about phase".',
    'execute-phase': 'Use this skill when executing phase plans, running tasks, or implementing planned work. Triggers include "execute phase", "run phase", and "implement phase".',
    'help': 'Use this skill when requesting help, learning about Kata commands, or getting started. Triggers include "help", "how do I", and "what commands".',
    'insert-phase': 'Use this skill when inserting phases between existing phases, adding urgent work, or creating decimal-numbered phases. Triggers include "insert phase", "add urgent phase", and "create decimal phase".',
    'list-phase-assumptions': 'Use this skill when listing phase assumptions, reviewing constraints, or documenting decisions. Triggers include "list assumptions", "show assumptions", and "phase assumptions".',
    'map-codebase': 'Use this skill when mapping codebase structure, documenting architecture, or creating codebase overviews. Triggers include "map codebase", "document structure", and "create map".',
    'new-milestone': 'Use this skill when starting new milestones, adding major work packages, or extending roadmaps. Triggers include "new milestone", "add milestone", and "create milestone".',
    'new-project': 'Use this skill when starting new projects, initializing Kata, or setting up project structure. Triggers include "new project", "start project", and "initialize project".',
    'pause-work': 'Use this skill when pausing work, saving progress, or stopping development. Triggers include "pause work", "stop work", and "save progress".',
    'plan-milestone-gaps': 'Use this skill when identifying missing work, finding roadmap gaps, or planning additional phases. Triggers include "plan gaps", "find missing work", and "identify gaps".',
    'plan-phase': 'Use this skill when planning phases, breaking down work, or creating phase plans. Triggers include "plan phase", "create plan", and "break down phase".',
    'progress': 'Use this skill when checking progress, reviewing status, or seeing what\'s done. Triggers include "show progress", "check status", and "where are we".',
    'query-intel': 'Use this skill when querying project intelligence, searching context, or finding information. Triggers include "query intel", "search context", and "find information".',
    'quick': 'Use this skill for quick actions, fast operations, or simple tasks. Triggers include "quick", "fast", and "simple".',
    'remove-phase': 'Use this skill when removing phases, deleting planned work, or cleaning up roadmap. Triggers include "remove phase", "delete phase", and "cancel phase".',
    'research-phase': 'Use this skill when researching phases, gathering domain knowledge, or exploring implementations. Triggers include "research phase", "investigate phase", and "explore options".',
    'resume-work': 'Use this skill when resuming paused work, continuing development, or picking up where you left off. Triggers include "resume work", "continue work", and "keep going".',
    'set-profile': 'Use this skill when setting model profiles, configuring AI behavior, or adjusting generation settings. Triggers include "set profile", "change model", and "configure profile".',
    'settings': 'Use this skill when managing Kata settings, configuring behavior, or adjusting preferences. Triggers include "settings", "configure", and "preferences".',
    'update': 'Use this skill when updating Kata to latest version, checking for updates, or installing new features. Triggers include "update", "upgrade", and "check updates".',
    'verify-work': 'Use this skill when verifying completed work, validating implementation, or running acceptance tests. Triggers include "verify work", "validate", and "check work".',
    'whats-new': 'Use this skill when checking what\'s new, viewing recent changes, or seeing latest features. Triggers include "what\'s new", "show changes", and "recent updates".',
}

def extract_frontmatter_and_content(file_path):
    """Extract YAML frontmatter and content from markdown file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match frontmatter
    match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not match:
        return None, content

    frontmatter_text = match.group(1)
    body = match.group(2)

    return frontmatter_text, body

def convert_command_to_skill(command_path, skills_dir):
    """Convert a single command file to skill format."""
    command_path = Path(command_path)
    command_name = command_path.stem

    # Get skill name and description
    skill_name = NAME_MAP.get(command_name, f"{command_name}ing")
    skill_description = DESCRIPTION_MAP.get(command_name, f"Use this skill for {command_name} operations.")

    # Extract frontmatter and content
    frontmatter_text, body = extract_frontmatter_and_content(command_path)

    if frontmatter_text is None:
        print(f"  Warning: No frontmatter found in {command_path.name}")
        return False

    # Create skill directory
    skill_dir = skills_dir / f"kata-{skill_name}"
    skill_dir.mkdir(parents=True, exist_ok=True)

    # Create new frontmatter (basic conversion - only name and description)
    new_frontmatter = f"""---
name: kata-{skill_name}
description: {skill_description}
---"""

    # Write skill file
    skill_path = skill_dir / "SKILL.md"
    with open(skill_path, 'w', encoding='utf-8') as f:
        f.write(new_frontmatter)
        f.write('\n')
        f.write(body)

    return True

def main():
    print("=== Batch Command to Skill Conversion ===\n")

    # Directories
    transform_root = Path("/Users/gannonhall/dev/oss/kata/dev/transform")
    commands_dir = transform_root / "commands" / "gsd"
    skills_dir = transform_root / "skills"

    # Get all command files
    command_files = sorted(commands_dir.glob("*.md"))

    print(f"Found {len(command_files)} commands to convert\n")

    converted = 0
    failed = 0

    for command_file in command_files:
        try:
            print(f"Converting: {command_file.name}...")
            if convert_command_to_skill(command_file, skills_dir):
                converted += 1
            else:
                failed += 1
        except Exception as e:
            print(f"  ERROR: {e}")
            failed += 1

    print(f"\n=== Results ===\n")
    print(f"Converted: {converted}")
    print(f"Failed: {failed}")
    print(f"\nSkills written to: {skills_dir}")
    print("\n=== Complete ===")

if __name__ == "__main__":
    main()
