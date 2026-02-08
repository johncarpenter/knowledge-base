---
client: ClientName
jira_project: KEY
harvest_project: 00000000
zoho_project: 00000000000000000
status: active
priority: Medium
target_hours_week: 10
---

# {{client}}

## Overview

_Brief description of current engagement and scope._

## Current Status

**Priority:** {{priority}}
**Target Hours/Week:** {{target_hours_week}}

## Active Tasks

```dataview
TABLE WITHOUT ID
  key as "Key",
  summary as "Summary",
  status as "Status",
  priority as "Priority"
FROM "operations/pmo/tasks"
WHERE project = this.jira_project AND status != "Done" AND status != "Closed"
SORT priority DESC, updated DESC
```

## Recent Activity

```dataview
TABLE WITHOUT ID
  key as "Key",
  summary as "Summary",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE project = this.jira_project
SORT updated DESC
LIMIT 5
```

## Notes

_Ongoing notes, decisions, context._

## Links

- Jira: [{{jira_project}}](https://2linessoftware.atlassian.net/browse/{{jira_project}})
- Harvest: Project ID {{harvest_project}}
