# research-worker (Project Reference)

The `research-worker` agent is defined globally at `~/.claude/agents/research-worker.md`.

This file exists as a reference and for project-specific overrides if needed.

## Global Agent Location

```
~/.claude/agents/research-worker.md
```

## Project-Specific Context

The global agent operates on this knowledge base:
- **Research Root:** `research/`
- **Project Research:** `research/projects/{project}/`
- **Template:** `research/_template.md`

## Integration Points

- **Jira:** Can read tasks, add comments, and transition issues
- **pmo-worker:** Receives research tasks, reports completion
- **Context7:** Library documentation lookup

## Overriding Behavior

To customize research-worker for this project specifically, you can:
1. Edit this file with full agent definition (frontmatter + body)
2. The project-level agent will take precedence over global

For now, the global definition is used.
