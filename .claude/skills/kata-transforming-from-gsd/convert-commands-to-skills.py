#!/usr/bin/env python3
"""
Convert GSD commands to Kata skills.

For each GSD command in gsd-source/commands/gsd/:
- If skill EXISTS: preserve frontmatter, replace content below frontmatter
- If skill DOES NOT EXIST: create new skill with generated frontmatter
"""

import re
from pathlib import Path

# Paths
GSD_COMMANDS = Path("dev/transform/gsd-source/commands/gsd")
KATA_SKILLS = Path("dev/transform/kata-staging/skills")  # Now contains production copy

# Name transformation: command → skill
GERUND_MAP = {
    "add": "adding",
    "plan": "planning",
    "execute": "executing",
    "verify": "verifying",
    "start": "starting",
    "new": "starting",
    "debug": "debugging",
    "check": "checking",
    "complete": "completing",
    "discuss": "discussing",
    "insert": "inserting",
    "list": "listing",
    "map": "mapping",
    "pause": "pausing",
    "remove": "removing",
    "research": "researching",
    "resume": "resuming",
    "set": "setting",
    "update": "updating",
    "audit": "auditing",
    "help": "providing-help",
    "progress": "tracking-progress",
    "quick": "executing-quick-tasks",
    "settings": "configuring-settings",
    "whats-new": "showing-whats-new",
}

def command_name_to_skill_name(cmd_name: str) -> str:
    """Convert command name to skill name.

    Examples:
        add-phase → kata-adding-phases
        plan-phase → kata-planning-phases
        new-project → kata-starting-new-projects
        debug → kata-debugging
        quick → kata-executing-quick-tasks
    """
    # Handle special cases first
    if cmd_name in GERUND_MAP:
        return f"kata-{GERUND_MAP[cmd_name]}"

    parts = cmd_name.split("-")

    # Convert first word to gerund
    verb = parts[0]
    if verb in GERUND_MAP:
        parts[0] = GERUND_MAP[verb]
    else:
        # Default: add -ing
        if verb.endswith("e"):
            parts[0] = verb[:-1] + "ing"
        else:
            parts[0] = verb + "ing"

    # Pluralize nouns (last part if more than one)
    if len(parts) > 1:
        noun = parts[-1]
        if not noun.endswith("s") and noun not in ("work", "help", "progress"):
            parts[-1] = noun + "s"

    return "kata-" + "-".join(parts)


def parse_frontmatter(content: str) -> tuple[str, str]:
    """Parse YAML frontmatter and return (frontmatter_text, body_content).

    Returns the raw frontmatter text (between ---) to preserve formatting.
    """
    if not content.startswith("---"):
        return "", content

    parts = content.split("---", 2)
    if len(parts) < 3:
        return "", content

    frontmatter_text = parts[1].strip()
    body = parts[2].lstrip("\n")
    return frontmatter_text, body


def get_frontmatter_value(frontmatter_text: str, key: str) -> str:
    """Extract a value from frontmatter text."""
    for line in frontmatter_text.split("\n"):
        if line.startswith(f"{key}:"):
            return line[len(key)+1:].strip().strip('"').strip("'")
    return ""


def generate_skill_frontmatter(cmd_name: str, cmd_frontmatter_text: str) -> str:
    """Generate skill frontmatter text from command frontmatter."""
    skill_name = command_name_to_skill_name(cmd_name)

    # Get original description
    orig_desc = get_frontmatter_value(cmd_frontmatter_text, "description")
    if not orig_desc:
        orig_desc = f"Skill for {cmd_name}"

    # Replace gsd references in description
    orig_desc = re.sub(r'\bgsd\b', 'kata', orig_desc)
    orig_desc = re.sub(r'\bGSD\b', 'Kata', orig_desc)

    # Enhance description with triggers
    triggers = [cmd_name.replace("-", " ")]
    if "-" in cmd_name:
        triggers.append(cmd_name.split("-")[0] + " " + cmd_name.split("-")[-1])

    trigger_str = '", "'.join(triggers)
    enhanced_desc = f'Use this skill when {orig_desc.lower()}. Triggers include "{trigger_str}".'

    return f'name: {skill_name}\ndescription: {enhanced_desc}'


def process_command(cmd_file: Path) -> tuple[str, bool, str]:
    """Process a single command file.

    Returns: (skill_name, was_updated, action_taken)
    """
    cmd_name = cmd_file.stem  # e.g., "add-phase"
    skill_name = command_name_to_skill_name(cmd_name)
    skill_dir = KATA_SKILLS / skill_name
    skill_file = skill_dir / "SKILL.md"

    # Read command
    cmd_content = cmd_file.read_text(encoding="utf-8")
    cmd_frontmatter_text, cmd_body = parse_frontmatter(cmd_content)

    # Replace gsd references with kata in the body
    cmd_body = re.sub(r'\bgsd\b', 'kata', cmd_body)
    cmd_body = re.sub(r'\bGSD\b', 'Kata', cmd_body)
    cmd_body = re.sub(r'/gsd:', '/kata:', cmd_body)

    if skill_file.exists():
        # Skill exists: preserve frontmatter, update content
        existing_content = skill_file.read_text(encoding="utf-8")
        existing_frontmatter_text, _ = parse_frontmatter(existing_content)

        # Rebuild with existing frontmatter + new body
        new_content = f"---\n{existing_frontmatter_text}\n---\n\n{cmd_body}"

        skill_file.write_text(new_content, encoding="utf-8")
        return skill_name, True, "updated (preserved frontmatter)"
    else:
        # Skill doesn't exist: create new
        skill_dir.mkdir(parents=True, exist_ok=True)

        new_frontmatter_text = generate_skill_frontmatter(cmd_name, cmd_frontmatter_text)
        new_content = f"---\n{new_frontmatter_text}\n---\n\n{cmd_body}"

        skill_file.write_text(new_content, encoding="utf-8")
        return skill_name, False, "created (new skill)"


def main():
    print("=== Converting GSD Commands to Kata Skills ===\n")

    if not GSD_COMMANDS.exists():
        print(f"Error: GSD commands directory not found: {GSD_COMMANDS}")
        return 1

    # Ensure skills directory exists
    KATA_SKILLS.mkdir(parents=True, exist_ok=True)

    # Get all command files
    cmd_files = sorted(GSD_COMMANDS.glob("*.md"))

    if not cmd_files:
        print("No command files found.")
        return 1

    print(f"Found {len(cmd_files)} commands to process\n")

    created = 0
    updated = 0

    for cmd_file in cmd_files:
        skill_name, was_existing, action = process_command(cmd_file)

        if "created" in action:
            created += 1
            print(f"  + {cmd_file.stem} → {skill_name} ({action})")
        else:
            updated += 1
            print(f"  ✓ {cmd_file.stem} → {skill_name} ({action})")

    print()
    print("─" * 60)
    print(f"Created: {created} new skills")
    print(f"Updated: {updated} existing skills")
    print(f"Total:   {created + updated} skills processed")
    print("─" * 60)

    return 0


if __name__ == "__main__":
    exit(main())
