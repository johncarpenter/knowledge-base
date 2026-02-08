---
key: CIR-4
project: CIR
summary: "Cancel Fivetran for 5 days"
status: To Do
priority: Medium
assignee: Unassigned
type: Task
created: 2025-11-28
updated: 2025-11-28
due:
epic:
labels: []
jira_url: https://2linessoftware.atlassian.net/browse/CIR-4
synced: 2026-02-08T13:20:00-07:00
---

# CIR-4: Cancel Fivetran for 5 days

## Description

### Overview

Temporarily pause or disable Fivetran data sync connectors for a 5-day period. This may be needed for maintenance, cost management, data migration activities, or to prevent sync conflicts during system changes.

### Tasks

- Identify all active Fivetran connectors that need to be paused
- Document current sync schedules and configurations before pausing
- Pause/disable the relevant Fivetran connectors
- Set a reminder to re-enable after 5 days
- Communicate the pause to relevant stakeholders
- Re-enable connectors after the 5-day period
- Verify data sync resumes correctly

### Important Details

- **Duration**: 5 days
- **Action**: Pause syncs (not delete connectors)
- **Re-enable Date**: 5 days from pause date

### Acceptance Criteria

- [ ] All relevant Fivetran connectors identified
- [ ] Connectors paused successfully
- [ ] Team notified of the pause window
- [ ] Calendar reminder set for re-enablement
- [ ] Connectors re-enabled after 5 days
- [ ] Data sync verified working after re-enablement

### Notes

- Ensure no critical business processes depend on real-time data during this period
- Document any data gaps that may need backfilling after re-enablement
- Consider running a manual sync before pausing to ensure data is current

## Local Notes

_Add context, decisions, blockers here._
