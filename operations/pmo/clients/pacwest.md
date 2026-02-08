---
client: Pacwest
jira_project: PAC
harvest_project:
zoho_project:
status: active
priority: Medium
target_hours_week: 10
---

# Pacwest

## Overview

Data analytics and dashboards for Pacwest.

## Current Status

**Priority:** Medium
**Target Hours/Week:** 10

---

## Epics

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Epic",
  summary as "Summary",
  priority as "Priority",
  status as "Status"
FROM "operations/pmo/epics"
WHERE project = "PAC"
SORT priority DESC
```

---

## Active Tasks

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  epic as "Epic",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE project = "PAC" AND status != "Done" AND status != "Closed"
SORT epic ASC, key ASC
```

---

## Notes

_Ongoing notes, decisions, context._

---

## Links

- [Jira Board](https://2linessoftware.atlassian.net/browse/PAC)
