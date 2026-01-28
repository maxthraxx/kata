# Roadmap: Kata

## Overview

Kata is a spec-driven development framework for Claude Code. This roadmap tracks milestones for packaging, distribution, and integration features.

## Milestones

- **v0.1.4 Hard Fork & Rebrand** — Phase 0 (shipped 2026-01-18) — [archive](milestones/v0.1.4-ROADMAP.md)
- **v0.1.5 Skills & Documentation** — Phases 0-2 (shipped 2026-01-22) — [archive](milestones/v0.1.5-ROADMAP.md)
- **v1.0.0 Claude Code Plugin** — Phases 1-3 (shipped 2026-01-23)
- **v1.0.8 Plugin Stability** — Phase 2.1 (shipped 2026-01-24) — [archive](milestones/v1.0.8-ROADMAP.md)
- **v1.0.9 Command Consolidation** — Phase 2.2 (complete)
- **v1.1.0 GitHub Integration** — Phases 0-7 (shipped 2026-01-27) — [archive](milestones/v1.1.0-ROADMAP.md)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>v0.1.4 Hard Fork & Rebrand (Phase 0) — SHIPPED 2026-01-18</summary>

- [x] Phase 0: Hard Fork & Rebrand (5/5 plans) — completed 2026-01-18

</details>

<details>
<summary>v0.1.5 Skills & Documentation (Phases 0-2) — SHIPPED 2026-01-22</summary>

- [x] Phase 0: Convert Commands to Skills (12/12 plans) — completed 2026-01-20
- [x] Phase 1: Migrate Todo Commands to Kata Skill (3/3 plans) — completed 2026-01-20
- [x] Phase 1.1: Testing & Evals Harness (2/2 plans) — completed 2026-01-20
- [x] Phase 1.2: Skill Tests (4/4 plans) — completed 2026-01-20
- [x] Phase 1.3: Discuss Phase Skill (2/2 plans) — completed 2026-01-20
- [x] Phase 2: Create Kata Slash Commands (7/7 plans) — completed 2026-01-21

</details>

<details>
<summary>v1.0.0 Claude Code Plugin (Phases 1-3) — SHIPPED 2026-01-23</summary>

- [x] Phase 1: Plugin Structure & Validation (1/1 plans) — completed 2026-01-22
- [x] Phase 1.1: Document PR Workflow Behavior (1/1 plans) — completed 2026-01-22
- [x] Phase 2: Marketplace Distribution (2/2 plans) — completed 2026-01-23
- [x] Phase 3: Documentation (1/1 plans) — completed 2026-01-23

**Patch releases after v1.0.0:**
- v1.0.1: Plugin release workflow fixes (2026-01-23)
- v1.0.2: Marketplace version update path fix (2026-01-23)
- v1.0.3: Plugin path resolution attempt (2026-01-23)
- v1.0.4: Revert path approach, add tests (2026-01-24)
- v1.0.5: Include hidden directories in marketplace copy (2026-01-24)

</details>

- **v1.0.8 Plugin Stability** — Phase 2.1 (shipped 2026-01-24) — [archive](milestones/v1.0.8-ROADMAP.md)

### v1.0.9 Command Consolidation (Complete)

- [x] **Phase 2.2: Normalize on Skills** (INSERTED) - Remove commands layer, skills become both slash commands and natural language — completed 2026-01-25

#### Phase 2.2: Normalize on Skills (INSERTED)
**Goal**: Eliminate command->skill indirection by making skills directly invocable; update build to strip `kata-` prefix for plugin namespace
**Depends on**: v1.0.8 complete (skills self-contained)
**Success Criteria** (what must be TRUE):
  1. `commands/kata/` directory deleted (27 files)
  2. All skills have `user-invocable: true` (default, remove `user-invocable: false` where present)
  3. Skills invocable as `/kata-planning-phases` (npx) or `/kata:planning-phases` (plugin)
  4. `build.js` strips `kata-` prefix from skill directories and `name` field for plugin distribution
  5. README updated with new invocation syntax
  6. CLAUDE.md updated to reflect architecture change
**Plans:** 3 plans

Plans:
- [x] 02.2-01-PLAN.md — Make all skills user-invocable
- [x] 02.2-02-PLAN.md — Update build.js to strip kata- prefix for plugin
- [x] 02.2-03-PLAN.md — Delete commands, update documentation

<details>
<summary>v1.1.0 GitHub Integration (Phases 0-7) — SHIPPED 2026-01-27</summary>

- [x] Phase 0: Develop Robust Testing Suite (7/7 plans) — completed 2026-01-25
- [x] Phase 1: Audit & Config Foundation (2/2 plans) — completed 2026-01-25
- [x] Phase 2: Onboarding & Milestones (3/3 plans) — completed 2026-01-25
- [x] Phase 2.1: GitHub Repo Setup (INSERTED) (2/2 plans) — completed 2026-01-26
- [x] Phase 2.2: Decouple Project Init & Milestone Setup (INSERTED) (4/4 plans) — completed 2026-01-26
- [x] Phase 3: Phase Issues (2/2 plans) — completed 2026-01-26
- [x] Phase 4: Plan Sync (3/3 plans) — completed 2026-01-26
- [x] Phase 5: PR Integration (3/3 plans) — completed 2026-01-27
- [x] Phase 6: PR Review Workflow Skill & Agents (4/4 plans) — completed 2026-01-27
- [x] Phase 7: Deprecate NPX Support (6/6 plans) — completed 2026-01-27

</details>

## Phase Details

(See milestone archives in `.planning/milestones/` for full phase details of shipped milestones)

## Progress

| Phase                                    | Milestone | Plans Complete | Status   | Completed  |
| ---------------------------------------- | --------- | -------------- | -------- | ---------- |
| 0. Hard Fork & Rebrand                   | v0.1.4    | 5/5            | Complete | 2026-01-18 |
| 0-2. Skills & Documentation              | v0.1.5    | 30/30          | Complete | 2026-01-22 |
| 1-3. Claude Code Plugin                  | v1.0.0    | 5/5            | Complete | 2026-01-23 |
| 2.1 Skill Resource Restructure           | v1.0.8    | 5/5            | Shipped  | 2026-01-24 |
| 2.2 Normalize on Skills                  | v1.0.9    | 3/3            | Complete | 2026-01-25 |
| 0. Develop Robust Testing Suite          | v1.1.0    | 7/7            | Complete | 2026-01-25 |
| 1. Audit & Config Foundation             | v1.1.0    | 2/2            | Complete | 2026-01-25 |
| 2. Onboarding & Milestones               | v1.1.0    | 3/3            | Complete | 2026-01-25 |
| 2.1 GitHub Repo Setup (INSERTED)         | v1.1.0    | 2/2            | Complete | 2026-01-26 |
| 2.2 Decouple Init & Milestone (INSERTED) | v1.1.0    | 4/4            | Complete | 2026-01-26 |
| 3. Phase Issues                          | v1.1.0    | 2/2            | Complete | 2026-01-26 |
| 4. Plan Sync                             | v1.1.0    | 3/3            | Complete | 2026-01-26 |
| 5. PR Integration                        | v1.1.0    | 3/3            | Complete | 2026-01-27 |
| 6. PR Review Workflow Skill              | v1.1.0    | 4/4            | Complete | 2026-01-27 |
| 7. Deprecate NPX Support                 | v1.1.0    | 6/6            | Complete | 2026-01-27 |

---
*Roadmap created: 2026-01-18*
*Last updated: 2026-01-27 — v1.1.0 milestone shipped*
