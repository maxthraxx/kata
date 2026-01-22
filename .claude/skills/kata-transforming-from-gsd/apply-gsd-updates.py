#!/usr/bin/env python3
"""
Apply GSD Updates to Kata Staging

This script applies updates from gsd-source/ to kata-staging/:
1. Transform and update agents (gsd-* → kata-*)
2. Update workflows (get-shit-done/ → kata/)
3. Update hooks (skips gsd-* files — Kata has custom implementations)

Run this AFTER transform-gsd-to-kata.py has prepared the staging area.
"""

import re
import shutil
from pathlib import Path

# Directories
TRANSFORM_ROOT = Path("dev/transform")
GSD_SOURCE = TRANSFORM_ROOT / "gsd-source"
KATA_STAGING = TRANSFORM_ROOT / "kata-staging"

# Track statistics
stats = {
    "agents_updated": 0,
    "agents_added": 0,
    "workflows_updated": 0,
    "workflows_added": 0,
    "hooks_updated": 0,
}


def transform_agent_content(content: str) -> str:
    """Transform agent content: replace gsd references with kata."""
    # Update name field in frontmatter (gsd-* → kata-*)
    content = re.sub(
        r'^name:\s+gsd-(.*)$',
        r'name: kata-\1',
        content,
        flags=re.MULTILINE
    )
    return content


def apply_agent_updates():
    """Transform GSD agents and update kata-staging/agents/."""
    print("Applying agent updates...")

    gsd_agents = GSD_SOURCE / "agents"
    kata_agents = KATA_STAGING / "agents"

    if not gsd_agents.exists():
        print("  - No GSD agents directory found")
        return

    kata_agents.mkdir(parents=True, exist_ok=True)

    for gsd_file in gsd_agents.glob("*.md"):
        # Transform filename: gsd-* → kata-*
        if gsd_file.name.startswith("gsd-"):
            kata_name = "kata-" + gsd_file.name[4:]
        else:
            kata_name = gsd_file.name

        kata_file = kata_agents / kata_name

        # Read and transform content
        content = gsd_file.read_text(encoding="utf-8")
        content = transform_agent_content(content)

        # Check if file exists in staging
        action = "updated" if kata_file.exists() else "added"

        # Write to staging
        kata_file.write_text(content, encoding="utf-8")

        if action == "updated":
            stats["agents_updated"] += 1
        else:
            stats["agents_added"] += 1

        print(f"  ✓ {gsd_file.name} → {kata_name} ({action})")


def apply_workflow_updates():
    """Copy GSD workflows to kata-staging/kata/."""
    print("Applying workflow updates...")

    gsd_workflows = GSD_SOURCE / "get-shit-done"
    kata_workflows = KATA_STAGING / "kata"

    if not gsd_workflows.exists():
        print("  - No GSD workflows directory found")
        return

    kata_workflows.mkdir(parents=True, exist_ok=True)

    for gsd_file in gsd_workflows.rglob("*.md"):
        relative_path = gsd_file.relative_to(gsd_workflows)
        kata_file = kata_workflows / relative_path

        # Check if file exists in staging
        action = "updated" if kata_file.exists() else "added"

        # Ensure parent directory exists
        kata_file.parent.mkdir(parents=True, exist_ok=True)

        # Copy file
        shutil.copy2(gsd_file, kata_file)

        if action == "updated":
            stats["workflows_updated"] += 1
        else:
            stats["workflows_added"] += 1

    print(f"  ✓ {stats['workflows_updated']} workflows updated, {stats['workflows_added']} added")


def apply_hook_updates():
    """Copy GSD hooks to kata-staging/hooks/, skipping gsd-* files.

    Note: gsd-* hooks are excluded because Kata has custom implementations
    with improvements (local/global install awareness, cache context validation).
    """
    print("Applying hook updates...")

    gsd_hooks = GSD_SOURCE / "hooks"
    kata_hooks = KATA_STAGING / "hooks"

    if not gsd_hooks.exists():
        print("  - No GSD hooks directory found")
        return

    kata_hooks.mkdir(parents=True, exist_ok=True)

    skipped = 0
    for gsd_file in gsd_hooks.rglob("*"):
        if gsd_file.is_file():
            # Skip gsd-* files — Kata has custom implementations
            if gsd_file.name.startswith("gsd-"):
                skipped += 1
                continue

            relative_path = gsd_file.relative_to(gsd_hooks)
            kata_file = kata_hooks / relative_path

            kata_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(gsd_file, kata_file)
            stats["hooks_updated"] += 1

    print(f"  ✓ {stats['hooks_updated']} hooks updated (skipped {skipped} gsd-* files)")


def main():
    print("=" * 60)
    print("  Apply GSD Updates to Kata Staging")
    print("=" * 60)
    print()

    if not GSD_SOURCE.exists():
        print(f"Error: gsd-source/ not found. Run transform-gsd-to-kata.py first.")
        return 1

    if not KATA_STAGING.exists():
        print(f"Error: kata-staging/ not found. Run transform-gsd-to-kata.py first.")
        return 1

    # Apply updates
    apply_agent_updates()
    print()

    apply_workflow_updates()
    print()

    apply_hook_updates()
    print()

    # Summary
    print("=" * 60)
    print("  GSD UPDATES APPLIED")
    print("=" * 60)
    print()
    print(f"Agents:    {stats['agents_updated']} updated, {stats['agents_added']} added")
    print(f"Workflows: {stats['workflows_updated']} updated, {stats['workflows_added']} added")
    print(f"Hooks:     {stats['hooks_updated']} updated")
    print()
    print("Next steps:")
    print("  1. Run text replacements")
    print("  2. Convert commands to skills")
    print("  3. Post-process skill frontmatter")
    print("  4. Generate Kata commands")
    print("  5. Validate")
    print("-" * 60)

    return 0


if __name__ == "__main__":
    exit(main())
