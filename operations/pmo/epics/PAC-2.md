---
key: PAC-2
project: PAC
summary: "Create dashboards for financial"
status: To Do
priority: High
type: Epic
jira_url: https://2linessoftware.atlassian.net/browse/PAC-2
synced: 2026-02-08T16:27:14-07:00
---

# PAC-2: Create dashboards for financial

Design and implement financial dashboards in Metabase for visualization and analysis of financial data. Includes P&L statements, balance sheets, aged AR reports, and key financial metrics.

## Child Tasks

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE epic = "PAC-2"
SORT key ASC
```

## Notes

_Strategic notes, decisions, blockers for this epic._
