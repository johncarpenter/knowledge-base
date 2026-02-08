---
description: Sync Jira Epics and issues to local markdown for PMO views
---

# PMO Sync

Synchronize Epics and active Jira issues across all projects to local markdown files.

**Usage:** `/pmo-sync [options]`

**Examples:**
- `/pmo-sync` - Sync all Epics and active issues
- `/pmo-sync CIR` - Sync only Circuit project
- `/pmo-sync --full` - Include closed issues from last 30 days
- `/pmo-sync --epics-only` - Sync only Epics (faster)

## Process

### 1. Determine Scope

Parse `$ARGUMENTS`:
- No args: Sync all projects (CIR, JOT, PAC, PER, RUN, STRAT, ZANE)
- Project key: Sync only that project
- `--full`: Include recently closed issues
- `--epics-only`: Skip task sync, only sync Epics

### 2. Sync Epics First

For each project, use `mcp__jira__jira_search`:

```
jql: "project = {KEY} AND issuetype = Epic AND status != Done"
fields: "summary,status,priority,description,created,updated,labels"
limit: 50
```

For each Epic, create or update `operations/pmo/epics/{KEY}.md`:

```markdown
---
key: CIR-13
project: CIR
summary: AI & Chat Features
status: In Progress
priority: High
type: Epic
jira_url: https://2linessoftware.atlassian.net/browse/CIR-13
synced: 2026-02-08
---

# CIR-13: AI & Chat Features

## Description

{description from Jira}

## Child Tasks

\```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE epic = "CIR-13"
SORT key ASC
\```

## Local Notes

_Add context, decisions, blockers here._
```

### 3. Fetch Tasks from Jira

For each project, use `mcp__jira__jira_search`:

```
jql: "project = {KEY} AND issuetype != Epic AND (status != Done OR updated >= -30d)"
fields: "summary,status,priority,assignee,created,updated,duedate,issuetype,parent,labels"
limit: 50
```

**Important:** Exclude Epics from task sync (they go in `epics/` directory).

### 4. Map Priority

Convert Jira priority to simple High/Medium/Low:
- Highest, High → High
- Medium → Medium
- Low, Lowest → Low
- (none) → Medium

### 5. Extract Epic Link

For each task, check the `parent` field:
- If parent exists and parent issuetype = Epic → set `epic` field to parent key
- Otherwise → leave `epic` empty

### 6. Create/Update Task Markdown Files

For each issue, create or update `operations/pmo/tasks/{KEY}.md`:

```markdown
---
key: CIR-123
project: CIR
summary: Task summary here
status: In Progress
priority: High
assignee: john
type: Task
created: 2026-02-01
updated: 2026-02-08
due: 2026-02-15
epic: CIR-100
labels: [frontend, urgent]
jira_url: https://2linessoftware.atlassian.net/browse/CIR-123
synced: 2026-02-08T14:30:00
---

# CIR-123: Task summary here

## Description

{description from Jira, converted to markdown}

## Local Notes

_Add context, decisions, blockers here._
```

### 7. Clean Up Stale Files

For issues that are Done/Closed and older than 30 days:
- Move to `operations/pmo/tasks/archive/` (optional, or just delete)

### 8. Output Summary

```markdown
## PMO Sync Complete

**Synced:** 2026-02-08 14:30

### Epics

| Project | Active | Total |
|---------|--------|-------|
| CIR | 4 | 5 |
| PAC | 2 | 3 |
| ... | | |

### Tasks

| Project | Open | In Progress | Done (30d) | Total |
|---------|------|-------------|------------|-------|
| CIR | 5 | 3 | 2 | 10 |
| JOT | 2 | 1 | 0 | 3 |
| ... | | | | |

**Epics Synced:** 8
**Tasks Synced:** 31
**Files Removed:** 2

Next: Open `operations/pmo/INDEX.md` in Obsidian to view dashboard.
```

## Implementation Notes

- Use `mcp__jira__jira_search` for querying
- Sync Epics FIRST, then Tasks (so epic links are accurate)
- Check if file exists before writing (preserve Local Notes section)
- Frontmatter must be valid YAML for Dataview
- Date fields should be YYYY-MM-DD format
- `synced` field tracks when this file was last updated from Jira
- Epic files go in `operations/pmo/epics/`
- Task files go in `operations/pmo/tasks/`
- Task `epic` field must match Epic `key` field for Dataview queries
