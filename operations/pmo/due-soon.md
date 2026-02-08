# Due Soon

Tasks with upcoming deadlines.

---

## Overdue

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  due as "Due",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE due != "" AND date(due) < date(today) AND status != "Done" AND status != "Closed"
SORT due ASC
```

---

## Due This Week

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  due as "Due",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE due != "" AND date(due) >= date(today) AND date(due) <= date(today) + dur(7 days) AND status != "Done" AND status != "Closed"
SORT due ASC
```

---

## Due Next Week

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  due as "Due",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE due != "" AND date(due) > date(today) + dur(7 days) AND date(due) <= date(today) + dur(14 days) AND status != "Done" AND status != "Closed"
SORT due ASC
```

---

## No Due Date

```dataview
TABLE WITHOUT ID
  "[[" + file.name + "|" + key + "]]" as "Key",
  summary as "Summary",
  project as "Project",
  priority as "Pri",
  status as "Status"
FROM "operations/pmo/tasks"
WHERE (due = "" OR due = null) AND status != "Done" AND status != "Closed"
SORT priority DESC, project ASC
```
