#!/usr/bin/env python3
"""
Post-process skill frontmatter to add missing fields.

Adds to each skill:
- version: 0.1.0
- user-invocable: false
- disable-model-invocation: false
- allowed-tools: [Read, Write, Bash]
"""

from pathlib import Path


def has_field(frontmatter_text: str, field: str) -> bool:
    """Check if a field exists in frontmatter text."""
    for line in frontmatter_text.split("\n"):
        if line.startswith(f"{field}:"):
            return True
    return False


def add_skill_frontmatter(skill_md_path: Path) -> bool:
    """Add missing frontmatter fields to a skill file.

    Returns True if frontmatter was modified, False otherwise.
    """
    try:
        content = skill_md_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"  ✗ Error reading {skill_md_path.name}: {e}")
        return False

    if not content.startswith("---"):
        print(f"  ✗ No frontmatter found in {skill_md_path.name}")
        return False

    parts = content.split("---", 2)
    if len(parts) < 3:
        print(f"  ✗ Invalid frontmatter structure in {skill_md_path.name}")
        return False

    frontmatter_text = parts[1].strip()
    body = parts[2]

    # Check which fields are missing
    fields_to_add = []

    if not has_field(frontmatter_text, "version"):
        fields_to_add.append("version: 0.1.0")

    if not has_field(frontmatter_text, "user-invocable"):
        fields_to_add.append("user-invocable: false")

    if not has_field(frontmatter_text, "disable-model-invocation"):
        fields_to_add.append("disable-model-invocation: false")

    if not has_field(frontmatter_text, "allowed-tools"):
        fields_to_add.append("allowed-tools:\n  - Read\n  - Write\n  - Bash")

    if not fields_to_add:
        return False

    # Add missing fields
    new_frontmatter = frontmatter_text + "\n" + "\n".join(fields_to_add)
    new_content = f"---\n{new_frontmatter}\n---{body}"

    try:
        skill_md_path.write_text(new_content, encoding="utf-8")
        return True
    except Exception as e:
        print(f"  ✗ Error writing {skill_md_path.name}: {e}")
        return False


def main():
    print("=== Skill Frontmatter Post-Processor ===\n")

    skills_dir = Path("dev/transform/kata-staging/skills")

    if not skills_dir.exists():
        print(f"Error: Skills directory not found at {skills_dir}")
        return 1

    print(f"Processing skills in: {skills_dir}\n")

    processed = 0
    updated = 0
    errors = 0

    skill_files = list(skills_dir.rglob("SKILL.md"))

    if not skill_files:
        print("No SKILL.md files found.")
        return 1

    for skill_md in sorted(skill_files):
        skill_name = skill_md.parent.name
        processed += 1

        result = add_skill_frontmatter(skill_md)
        if result:
            print(f"  ✓ Updated {skill_name}/SKILL.md")
            updated += 1
        elif result is False:
            print(f"  - No changes needed for {skill_name}/SKILL.md")

    print()
    print("─" * 60)
    print(f"Processed: {processed} skills")
    print(f"Updated:   {updated} skills")
    if errors > 0:
        print(f"Errors:    {errors} skills")
    print("─" * 60)

    return 0


if __name__ == "__main__":
    exit(main())
