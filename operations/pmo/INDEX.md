# PMO Dashboard

Epic-focused view of all active work. Prioritize Epics, execute Tasks.

**Last Sync:** `= this.file.mtime`

## Quick Actions

- `/pmo-sync` - Refresh data from Jira
- `/weekly-plan` - Plan the current week
- `/capacity` - View hours by client

---

## Epics by Priority

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Epic",
  summary as "Summary",
  project as "Project",
  priority as "Priority",
  status as "Status"
FROM "operations/pmo/epics"
SORT priority DESC, project ASC
```

---

## Active Epics by Project

### Circuit (CIR)

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Epic",
  summary as "Summary",
  priority as "Pri",
  length(filter(this.file.tasks, (t) => t.completed)) + "/" + length(this.file.tasks) as "Progress"
FROM "operations/pmo/epics"
WHERE project = "CIR" AND status != "Done"
SORT priority DESC
```

### Pacwest (PAC)

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Epic",
  summary as "Summary",
  priority as "Pri"
FROM "operations/pmo/epics"
WHERE project = "PAC" AND status != "Done"
SORT priority DESC
```

---

## This Week's Focus

![[weekly-plan#Current Week]]

---

## Tasks In Progress

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  epic as "Epic"
FROM "operations/pmo/tasks"
WHERE status = "In Progress"
SORT updated DESC
```

---

## Unassigned Tasks (No Epic)

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project"
FROM "operations/pmo/tasks"
WHERE (epic = "" OR epic = null) AND status != "Done" AND status != "Closed"
SORT project ASC, key ASC
```

---

## Recently Completed

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project"
FROM "operations/pmo/tasks"
WHERE status = "Done" OR status = "Closed"
SORT updated DESC
LIMIT 5
```

---

## Client Pages

```dataview
TABLE WITHOUT ID
  file.link as "Client",
  jira_project as "Jira",
  target_hours_week + "h" as "Target/Week",
  priority as "Priority"
FROM "operations/pmo/clients"
WHERE file.name != "_template"
SORT priority DESC, file.name ASC
```

---

## All Views

- [[by-status|Tasks by Status]]
- [[by-priority|Tasks by Priority]]
- [[due-soon|Due Soon]]
- [[epics|All Epics]]
