# Tasks by Priority

All open tasks organized by priority level.

---

## High Priority

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  status as "Status",
  due as "Due"
FROM "operations/pmo/tasks"
WHERE priority = "High" AND status != "Done" AND status != "Closed"
SORT due ASC, project ASC
```

---

## Medium Priority

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE priority = "Medium" AND status != "Done" AND status != "Closed"
SORT project ASC, updated DESC
```

---

## Low Priority

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE priority = "Low" AND status != "Done" AND status != "Closed"
SORT project ASC, updated DESC
```
