#!/usr/bin/env python3
"""
GSD to Kata Transformation Script

This script prepares the staging area for GSD→Kata synchronization:
1. Copy GSD repo → gsd-source/ (source of updates)
2. Copy Kata production → kata-staging/ (base to update)

After this script runs, other scripts apply GSD updates to kata-staging.
"""

import re
import shutil
from pathlib import Path

# Directories
GSD_REPO = Path("/Users/gannonhall/dev/oss/get-shit-done")
KATA_ROOT = Path("/Users/gannonhall/dev/oss/kata")
TRANSFORM_ROOT = KATA_ROOT / "dev" / "transform"
GSD_SOURCE = TRANSFORM_ROOT / "gsd-source"
KATA_STAGING = TRANSFORM_ROOT / "kata-staging"

# Kata production directories to copy to staging
KATA_PRODUCTION_DIRS = ["agents", "commands", "hooks", "kata", "skills"]
KATA_PRODUCTION_FILES = ["KATA-STYLE.md", "CHANGELOG.md", "README.md"]

# Track statistics
stats = {
    "gsd_source_files": 0,
    "kata_staging_files": 0,
    "kata_dirs_copied": 0,
    "kata_docs_copied": 0,
}


def copy_gsd_to_source():
    """Copy entire GSD repo to gsd-source/ for reference."""
    print("Copying GSD repo to gsd-source/...")

    if GSD_SOURCE.exists():
        shutil.rmtree(GSD_SOURCE)

    shutil.copytree(
        GSD_REPO,
        GSD_SOURCE,
        ignore=shutil.ignore_patterns('.git', 'node_modules', '__pycache__', '.DS_Store')
    )

    for item in GSD_SOURCE.rglob("*"):
        if item.is_file():
            stats["gsd_source_files"] += 1

    print(f"  ✓ Copied {stats['gsd_source_files']} files to gsd-source/")


def copy_kata_production_to_staging():
    """Copy Kata production files to kata-staging/ as the base to update."""
    print("Copying Kata production to kata-staging/...")

    if KATA_STAGING.exists():
        shutil.rmtree(KATA_STAGING)

    KATA_STAGING.mkdir(parents=True)

    # Copy directories
    for dir_name in KATA_PRODUCTION_DIRS:
        source_dir = KATA_ROOT / dir_name
        target_dir = KATA_STAGING / dir_name

        if source_dir.exists():
            shutil.copytree(
                source_dir,
                target_dir,
                ignore=shutil.ignore_patterns('.DS_Store')
            )
            file_count = sum(1 for _ in target_dir.rglob("*") if _.is_file())
            print(f"  ✓ {dir_name}/: {file_count} files")
            stats["kata_staging_files"] += file_count
            stats["kata_dirs_copied"] += 1
        else:
            print(f"  - {dir_name}/: not found (skipped)")

    # Copy documentation files
    for file_name in KATA_PRODUCTION_FILES:
        source_file = KATA_ROOT / file_name
        target_file = KATA_STAGING / file_name

        if source_file.exists():
            shutil.copy2(source_file, target_file)
            print(f"  ✓ {file_name}")
            stats["kata_staging_files"] += 1
            stats["kata_docs_copied"] += 1
        else:
            print(f"  - {file_name}: not found (skipped)")


def main():
    print("=" * 60)
    print("  GSD to Kata Transformation - Stage 1: Prepare Staging")
    print("=" * 60)
    print()

    # Verify GSD repo exists
    if not GSD_REPO.exists():
        print(f"Error: GSD repo not found at {GSD_REPO}")
        return 1

    print(f"GSD Source:      {GSD_REPO}")
    print(f"Kata Production: {KATA_ROOT}")
    print(f"Staging Area:    {TRANSFORM_ROOT}")
    print()

    # Step 1: Copy GSD repo to gsd-source
    print("Step 1: Copy GSD repo to gsd-source/")
    copy_gsd_to_source()
    print()

    # Step 2: Copy Kata production to kata-staging
    print("Step 2: Copy Kata production to kata-staging/")
    copy_kata_production_to_staging()
    print()

    # Summary
    print("=" * 60)
    print("  STAGING PREPARED")
    print("=" * 60)
    print()
    print(f"gsd-source/:")
    print(f"  {stats['gsd_source_files']} files (GSD repo snapshot)")
    print()
    print(f"kata-staging/:")
    print(f"  {stats['kata_dirs_copied']} directories copied")
    print(f"  {stats['kata_docs_copied']} documentation files")
    print(f"  {stats['kata_staging_files']} total files (Kata production snapshot)")
    print()
    print("Next steps:")
    print("  1. Apply GSD agent updates to kata-staging/agents/")
    print("  2. Apply GSD workflow updates to kata-staging/kata/")
    print("  3. Run text replacements")
    print("  4. Convert commands to skills")
    print("  5. Post-process skill frontmatter")
    print("  6. Generate Kata commands")
    print("  7. Validate")
    print("-" * 60)

    return 0


if __name__ == "__main__":
    exit(main())
