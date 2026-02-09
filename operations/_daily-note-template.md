# Daily Note: {{date:YYYY-MM-DD}}

**Week:** W{{date:ww}} | **Day:** {{date:dddd}}

---

## Daily Digest

![[{{date:YYYY-MM-DD}}-daily-digest]]

---

## Today's Meetings

```dataview
TABLE WITHOUT ID
  link(file.path, regexreplace(file.name, "^\d{4}-\d{2}-\d{2}-", "")) as "Meeting",
  dateformat(date(regexreplace(file.name, "-.*$", "")), "HH:mm") as "Time"
FROM "operations/meetings"
WHERE file.name STARTSWITH "{{date:YYYY-MM-DD}}"
SORT file.name ASC
```

### Meeting Notes

```dataview
LIST
FROM "operations/meetings"
WHERE file.name STARTSWITH "{{date:YYYY-MM-DD}}"
SORT file.name ASC
```

---

## Quick Notes

-

---

## End of Day Review

- [ ] Meetings backed up (`/meeting-backup`)
- [ ] Action items captured
- [ ] Tomorrow's priorities identified

---

*Tags: #daily-note #{{date:YYYY-MM-DD}}*
