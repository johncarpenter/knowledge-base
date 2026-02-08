---
description: Show PMO dashboard with cross-project status
---

# PMO Dashboard

Display a real-time cross-project status overview by querying Jira directly.

**Usage:** `/pmo [focus]`

**Examples:**
- `/pmo` - Full dashboard
- `/pmo high` - Only high priority items
- `/pmo CIR` - Focus on Circuit project
- `/pmo blocked` - Show blocked/stalled items

## Process

### 1. Query All Projects

Use `mcp__jira__jira_search` for each project or a combined query:

```
jql: "status != Done AND status != Closed ORDER BY priority DESC, updated DESC"
fields: "summary,status,priority,assignee,updated,duedate,project"
limit: 50
```

### 2. Group and Summarize

Organize issues by project and priority.

### 3. Display Dashboard

Output a formatted dashboard:

```markdown
# PMO Dashboard
**Generated:** 2026-02-08 14:30

## Summary

| Project | Open | High Priority | Due This Week |
|---------|------|---------------|---------------|
| CIR | 8 | 2 | 1 |
| JOT | 3 | 0 | 0 |
| ZANE | 2 | 1 | 0 |
| **Total** | **13** | **3** | **1** |

## High Priority Items

| Key | Summary | Project | Status | Due |
|-----|---------|---------|--------|-----|
| CIR-45 | Fix auth bug | Circuit | In Progress | Feb 10 |
| ZANE-12 | Deploy hotfix | Zane | To Do | Feb 9 |

## Recently Updated (Last 3 Days)

| Key | Summary | Project | Status | Updated |
|-----|---------|---------|--------|---------|
| CIR-48 | Add dashboard | Circuit | In Progress | 2h ago |
| JOT-15 | Update docs | JOT | Done | 1d ago |

## Stalled (No Update in 7+ Days)

| Key | Summary | Project | Last Updated |
|-----|---------|---------|--------------|
| PAC-3 | API design | Pacwest | Feb 1 |

## Quick Actions

- `/pmo-sync` - Refresh local task cache
- `/weekly-plan` - Plan the week
- `/jira CIR: ...` - Create new task
```

### 4. Handle Focus Filters

If `$ARGUMENTS` provided:
- `high` - Only show High priority section
- `{PROJECT}` - Filter to single project
- `blocked` - Show items with no updates in 7+ days
- `due` - Show items due within 7 days

## Notes

- This queries Jira live (no local cache)
- For Dataview queries in Obsidian, run `/pmo-sync` first
- Links to Jira issues: `https://2linessoftware.atlassian.net/browse/{KEY}`
