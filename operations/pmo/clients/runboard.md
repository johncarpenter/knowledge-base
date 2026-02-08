---
client: Runboard 2.0
jira_project: RUN
harvest_project:
zoho_project:
status: active
priority: Low
target_hours_week: 0
---

# Runboard 2.0

## Overview

_Add engagement description._

## Current Status

**Priority:** Low
**Target Hours/Week:** TBD

## Active Tasks

```dataview
TABLE WITHOUT ID
  key as "Key",
  summary as "Summary",
  status as "Status",
  priority as "Priority"
FROM "operations/pmo/tasks"
WHERE project = "RUN" AND status != "Done" AND status != "Closed"
SORT priority DESC, updated DESC
```

## Recent Activity

```dataview
TABLE WITHOUT ID
  key as "Key",
  summary as "Summary",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE project = "RUN"
SORT updated DESC
LIMIT 5
```

## Notes

_Ongoing notes, decisions, context._

## Links

- Jira: [RUN](https://2linessoftware.atlassian.net/browse/RUN)
