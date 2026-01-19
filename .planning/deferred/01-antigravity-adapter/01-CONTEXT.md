# Phase 01: Antigravity Adapter - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Adapter layer to make Kata run within Antigravity IDE. This phase focuses on **capabilities** — getting Kata workflows to function as close to the Claude Code experience as possible, given Antigravity's different feature set.

**Out of scope for this phase:**
- Installation mechanisms (npm, git clone, etc.)
- Update mechanisms
- Publishing/distribution

</domain>

<decisions>
## Implementation Decisions

### Subagent Simulation
- **Pattern:** Single-agent sequential execution with explicit workflow chaining
- Antigravity has no Task tool — cannot spawn true subagents
- Orchestrator workflow does its work, then ends with explicit "next step" guidance
- User manually triggers next workflow in same chat or new chat
- Chained workflows should verify they were invoked correctly (check expected files exist)

### Parallelization
- **Default:** Sequential execution
- **At checkpoints:** User can choose to run parallel tasks in separate chat windows
- **Configurable:** Project-level setting during setup (`parallelization: ask | parallel | sequential`)
- When parallel: Orchestrator tells user "Open new chat, run `/kata:execute-plan 02-02`"
- Completion detection: Orchestrator checks for SUMMARY.md files when user returns
- If a parallel branch fails: User communicates back, orchestrator handles

### Context Management
- **Pattern:** Same as CC — workflow completes with clear "Next Up" guidance
- Antigravity has no `/clear` command — guidance is "Open new chat and run..."
- All major workflow completions should suggest new chat for fresh context
- Keep CC format for next steps (consistency across adapters)

### Checkpoint Continuity
- **Inline (A):** For simple checkpoints where user responds immediately
- **File-based (B):** For complex work or when context is full
- Checkpoint files live in phase directory: `.planning/phases/XX-name/CHECKPOINT.md`
- Should survive user closing chat and resuming later
- `/kata:resume` workflow reads checkpoint file and continues

### Claude's Discretion
- Exact command format for workflow chaining
- Whether to validate invocation order
- Status workflow for showing user's position in chain
- Context usage tracking and warnings
- Checkpoint expiration logic (if any)
- Quick reference format for Antigravity users

</decisions>

<specifics>
## Specific Context

### Platform Mapping

| Claude Code           | Antigravity   | Kata Adapter Approach                          |
| --------------------- | ------------- | ---------------------------------------------- |
| SlashCommands         | Workflows     | 1:1 mapping                                    |
| Custom Agents         | No equivalent | Inline in workflows OR separate workflow files |
| Task tool (subagents) | Not available | Sequential + workflow chaining                 |
| `/clear`              | Not available | "Open new chat" guidance                       |
| @ file references     | Supported     | Same syntax works                              |
| Hooks                 | No equivalent | Not supported initially                        |

### Current State
- User has a working sync script (`~/.claude/scripts/sync-antigravity.sh`) that copies skills and symlinks commands as proof-of-concept
- Kata is currently running in Antigravity via this sync (this conversation is proof)
- Agents are synced as workflow files with `agent-` prefix — works as context injection

### Key Insight
> "Antigravity has no equivalent for custom subagents. However, all of these are really just forms of context."

The sync script proves that agent files work as workflows because they're just structured prompts. The adapter doesn't need to replicate the Task tool — it needs to replicate the **outcomes** (isolated execution, parallelization option, checkpoint handling).

</specifics>

<deferred>
## Deferred Ideas

### System Bucket (Future Phase)
- Installation flow (how users get Kata in Antigravity)
- Update mechanism (how users get new versions)
- Sync approach (manual script vs. npm install vs. auto-detect)
- Publishing/distribution strategy

These belong in a separate "System" phase after capabilities are proven.

</deferred>

---

*Phase: 01-antigravity-adapter*
*Context gathered: 2026-01-18*
