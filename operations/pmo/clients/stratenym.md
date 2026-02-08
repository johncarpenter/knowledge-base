---
client: Stratenym
jira_project: STRAT
harvest_project: 44051994
zoho_project:
status: active
priority: Low
target_hours_week: 5
---

# Stratenym

## Overview

Searchable AI Library project. Budget: 120 hours.

## Current Status

**Priority:** Low
**Target Hours/Week:** 5

## Active Tasks

```dataview
TABLE WITHOUT ID
  key as "Key",
  summary as "Summary",
  status as "Status",
  priority as "Priority"
FROM "operations/pmo/tasks"
WHERE project = "STRAT" AND status != "Done" AND status != "Closed"
SORT priority DESC, updated DESC
```

## Recent Activity

```dataview
TABLE WITHOUT ID
  key as "Key",
  summary as "Summary",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE project = "STRAT"
SORT updated DESC
LIMIT 5
```

## Notes

_Ongoing notes, decisions, context._

## Links

- Jira: [STRAT](https://2linessoftware.atlassian.net/browse/STRAT)
- Harvest Project: 44051994
