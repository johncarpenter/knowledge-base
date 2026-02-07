# Calendar to Billing Mapping

This file defines how calendar events are mapped to timesheet skills.

## Calendar Mappings

### Direct Calendar Mappings

| Calendar Name | Skill | Notes |
|---------------|-------|-------|
| Suncorp | `/suncorp` | All events on this calendar (includes PACT, Dev PACT scrums) |
| Zane | `/zane` | All events on @zanemoney calendar (includes Daily Standup, UX/UI) |
| Circuit | `/circuit` | All events on this calendar |

### JOT Digital Calendar Mapping

Events on the "JOT Digital" calendar require keyword-based mapping. Match against event title (case-insensitive).

#### Keyword Rules (checked in order)

**Exact Match Rules (checked first):**
| Event Title | Skill | Notes |
|-------------|-------|-------|
| `Weekly Dev Standup` | `/jotadmin` | JOT internal dev sync |

**Keyword Rules (checked in order):**
| Keywords | Skill | Example Matches |
|----------|-------|-----------------|
| `russell`, `rh`, `hendrix` | `/rh` | "Russell Hendrix Standup", "RH Sprint Planning" |
| `acs`, `automated cleaning`, `vision` | `/acs` | "ACS Demo", "Automated Cleaning Review" |
| `obsidian`, `welltracker` | `/obsidian` | "Obsidian Kickoff", "Welltracker Assessment" |
| `hqca`, `health quality` | `/hqca` | "HQCA Advisory Call" |
| `concrete`, `fieldwire`, `glean` | `/concrete` | "Concrete Reflections Sync", "Fieldwire Integration" |
| `stratenym` | `/stratenym` | "Stratenym Library Review" |
| `kbc`, `ems` | (skip - no skill yet) | "KBC EMS Planning" |
| `niali` | (skip - no skill yet) | "Niali Sync" |
| `sales`, `prospect`, `pipeline`, `proposal`, `rfp` | `/jotsales` | "Sales Call", "Proposal Review" |
| `admin`, `internal`, `jot team`, `standup` | `/jotadmin` | "Jot Admin", "Internal Sync" |

#### Fallback

If no keywords match, default to `/jotadmin` (internal meetings/overhead).

### Ignored Calendars

These calendars are skipped during time entry creation:

- Tasks
- Reminders
- Birthdays
- Holidays (Canada, US, Canadian)
- Subscriptions (YYC Eagles, etc.)
- Personal
- Home
- Work
- pascale@2linessoftware.com
- jcarpent@gmail.com
- Omela

## Event Filtering

### Skip Events If

- Event is all-day (no specific time)
- Event duration is 0 or negative
- Event title contains: "OOO", "Out of Office", "Vacation", "Holiday", "PTO", "Blocked", "Focus Time", "Lunch"
- Event is declined (if status available)

### Duration Calculation

- Round to nearest 0.5 hours (e.g., 45 min → 1h, 25 min → 0.5h)
- Minimum billable: 0.5 hours
- Maximum single entry: 8 hours (flag for review if longer)

## Notes Format

For time entries, use the event title as the notes field. Do not include:
- Date/time information
- Project name
- Calendar name
