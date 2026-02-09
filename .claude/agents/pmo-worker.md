# pmo-worker (Project Reference)

The `pmo-worker` agent is defined globally at `~/.claude/agents/pmo-worker.md`.

This file exists as a reference and for project-specific overrides if needed.

## Global Agent Location

```
~/.claude/agents/pmo-worker.md
```

## Project-Specific Context

The global agent operates on this knowledge base:
- **PMO Root:** `operations/pmo/`
- **Epics:** `operations/pmo/epics/`
- **Tasks:** `operations/pmo/tasks/`
- **Weekly Plan:** `operations/pmo/weekly-plan.md`
- **Activity Log:** `operations/pmo/agent-activity.md`

## Overriding Behavior

To customize pmo-worker for this project specifically, you can:
1. Edit this file with full agent definition (frontmatter + body)
2. The project-level agent will take precedence over global

For now, the global definition is used.
