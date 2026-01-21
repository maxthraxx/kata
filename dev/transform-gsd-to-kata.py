#!/usr/bin/env python3

import re
import shutil
from pathlib import Path

# Source and target directories
SOURCE_ROOT = Path("/Users/gannonhall/dev/oss/get-shit-done")
KATA_ROOT = Path("/Users/gannonhall/dev/oss/kata")
TRANSFORM_ROOT = KATA_ROOT / "dev" / "transform"

# Track statistics
stats = {
    "commands_copied": 0,
    "agents_copied": 0,
    "agents_renamed": 0,
    "workflows_copied": 0,
    "style_guide_copied": 0,
}

def copy_with_tracking(source_dir, target_dir, stat_key):
    """Copy files from source to target, tracking count."""
    if not source_dir.exists():
        print(f"Warning: Source directory '{source_dir}' not found, skipping...")
        return

    # Create target directory
    target_dir.mkdir(parents=True, exist_ok=True)

    # Copy all files recursively
    for item in source_dir.rglob("*"):
        if item.is_file():
            relative_path = item.relative_to(source_dir)
            target_path = target_dir / relative_path
            target_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target_path)
            stats[stat_key] += 1

def copy_and_rename_agents(source_dir, target_dir):
    """Copy agent files, renaming gsd- prefix to kata- in both filename and frontmatter."""
    if not source_dir.exists():
        print(f"Warning: Source directory '{source_dir}' not found, skipping...")
        return

    # Create target directory
    target_dir.mkdir(parents=True, exist_ok=True)

    # Copy all files, renaming as needed
    for item in source_dir.rglob("*"):
        if item.is_file():
            original_name = item.name

            # Rename gsd- prefix to kata-
            if original_name.startswith("gsd-"):
                new_name = "kata-" + original_name[4:]
                stats["agents_renamed"] += 1

                # Read file and update frontmatter
                with open(item, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Update name field in frontmatter (gsd-* → kata-*)
                content = re.sub(
                    r'^name:\s+gsd-(.*)$',
                    r'name: kata-\1',
                    content,
                    flags=re.MULTILINE
                )

                # Write to new location
                target_path = target_dir / new_name
                target_path.parent.mkdir(parents=True, exist_ok=True)
                with open(target_path, 'w', encoding='utf-8') as f:
                    f.write(content)
            else:
                new_name = original_name

                # Just copy non-gsd files
                target_path = target_dir / new_name
                target_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(item, target_path)

            stats["agents_copied"] += 1

def main():
    print("=== GSD to Kata Transformation Script ===\n")

    # Verify source exists
    if not SOURCE_ROOT.exists():
        print(f"Error: Source directory '{SOURCE_ROOT}' not found.")
        print("Ensure get-shit-done repository is cloned to expected location.")
        return 1

    print(f"Source: {SOURCE_ROOT}")
    print(f"Targets:")
    print(f"  - Commands: {TRANSFORM_ROOT / 'commands' / 'gsd'}")
    print(f"  - Agents: {KATA_ROOT / 'agents'}")
    print(f"  - Workflows: {KATA_ROOT / 'kata'}")
    print()

    # Step 1: Copy commands to dev/transform
    print("Step 1: Copying commands to dev/transform/commands/gsd...")
    copy_with_tracking(
        SOURCE_ROOT / "commands" / "gsd",
        TRANSFORM_ROOT / "commands" / "gsd",
        "commands_copied"
    )

    # Step 2: Copy and rename agents directly to kata/agents
    print("Step 2: Copying and renaming agents to kata/agents...")
    copy_and_rename_agents(
        SOURCE_ROOT / "agents",
        KATA_ROOT / "agents"
    )

    # Step 3: Copy workflows directly to kata/kata
    print("Step 3: Copying workflows to kata/kata...")
    copy_with_tracking(
        SOURCE_ROOT / "get-shit-done",
        KATA_ROOT / "kata",
        "workflows_copied"
    )

    # Step 4: Copy style guide
    print("Step 4: Copying style guide (GSD-STYLE.md → KATA-STYLE.md)...")
    style_source = SOURCE_ROOT / "GSD-STYLE.md"
    style_target = KATA_ROOT / "KATA-STYLE.md"

    if style_source.exists():
        # Read and copy style guide
        with open(style_source, 'r', encoding='utf-8') as f:
            content = f.read()

        with open(style_target, 'w', encoding='utf-8') as f:
            f.write(content)

        stats["style_guide_copied"] = 1
        print(f"  ✓ GSD-STYLE.md → KATA-STYLE.md")
    else:
        print(f"  Warning: {style_source} not found, skipping...")

    # Display results
    print("\n=== Results ===\n")
    print(f"Commands copied:    {stats['commands_copied']}")
    print(f"  → {TRANSFORM_ROOT / 'commands' / 'gsd'}")
    print(f"\nAgents copied:      {stats['agents_copied']}")
    print(f"  - Renamed (gsd- → kata-): {stats['agents_renamed']}")
    print(f"  → {KATA_ROOT / 'agents'}")
    print(f"\nWorkflows copied:   {stats['workflows_copied']}")
    print(f"  → {KATA_ROOT / 'kata'}")
    print(f"\nStyle guide:        {'✓ copied' if stats['style_guide_copied'] else '✗ not found'}")
    print(f"  → {KATA_ROOT / 'KATA-STYLE.md'}")
    print(f"\nTotal files copied: {sum(stats.values()) - stats['agents_renamed']}")
    print("\n=== Complete ===")

    return 0

if __name__ == "__main__":
    exit(main())
