---
key: PAC-1
project: PAC
summary: "Create Datalake to ingest financial documents"
status: To Do
priority: Medium
type: Epic
jira_url: https://2linessoftware.atlassian.net/browse/PAC-1
synced: 2026-02-08
---

# PAC-1: Create Datalake to ingest financial documents

Set up data lake infrastructure to ingest and process financial documents from various sources. This includes configuring GCS buckets, Cloud Functions for processing, and BigQuery integration for structured data storage.

## Child Tasks

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE epic = "PAC-1"
SORT key ASC
```

## Notes

_Strategic notes, decisions, blockers for this epic._
