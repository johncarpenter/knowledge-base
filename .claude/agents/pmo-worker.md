---
name: pmo-worker
---

# pmo-worker (Project Reference)

The `pmo-worker` agent is defined globally at `~/.claude/agents/pmo-worker.md`.

This file exists as a reference and for project-specific context.

## Global Agent Location

```
~/.claude/agents/pmo-worker.md
```

## Project-Specific Context

The global agent operates on this knowledge base:

| Location | Purpose |
|----------|---------|
| `operations/pmo/weekly-plan.md` | **Primary** - Weekly Epic focus and tasks |
| `operations/pmo/epics/` | Epic files synced from Jira |
| `operations/pmo/tasks/` | Task files synced from Jira |
| `operations/pmo/clients/` | Client-specific dashboards |
| `operations/pmo/agent-activity.md` | Agent coordination log |
| `operations/pmo/INDEX.md` | Dashboard with Dataview queries |

## Key Workflows

### Weekly Planning
- **New week:** Use `/weekly-plan` for interactive Epic/task selection
- **Mid-week:** Direct edit `weekly-plan.md` for priority changes
- **Review:** Use `/weekly-plan review` to check progress

### Common Mid-Week Updates
```markdown
# Reprioritize - move Epic to top
Edit Epic Focus table, renumber priorities

# Add urgent Epic
Insert at priority 1, shift others down

# Pause an Epic
Remove from Epic Focus, add note explaining why

# Complete a task
Change `- [ ]` to `- [x]` in Tasks This Week
```

## Client Projects

| Client | Jira Key | Notes |
|--------|----------|-------|
| Circuit | CIR | POS/Instacart reconciliation |
| Pacwest | PAC | Financial dashboards |
| JOT Digital | JOT | Multi-client (ACS, Suncorp, Concrete) |
| Zane | ZANE | FinTech MVP |
| 2Lines | PER | Internal operations |

## Overriding Behavior

To customize pmo-worker for this project specifically:
1. Edit this file with full agent definition (frontmatter + body)
2. The project-level agent will take precedence over global

For now, the global definition is used.
