# GSD → Kata Gap Analysis

## Summary

- **GSD Commands:** 25 total
- **Kata Skills:** 10 total
- **GSD Agents:** 11 total
- **Kata Agents:** 11 total (all ported)

---

## GSD Commands → Kata Skills Mapping

| GSD Command                   | Kata Skill                                                 | Status    |
| ----------------------------- | ---------------------------------------------------------- | --------- |
| `/gsd:new-project`            | `kata-starting-new-projects`                               | ✅ Covered |
| `/gsd:new-milestone`          | `kata-manageing-milestones`                                | ✅ Covered |
| `/gsd:complete-milestone`     | `kata-manageing-milestones`                                | ✅ Covered |
| `/gsd:audit-milestone`        | `kata-manageing-milestones`                                | ✅ Covered |
| `/gsd:add-phase`              | `kata-managing-project-roadmap`                            | ✅ Covered |
| `/gsd:insert-phase`           | `kata-managing-project-roadmap`                            | ✅ Covered |
| `/gsd:remove-phase`           | `kata-managing-project-roadmap`                            | ✅ Covered |
| `/gsd:plan-milestone-gaps`    | `kata-managing-project-roadmap`                            | ✅ Covered |
| `/gsd:discuss-phase`          | `kata-discussing-phase-context`                            | ✅ Covered |
| `/gsd:research-phase`         | `kata-researching-phases`                                  | ✅ Covered |
| `/gsd:list-phase-assumptions` | `kata-researching-phases`                                  | ✅ Covered |
| `/gsd:plan-phase`             | `kata-planning-phases`                                     | ✅ Covered |
| `/gsd:execute-phase`          | `kata-executing-project-phases`                            | ✅ Covered |
| `/gsd:verify-work`            | `kata-verifying-work-outcomes-and-user-acceptance-testing` | ✅ Covered |
| `/gsd:progress`               | `kata-providing-progress-and-status-updates`               | ✅ Covered |
| `/gsd:pause-work`             | `kata-providing-progress-and-status-updates`               | ✅ Covered |
| `/gsd:resume-work`            | `kata-providing-progress-and-status-updates`               | ✅ Covered |
| `/gsd:map-codebase`           | `kata-providing-progress-and-status-updates`               | ✅ Covered |
| `/gsd:add-todo`               | `kata-managing-todos`                                      | ✅ Covered |
| `/gsd:check-todos`            | `kata-managing-todos`                                      | ✅ Covered |
| `/gsd:debug`                  | `kata-debugging-kata-workflow-issues`                      | ✅ Covered |
| `/gsd:help`                   | ❌ **No skill**                                             | ⚠️ **GAP** |
| `/gsd:quick`                  | ❌ **No skill**                                             | ⚠️ **GAP** |
| `/gsd:update`                 | ❌ **No skill**                                             | ⚠️ **GAP** |
| `/gsd:whats-new`              | ❌ **No skill**                                             | ⚠️ **GAP** |

---

## GSD Agents → Kata Agents Mapping

| GSD Agent                  | Kata Agent                            | Status             |
| -------------------------- | ------------------------------------- | ------------------ |
| `gsd-codebase-mapper`      | `kata-codebase-mapper`                | ✅ Ported           |
| `gsd-debugger`             | `kata-debugger`                       | ✅ Ported           |
| `gsd-executor`             | `kata-executor`                       | ✅ Ported           |
| `gsd-integration-checker`  | `kata-integration-checker`            | ✅ Ported           |
| `gsd-phase-researcher`     | `kata-phase-researcher`               | ✅ Ported           |
| `gsd-plan-checker`         | `kata-plan-checker`                   | ✅ Ported           |
| `gsd-planner`              | `kata-planner`                        | ✅ Ported           |
| `gsd-project-researcher`   | `kata-project-researcher`             | ✅ Ported           |
| `gsd-research-synthesizer` | `kata-researching-phases-synthesizer` | ✅ Ported (renamed) |
| `gsd-roadmapper`           | `kata-roadmapper`                     | ✅ Ported           |
| `gsd-verifier`             | `kata-verifier`                       | ✅ Ported           |

---

## Gap Analysis

### Commands with No Kata Skill (4 Gaps)

| GSD Command      | Purpose                                                         | Recommendation                                                |
| ---------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| `/gsd:help`      | Show available commands and usage guide                         | Create `kata-help` skill OR rely on Claude's built-in `/help` |
| `/gsd:quick`     | Execute quick task with GSD guarantees but skip optional agents | Create `kata-quick-tasks` skill                               |
| `/gsd:update`    | Update to latest version with changelog display                 | Create `kata-updating-framework` skill                        |
| `/gsd:whats-new` | Show changelog since installed version                          | Merge into `kata-updating-framework` skill                    |

### Analysis by Priority

**Low Priority Gaps:**
- `help` - Built-in `/help` may suffice; CLAUDE.md provides project-specific guidance
- `update` / `whats-new` - Version management utilities; could be combined into one skill

**Medium Priority Gaps:**
- `quick` - Useful for small tasks that need atomic commits but skip research/verification overhead

---

## Coverage Summary

| Category            | GSD Commands | Kata Coverage |
| ------------------- | ------------ | ------------- |
| Project Init        | 1            | ✅ 100%        |
| Milestones          | 3            | ✅ 100%        |
| Roadmap/Phases      | 4            | ✅ 100%        |
| Research/Discussion | 3            | ✅ 100%        |
| Planning            | 1            | ✅ 100%        |
| Execution           | 1            | ✅ 100%        |
| Verification        | 1            | ✅ 100%        |
| Progress/Session    | 4            | ✅ 100%        |
| Todos               | 2            | ✅ 100%        |
| Debug               | 1            | ✅ 100%        |
| **Utilities**       | **4**        | ❌ **0%**      |

**Total: 21/25 commands covered (84%)**

---

## Agents Summary

**All 11 agents ported successfully (100%)**

Key changes during port:
- Namespace: `gsd-*` → `kata-*`
- Command references: `/gsd:*` → `/kata:*` or skill-based invocation
- One rename: `gsd-research-synthesizer` → `kata-researching-phases-synthesizer`
