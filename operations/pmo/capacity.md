# Capacity Overview

Weekly hours allocation and actuals per client.

## Target Allocations

| Client | Target Hours/Week | Notes |
|--------|-------------------|-------|
| Circuit | 20 | Primary focus |
| Suncorp | 10 | Maintenance |
| JOT Internal | 8 | Admin + Sales |
| Zane | 5 | As needed |
| Other | 5 | Buffer |
| **Total** | **48** | |

> Adjust targets above based on current commitments.

---

## This Week's Actuals

Use `/capacity` skill to pull live data from Harvest.

```dataview
TABLE WITHOUT ID
  client as "Client",
  hours as "Hours Logged",
  target as "Target",
  (hours - target) as "Delta"
FROM "operations/pmo/capacity-log"
WHERE week = date(today).weekyear
SORT client ASC
```

---

## Weekly History

```dataview
TABLE WITHOUT ID
  week as "Week",
  sum(rows.hours) as "Total Hours",
  length(rows) as "Clients"
FROM "operations/pmo/capacity-log"
GROUP BY week
SORT week DESC
LIMIT 8
```

---

## Capacity Log

Weekly snapshots are stored in `operations/pmo/capacity-log/` with format:
`YYYY-WXX-capacity.md` (e.g., `2026-W06-capacity.md`)

Each contains:
- Hours per client from Harvest
- Comparison to targets
- Notes on over/under allocation
