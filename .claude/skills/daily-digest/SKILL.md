---
name: daily-digest
description: >
  Generate a comprehensive daily digest combining weekly plan (Epic focus and tasks),
  emails (last 2 days), meeting notes (previous day's action items, decisions, summaries),
  and upcoming calendar events (today and tomorrow). Saves to operations/ folder as markdown.
  Use this skill to start the day with a complete overview or to catch up after time away.
  Triggers: "daily digest", "morning briefing", "daily summary", "catch me up",
  "what do I need to know", "daily overview", "morning summary", "start my day",
  "briefing", "what's happening today".
---

# Daily Digest — Email, Meetings, Calendar & Weekly Plan Integration

Generate a comprehensive daily digest combining:
- **Weekly Plan** — current Epic focus and tasks from `operations/pmo/weekly-plan.md`
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

### Meeting Tools (Granola — Local Cache)

**Note:** The proofgeist Granola MCP reads from local cache (`~/Library/Application Support/Granola/cache-v3.json`). Only ~15 recent meetings have transcripts; older meetings have metadata only.

| Tool | Purpose |
|---|---|
| `mcp__granola__search_meetings` | Search meetings by keyword, participant, or content |
| `mcp__granola__get_meeting_details` | Get meeting metadata with local timezone |
| `mcp__granola__get_meeting_documents` | Get meeting notes, summaries, structured content |
| `mcp__granola__get_meeting_transcript` | Get full transcript with speaker IDs (recent only) |

### Calendar Tools
| Tool | Purpose |
|---|---|
| `mcp__calendar__calendar_today` | Get today's calendar events |
| `mcp__calendar__calendar_tomorrow` | Get tomorrow's calendar events |
| `mcp__calendar__calendar_list` | List all synced calendars |

### Weekly Plan (Local File)
| File | Purpose |
|---|---|
| `operations/pmo/weekly-plan.md` | Current week's Epic focus and selected tasks |

## Workflow

### 1. Gather Data (Run in Parallel)

Execute these data gathering operations concurrently:

#### Weekly Plan (Local)
```
Read operations/pmo/weekly-plan.md

Extract from "Current Week" section:
- Week dates (e.g., "2026-02-03 to 2026-02-09")
- Epic Focus table (priority, key, title, project, status)
- Tasks This Week checklist
- Commitments list
```

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
# Search for yesterday's meetings by date
mcp__granola__search_meetings(query="YYYY-MM-DD", limit=20)

# Or search by keyword/participant
mcp__granola__search_meetings(query="standup", limit=10)
mcp__granola__search_meetings(query="Circuit", limit=10)

# Then get details and documents for each meeting
mcp__granola__get_meeting_details(meeting_id="<uuid>")
mcp__granola__get_meeting_documents(meeting_id="<uuid>")

# For recent meetings with transcripts available
mcp__granola__get_meeting_transcript(meeting_id="<uuid>")
```

**Limitation:** The local cache MCP doesn't support date-range filtering directly. Search by date string or filter results client-side.

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
**Week:** W06 (Feb 3-9, 2026)
**Coverage:** Weekly plan, emails (2 days), meetings (yesterday), calendar (today + tomorrow)

---

## This Week's Focus

### Epic Priorities

| # | Epic | Project | Status |
|---|------|---------|--------|
| 1 | [CIR-13](https://2linessoftware.atlassian.net/browse/CIR-13): AI & Chat Features | Circuit | In Progress |
| 2 | [PAC-8](https://2linessoftware.atlassian.net/browse/PAC-8): Data Warehouse | Pacwest | In Progress |

### Tasks This Week

- [ ] CIR-50: Implement chat UI
- [x] CIR-51: Add AI response handling _(completed)_
- [ ] PAC-20: Schema design
- [ ] PAC-21: ETL pipeline

### Commitments

- [ ] Complete chat UI implementation (CIR-50)
- [x] Finish schema design for data warehouse
- [ ] Start AI response handling

> _From `operations/pmo/weekly-plan.md`. Run `/weekly-plan review` to update._

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

Synthesize from weekly plan, meetings, and emails:

1. **[Task from weekly plan that aligns with today's calendar]** — Source: weekly-plan + calendar
2. **[Urgent email or meeting follow-up]** — Source: email/meeting
3. **[Next task from weekly commitments]** — Source: weekly-plan

---

## Statistics

- **Weekly Epics in focus:** N
- **Weekly tasks remaining:** N of M
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

### Granola Meeting Search
```
# Search by date (returns meetings containing that date in title/content)
mcp__granola__search_meetings(query="2026-02-06", limit=20)

# Search by keyword
mcp__granola__search_meetings(query="standup", limit=10)

# Filter results by date in your code after retrieval
```

**Note:** The proofgeist MCP doesn't support native date-range filtering. Search broadly and filter results by checking meeting dates in the response.

## Tips

- **Weekly plan first:** The weekly focus section anchors the day — what Epics matter this week?
- **Cross-reference:** Link emails and meetings to weekly Epics when relevant (e.g., "relates to CIR-13")
- **Parallel fetching:** Fetch emails, meetings, and calendar simultaneously for speed
- **Email volume:** If >100 emails, focus on non-newsletter, non-promotional content
- **Meeting priority:** Prioritize meetings with action items in the summary
- **Calendar prep:** Flag events happening in the next 2 hours as needing immediate attention
- **No weekly plan?** If `operations/pmo/weekly-plan.md` is empty, suggest running `/weekly-plan`

## Error Handling

- Weekly plan missing/empty → Show "No weekly plan set. Run `/weekly-plan` to prioritize your Epics."
- MCP not connected → Skip that section, note in output
- No meetings found → State "No meetings recorded for [date]"
- No transcript available → Note "Transcript not in local cache (older meeting)"
- No emails found → State "No new emails in the past 2 days"
- Calendar empty → State "No scheduled events"

### Granola Local Cache Limitations

The proofgeist Granola MCP reads from local cache only:
- **All meeting metadata** is available (~300+ meetings)
- **Only ~15 recent meetings** have transcripts cached
- Older transcripts are stored in AWS and not accessible via this MCP
- For older meetings, use `get_meeting_documents` instead of `get_meeting_transcript`

## Optional Enhancements

If user requests, also include:
- **Weather** — Current conditions and forecast
- **Task list** — Open tasks from project management tools
- **News** — Industry-relevant headlines
