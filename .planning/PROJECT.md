# Kata

## What This Is

A spec-driven development framework for Claude Code. Brings structured, reliable AI development to teams without changing their existing tools. Teams use Kata's quality-producing process inside the tools they already love.

**Current state:** v0.1.4 shipped — hard fork complete, independent identity established. Starting v0.1.5 GitHub Integration.

## Core Value

Teams get reliable AI-driven development without abandoning their existing GitHub workflow. Kata is additive — no convincing the boss, no workflow changes, just better outcomes.

## Requirements

### Validated

- Hard fork from upstream — v0.1.4 (independent identity, gannonh/kata)

### Active (v0.1.5 GitHub Integration)

- [ ] Config-driven integration — enable/disable via .planning/config.json
- [ ] GitHub Milestone creation — new-milestone creates GH Milestone
- [ ] Phase issue creation — phases become GitHub Issues with `phase` label
- [ ] Plan checklist sync — plans shown as checklist items in phase issues
- [ ] PR creation at phase completion — execute-phase creates PR, auto-links with "Closes #X"
- [ ] Workflow audit — document integration points in existing Kata workflows

### Out of Scope

**Deferred to later milestones:**
- VS Code adapter — prove pattern in Claude Code first
- IDE Adapters (Cursor, Antigravity) — after VS Code
- Other integrations (Linear, Jira) — after GitHub proves pattern
- GitHub Project boards — later GitHub phase
- GitHub Actions/CI integration — later GitHub phase
- Native PR reviews (Claude reviews PRs) — later GitHub phase
- PR comment response — later GitHub phase

**Not building:**
- Building an IDE — coordination layer only, use existing tools
- Building an LLM — use Claude, not compete with it
- Building an agent framework — use platform-native capabilities (subagents, Skills, MCPs)

## Context

**v0.1.4 shipped (2026-01-18):**
- 130 files modified, ~68k LOC (md, js, json, sh)
- Tech stack: Node.js installer, Claude Code slash commands, markdown workflows
- Complete rebrand from GSD to Kata with gannonh/kata identity

**Fork rationale:**
- Original GSD was firmly solo-dev focused
- Our vision diverged significantly toward team workflows
- Hard fork allows independent evolution without upstream constraints
- Clean break enables rebranding and architectural changes

**Market opportunity:**
- Teams adopting AI coding tools (Copilot, etc.) get inconsistent, low-quality output
- Code falls apart at scale — "vibecoding" has a bad reputation
- Kata solves this through context engineering — describe idea, system extracts what it needs
- CodeRabbit and similar tools show market demand for AI PR reviews
- Kata does reviews better (full context from requirements/research/plans, not just diff)

**Technical foundation:**
- User has proven Kata works in VS Code with bash scripts — needs productization
- Existing PR skills (pr-create, pr-review, pr-merge) demonstrate the workflow
- Industry aligning on standards: Agent Skills, MCP (now in Linux Foundation)
- Philosophy: use native platform capabilities, don't build abstraction layers that break

**Target users:**
- Small-medium teams using GitHub (maybe with Linear)
- Standardized on VS Code with Copilot
- Established PR-based workflow with some customization
- Frustrated with AI code quality issues
- Don't want to change their tooling

## Constraints

- **Architecture**: Hard fork — independent codebase, no upstream dependencies
- **Platform integration**: Use native capabilities (Skills/MCPs for VS Code, not custom abstraction)
- **Standards alignment**: Follow emerging standards (Agent Skills, MCP)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ~~Start as extension, not hard fork~~ | ~~Maximize leverage of upstream velocity~~ | Superseded |
| **Hard fork and rebrand** | Vision diverged significantly; clean break enables independent evolution | Good — v0.1.4 |
| GitHub integration first | Prove integration pattern before IDE adapters | — Pending |
| Config-driven integrations | Modular, can enable/disable without affecting core Kata | — Pending |
| Phase-level PRs | One PR per phase (not per plan) — complete reviewable units | — Pending |
| Kata Milestone → GH Milestone | Use GitHub's native feature for version tracking | — Pending |
| Phase → Issue, Plan → Checklist | Right granularity — phases are coordination unit, plans are execution detail | — Pending |

## Current Milestone: v0.1.5 GitHub Integration

**Goal:** Optional, modular GitHub integration layer enabling seamless integration with Issues, PRs, and Milestones

**Target features:**
- Config-driven enable/disable via .planning/config.json
- GitHub Milestone creation during /kata:new-milestone
- Phase issues with plans as checklist items
- PR creation at phase completion with auto-linking

**Approach:**
- Audit existing workflows for integration points
- Add conditional branches following existing Kata patterns
- Use @file references for GitHub-specific templates

---
*Last updated: 2026-01-18 — starting v0.1.5 milestone*
