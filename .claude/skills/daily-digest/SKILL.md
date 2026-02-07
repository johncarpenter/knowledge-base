---
name: daily-digest
description: >
  Generate a comprehensive daily digest combining emails (last 2 days), meeting notes
  (previous day's action items, decisions, summaries), and upcoming calendar events
  (today and tomorrow). Saves to operations/ folder as markdown. Use this skill to start
  the day with a complete overview or to catch up after time away.
  Triggers: "daily digest", "morning briefing", "daily summary", "catch me up",
  "what do I need to know", "daily overview", "morning summary", "start my day",
  "briefing", "what's happening today".
---

# Daily Digest — Email, Meetings & Calendar Integration

Generate a comprehensive daily digest combining:
- **Emails** (last 2 days) — categorized by action type
- **Meetings** (previous day) — action items, decisions, and summaries
- **Calendar** (today + tomorrow) — upcoming events

Output saved to `operations/YYYY-MM-DD-daily-digest.md`.

## Available MCP Tools

### Email Tools

#### Gmail
| Tool | Purpose |
|---|---|
| `mcp__gmail__gmail_list_accounts` | List configured Gmail accounts |
| `mcp__gmail__gmail_search` | Search emails with Gmail query syntax |

#### Exchange
| Tool | Purpose |
|---|---|
| `mcp__exchange__exchange_list_accounts` | List configured Exchange accounts |
| `mcp__exchange__exchange_search` | Search emails with KQL syntax |

### Meeting Tools (Granola)
| Tool | Purpose |
|---|---|
| `mcp__granola__list_meetings` | List meetings within time range |
| `mcp__granola__get_meetings` | Get detailed meeting info by ID |
| `mcp__granola__query_granola_meetings` | Natural language query for meeting content |

### Calendar Tools
| Tool | Purpose |
|---|---|
| `mcp__calendar__calendar_today` | Get today's calendar events |
| `mcp__calendar__calendar_tomorrow` | Get tomorrow's calendar events |
| `mcp__calendar__calendar_list` | List all synced calendars |

## Workflow

### 1. Gather Data (Run in Parallel)

Execute these data gathering operations concurrently:

#### Emails (Last 2 Days)
```
# List all accounts first
mcp__gmail__gmail_list_accounts()
mcp__exchange__exchange_list_accounts()

# Then search each account (parallel)
# Gmail: use newer_than:2d or after:YYYY/MM/DD
mcp__gmail__gmail_search(account="<name>", query="newer_than:2d", max_results=50, include_body=true)

# Exchange: use date range
mcp__exchange__exchange_search(account="<name>", query="received>=YYYY-MM-DD", max_results=50, include_body=true)
```

#### Meetings (Previous Day)
```
# Query for yesterday's meetings with focus on action items
mcp__granola__list_meetings(time_range="custom", custom_start="YYYY-MM-DD", custom_end="YYYY-MM-DD")

# Then get details for each meeting
mcp__granola__get_meetings(meeting_ids=["uuid1", "uuid2", ...])

# Or use natural language query
mcp__granola__query_granola_meetings(query="action items and decisions from yesterday's meetings")
```

#### Calendar (Today + Tomorrow)
```
mcp__calendar__calendar_today(include_details=true)
mcp__calendar__calendar_tomorrow(include_details=true)
```

### 2. Process & Categorize

#### Email Categories
| Category | Criteria |
|---|---|
| **Action Required** | Tasks, deadlines, explicit requests |
| **Response Needed** | Questions, meeting requests, approvals |
| **FYI** | Updates, newsletters, notifications |

Focus on emails from the **current day** for actions, but include previous day for context.

#### Meeting Extraction
For each meeting, extract:
- **Summary** — 2-3 sentence overview
- **Key Decisions** — What was decided
- **Action Items** — Tasks with owners if available
- **Follow-ups** — Next steps or scheduled follow-ups

#### Calendar Preparation
For each event, note:
- **Time** — Start time and duration
- **Title** — Event name
- **Location/Link** — Physical location or meeting URL
- **Attendees** — Key participants (if included)
- **Prep needed** — Flag if meeting needs preparation

### 3. Generate Digest Document

**Filename:** `YYYY-MM-DD-daily-digest.md` (use current date)
**Location:** `operations/`

**Markdown Structure:**

```markdown
# Daily Digest: [Day of Week], [Month Day, Year]

**Generated:** YYYY-MM-DD HH:MM
**Coverage:** Emails (last 2 days), Meetings (yesterday), Calendar (today + tomorrow)

---

## Today's Schedule

### [Today's Date]

| Time | Event | Location | Notes |
|------|-------|----------|-------|
| 9:00 AM | Team Standup | Zoom | Weekly sync |
| 2:00 PM | Client Call | Teams | Prep: review proposal |

### [Tomorrow's Date]

| Time | Event | Location | Notes |
|------|-------|----------|-------|
| 10:00 AM | Planning Session | Conference Room | Bring laptop |

---

## Yesterday's Meetings

### [Meeting Title 1]
**Date:** YYYY-MM-DD | **Attendees:** Name1, Name2

**Summary:**
[2-3 sentence overview]

**Decisions:**
- [Decision 1]
- [Decision 2]

**Action Items:**
- [ ] [Action item with owner]
- [ ] [Action item with owner]

### [Meeting Title 2]
...

---

## Email Highlights (Last 2 Days)

### Action Required

| From | Subject | Date | Action |
|------|---------|------|--------|
| sender@example.com | Subject line | YYYY-MM-DD | Brief action description |

### Response Needed

| From | Subject | Date | Question/Request |
|------|---------|------|------------------|
| sender@example.com | Subject line | YYYY-MM-DD | What they need |

### FYI / Updates

| From | Subject | Date | Summary |
|------|---------|------|---------|
| sender@example.com | Subject line | YYYY-MM-DD | One-line summary |

---

## Priority Actions for Today

1. **[Most urgent action]** — Source: [email/meeting/calendar]
2. **[Second priority]** — Source: [email/meeting/calendar]
3. **[Third priority]** — Source: [email/meeting/calendar]

---

## Statistics

- **Meetings yesterday:** N
- **Action items from meetings:** N
- **Emails received (2 days):** N
- **Requiring action:** N
- **Calendar events today:** N
- **Calendar events tomorrow:** N
```

### 4. Save and Confirm

Write to `operations/YYYY-MM-DD-daily-digest.md` and confirm the path to the user.

## Date Calculations

For a digest run on **February 7, 2026**:
- **Today:** 2026-02-07
- **Tomorrow:** 2026-02-08
- **Yesterday (meetings):** 2026-02-06
- **Email range:** 2026-02-05 to 2026-02-07

### Gmail Date Queries
```
newer_than:2d
# OR
after:2026/02/05 before:2026/02/08
```

### Exchange Date Queries
```
received:2026-02-05..2026-02-07
# OR
received>=2026-02-05
```

### Granola Date Range
```
time_range="custom"
custom_start="2026-02-06"
custom_end="2026-02-06"
```

## Tips

- **Parallel fetching:** Fetch emails, meetings, and calendar simultaneously for speed
- **Email volume:** If >100 emails, focus on non-newsletter, non-promotional content
- **Meeting priority:** Prioritize meetings with action items in the summary
- **Calendar prep:** Flag events happening in the next 2 hours as needing immediate attention
- **Cross-reference:** Note when calendar events relate to meeting follow-ups or email threads

## Error Handling

- MCP not connected → Skip that section, note in output
- No meetings found → State "No meetings recorded for [date]"
- No emails found → State "No new emails in the past 2 days"
- Calendar empty → State "No scheduled events"

## Optional Enhancements

If user requests, also include:
- **Weather** — Current conditions and forecast
- **Task list** — Open tasks from project management tools
- **News** — Industry-relevant headlines
