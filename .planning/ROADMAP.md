# Roadmap: Kata

## Overview

Kata is a spec-driven development framework for Claude Code. This roadmap tracks milestones for packaging, distribution, and integration features.

## Milestones

- **v0.1.4 Hard Fork & Rebrand** — Phase 0 (shipped 2026-01-18) — [archive](milestones/v0.1.4-ROADMAP.md)
- **v0.1.5 Skills & Documentation** — Phases 0-2 (shipped 2026-01-22) — [archive](milestones/v0.1.5-ROADMAP.md)
- **v0.1.6 Claude Code Plugin** — Phase 1 (planned)
- **v0.1.7 GitHub Integration** — Phases 1-5 (planned)

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

### v0.1.6 Claude Code Plugin (Planned)

- [ ] **Phase 1: Plugin Distribution** - Package and publish Kata as a Claude Code plugin

### v0.1.7 GitHub Integration (Planned)

- [ ] **Phase 1: Audit & Config Foundation** - Understand integration points, establish config schema
- [ ] **Phase 2: Onboarding & Milestones** - Config during new-project, GitHub Milestone creation
- [ ] **Phase 3: Phase Issues** - Create GitHub Issues for phases with labels and metadata
- [ ] **Phase 4: Plan Sync** - Checklist items in issues, update as plans complete
- [ ] **Phase 5: PR Integration** - Create PRs at phase completion with auto-linking

## Phase Details

### v0.1.6 Claude Code Plugin

#### Phase 1: Plugin Distribution
**Goal**: Package and publish Kata as a Claude Code plugin for easy distribution using `/plugin-dev:create-plugin`
**Depends on**: v0.1.5 complete (Documentation)
**Requirements**: None (distribution improvement)
**Success Criteria** (what must be TRUE):
  1. Kata packaged as Claude Code plugin using plugin-dev workflow
  2. Kata published to @gannonh Claude Code plugin marketplace repository
  3. Plugin manifest (plugin.json) correctly configured
  4. All commands, agents, workflows available through plugin
  5. Installation via plugin system documented
**Plans**: TBD

Plans:
- [ ] 01-01: TBD (run /kata-planning-phases to break down)

### v0.1.7 GitHub Integration

#### Phase 1: Audit & Config Foundation
**Goal**: Understand where GitHub integration hooks into existing Kata workflows and establish config schema
**Depends on**: v0.1.6 complete (Plugin Distribution)
**Requirements**: WFA-01, CFG-01, CFG-02
**Success Criteria** (what must be TRUE):
  1. Integration points documented for new-milestone, execute-phase, execute-plan commands
  2. `.planning/config.json` includes `github.enabled` boolean toggle
  3. `.planning/config.json` includes `github.issueMode` with values `auto | ask | never`
  4. Kata commands read config and branch on `github.enabled`
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

#### Phase 2: Onboarding & Milestones
**Goal**: New projects can configure GitHub integration and milestones create corresponding GitHub Milestones
**Depends on**: Phase 1 (config schema exists)
**Requirements**: CFG-03, GHM-01, GHM-02
**Success Criteria** (what must be TRUE):
  1. `/kata:new-project` prompts for GitHub integration preferences
  2. Config choices saved to `.planning/config.json` during onboarding
  3. `/kata:new-milestone` creates GitHub Milestone when `github.enabled = true`
  4. GitHub Milestone includes version number and description from ROADMAP.md
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

#### Phase 3: Phase Issues
**Goal**: Phases become GitHub Issues with proper labels, metadata, and milestone assignment
**Depends on**: Phase 2 (milestones exist to assign issues to)
**Requirements**: GHI-01, GHI-02, GHI-03
**Success Criteria** (what must be TRUE):
  1. Phase issues created with `phase` label when milestone created
  2. Issue body includes phase goal and success criteria from ROADMAP.md
  3. Phase issues assigned to corresponding GitHub Milestone
  4. Issues created respecting `github.issueMode` config setting
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

#### Phase 4: Plan Sync
**Goal**: Phase issues track plan progress as checklist items that update during execution
**Depends on**: Phase 3 (phase issues exist)
**Requirements**: GHI-04, GHI-05, WFA-02
**Success Criteria** (what must be TRUE):
  1. Phase issue body includes checklist of plans (after `/kata:plan-phase`)
  2. Checklist items checked as each plan completes during `/kata:execute-phase`
  3. Execute-plan workflow conditionally updates GitHub issue
  4. Plan status visible in GitHub without opening Kata
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

#### Phase 5: PR Integration
**Goal**: Phase completion creates well-formed PRs that link to issues and follow conventions
**Depends on**: Phase 4 (issues exist to link to)
**Requirements**: GHP-01, GHP-02, GHP-03, GHP-04, WFA-03
**Success Criteria** (what must be TRUE):
  1. `/kata:execute-phase` creates PR when all plans complete (if `github.enabled`)
  2. PR body includes "Closes #X" linking to phase issue
  3. PR title follows convention: `Phase N: [Phase Name]`
  4. PR body includes summary from phase SUMMARY.md
  5. GitHub-specific templates exist for @file loading in workflows
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

| Phase                             | Milestone | Plans Complete | Status      | Completed  |
| --------------------------------- | --------- | -------------- | ----------- | ---------- |
| 0. Hard Fork & Rebrand            | v0.1.4    | 5/5            | Complete    | 2026-01-18 |
| 0-2. Skills & Documentation       | v0.1.5    | 30/30          | Complete    | 2026-01-22 |
| 1. Plugin Distribution            | v0.1.6    | 0/?            | Not planned | -          |
| 1. Audit & Config Foundation      | v0.1.7    | 0/?            | Not planned | -          |
| 2. Onboarding & Milestones        | v0.1.7    | 0/?            | Not started | -          |
| 3. Phase Issues                   | v0.1.7    | 0/?            | Not started | -          |
| 4. Plan Sync                      | v0.1.7    | 0/?            | Not started | -          |
| 5. PR Integration                 | v0.1.7    | 0/?            | Not started | -          |

---
*Roadmap created: 2026-01-18*
*Last updated: 2026-01-22 — v0.1.5 Skills & Documentation shipped*
