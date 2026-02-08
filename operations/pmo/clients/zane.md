---
client: Zane
jira_project: ZANE
harvest_project: 45810822
zoho_project:
status: active
priority: Medium
target_hours_week: 5
---

# Zane

## Overview

Contract development work.

## Current Status

**Priority:** Medium
**Target Hours/Week:** 5

## Active Tasks

```dataview
TABLE WITHOUT ID
  key as "Key",
  summary as "Summary",
  status as "Status",
  priority as "Priority"
FROM "operations/pmo/tasks"
WHERE project = "ZANE" AND status != "Done" AND status != "Closed"
SORT priority DESC, updated DESC
```

## Recent Activity

```dataview
TABLE WITHOUT ID
  key as "Key",
  summary as "Summary",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE project = "ZANE"
SORT updated DESC
LIMIT 5
```

## Notes

_Ongoing notes, decisions, context._

## Links

- Jira: [ZANE](https://2linessoftware.atlassian.net/browse/ZANE)
- Harvest Project: 45810822
