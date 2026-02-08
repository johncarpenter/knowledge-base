---
client: Circuit
jira_project: CIR
harvest_project: 44917453
zoho_project:
status: active
priority: High
target_hours_week: 20
---

# Circuit

## Overview

Circuit MVP development. Primary active project.

## Current Status

**Priority:** High
**Target Hours/Week:** 20

---

## Epics

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Epic",
  summary as "Summary",
  priority as "Priority",
  status as "Status"
FROM "operations/pmo/epics"
WHERE project = "CIR"
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
WHERE project = "CIR" AND status != "Done" AND status != "Closed"
SORT epic ASC, key ASC
```

---

## Notes

_Ongoing notes, decisions, context._

---

## Links

- [Jira Board](https://2linessoftware.atlassian.net/browse/CIR)
- Harvest Project: 44917453
