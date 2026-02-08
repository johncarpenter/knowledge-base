---
description: Show hours logged per client this week
---

# Capacity View

Display hours logged per client for the current week, compared to targets.

**Usage:** `/capacity [period]`

**Examples:**
- `/capacity` - This week
- `/capacity last-week` - Previous week
- `/capacity month` - Current month
- `/capacity 2026-02-03 to 2026-02-07` - Custom range

## Process

### 1. Determine Date Range

Parse `$ARGUMENTS`:
- (none) → Current week (Mon-Sun)
- `last-week` → Previous week
- `month` → Current month
- `YYYY-MM-DD to YYYY-MM-DD` → Custom range

Use America/Edmonton timezone.

### 2. Fetch Time Entries from Harvest

Use `mcp__harvest__getTimeEntries`:

```json
{
  "startDate": "2026-02-03",
  "endDate": "2026-02-09"
}
```

### 3. Load Target Allocations

Read targets from `operations/pmo/capacity.md` frontmatter or the table.

Default targets (hours/week):
| Client | Target |
|--------|--------|
| Circuit | 20 |
| Suncorp | 10 |
| JOT | 8 |
| Zane | 5 |
| Other | 5 |

### 4. Aggregate by Client

Map Harvest projects to clients using `operations/billing-config.md`:

| Harvest Project ID | Client |
|-------------------|--------|
| 44917453 | Circuit |
| 44781206, 44083190 | Suncorp |
| 44410793 | JOT |
| 45810822 | Zane |
| 42984120 | HQCA |
| 46298598 | ACS |
| 46688079 | Concrete |
| 46348085 | Russell Hendrix |
| 46348005 | Obsidian |
| 44051994 | Stratenym |

### 5. Display Capacity Report

```markdown
# Capacity Report
**Period:** 2026-02-03 to 2026-02-09 (Week 06)

## Hours by Client

| Client | Logged | Target | Delta | Status |
|--------|--------|--------|-------|--------|
| Circuit | 18.5h | 20h | -1.5h | On Track |
| Suncorp | 12.0h | 10h | +2.0h | Over |
| JOT | 4.0h | 8h | -4.0h | Under |
| Zane | 0h | 5h | -5.0h | Under |
| HQCA | 3.0h | — | +3.0h | Unplanned |
| **Total** | **37.5h** | **43h** | **-5.5h** | |

## Daily Breakdown

| Day | Mon | Tue | Wed | Thu | Fri | Total |
|-----|-----|-----|-----|-----|-----|-------|
| Circuit | 4h | 4h | 4h | 4h | 2.5h | 18.5h |
| Suncorp | 2h | 2h | 4h | 2h | 2h | 12h |
| JOT | 1h | 1h | 0h | 1h | 1h | 4h |
| HQCA | 0h | 1h | 2h | 0h | 0h | 3h |

## Notes

- **Over:** Suncorp taking more time than planned
- **Under:** Zane not started this week
- **Unplanned:** HQCA added mid-week

## Actions

- [ ] Catch up on Zane by Friday
- [ ] Review Suncorp scope creep
```

### 6. Optionally Save Snapshot

If this is end of week, offer to save to `operations/pmo/capacity-log/2026-W06-capacity.md`:

```markdown
---
week: 2026-W06
start: 2026-02-03
end: 2026-02-09
total_hours: 37.5
---

# Week 06 Capacity Log

| Client | Hours | Target | Delta |
|--------|-------|--------|-------|
| Circuit | 18.5 | 20 | -1.5 |
| Suncorp | 12.0 | 10 | +2.0 |
| JOT | 4.0 | 8 | -4.0 |
| Zane | 0 | 5 | -5.0 |
| HQCA | 3.0 | 0 | +3.0 |

**Total:** 37.5h

## Notes

_End of week observations._
```

## Notes

- Uses Harvest as source of truth for logged hours
- Targets are defined in `operations/pmo/capacity.md`
- Historical logs in `capacity-log/` for trend analysis
