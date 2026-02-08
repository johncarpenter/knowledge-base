# All Epics

Complete list of Epics across all projects.

---

## High Priority

```dataview
TABLE WITHOUT ID
  "[[epics/" + key + "|" + key + "]]" as "Epic",
  summary as "Summary",
  project as "Project",
  status as "Status"
FROM "operations/pmo/epics"
WHERE priority = "High" AND status != "Done"
SORT project ASC, key ASC
```

---

## Medium Priority

```dataview
TABLE WITHOUT ID
  "[[epics/" + key + "|" + key + "]]" as "Epic",
  summary as "Summary",
  project as "Project",
  status as "Status"
FROM "operations/pmo/epics"
WHERE priority = "Medium" AND status != "Done"
SORT project ASC, key ASC
```

---

## Low Priority

```dataview
TABLE WITHOUT ID
  "[[epics/" + key + "|" + key + "]]" as "Epic",
  summary as "Summary",
  project as "Project",
  status as "Status"
FROM "operations/pmo/epics"
WHERE priority = "Low" AND status != "Done"
SORT project ASC, key ASC
```

---

## Completed Epics

```dataview
TABLE WITHOUT ID
  "[[epics/" + key + "|" + key + "]]" as "Epic",
  summary as "Summary",
  project as "Project"
FROM "operations/pmo/epics"
WHERE status = "Done"
SORT project ASC, key ASC
```

---

## Epic Task Counts

```dataview
TABLE WITHOUT ID
  epic as "Epic",
  length(rows) as "Tasks",
  length(filter(rows, (r) => r.status = "Done")) as "Done",
  length(filter(rows, (r) => r.status = "In Progress")) as "In Progress",
  length(filter(rows, (r) => r.status = "To Do")) as "To Do"
FROM "operations/pmo/tasks"
WHERE epic != "" AND epic != null
GROUP BY epic
SORT epic ASC
```
