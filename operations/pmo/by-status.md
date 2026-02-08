# Tasks by Status

Kanban-style view of all tasks grouped by status.

---

## To Do

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  priority as "Pri"
FROM "operations/pmo/tasks"
WHERE status = "To Do"
SORT priority DESC, project ASC
```

---

## In Progress

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  priority as "Pri"
FROM "operations/pmo/tasks"
WHERE status = "In Progress"
SORT priority DESC, updated DESC
```

---

## Done (Last 30 Days)

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  updated as "Completed"
FROM "operations/pmo/tasks"
WHERE (status = "Done" OR status = "Closed") AND date(updated) > date(today) - dur(30 days)
SORT updated DESC
LIMIT 20
```
