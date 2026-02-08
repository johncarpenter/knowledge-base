---
client: JOT Digital
jira_project: JOT
harvest_project: 44410793
zoho_project: 12550000000075369
status: active
priority: Low
target_hours_week: 8
---

# JOT Digital (Internal)

## Overview

Internal JOT work - admin, sales, client development.

## Current Status

**Priority:** Low
**Target Hours/Week:** 8 (non-billable)

---

## Active Tasks

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE project = "JOT" AND status != "Done" AND status != "Closed"
SORT key ASC
```

---

## Notes

- Admin: `/jotadmin` - Meetings and Overhead
- Sales: `/jotsales` - Business development, proposals

---

## Links

- [Jira Board](https://2linessoftware.atlassian.net/browse/JOT)
- Harvest Project: 44410793
- Zoho Project: 12550000000075369
