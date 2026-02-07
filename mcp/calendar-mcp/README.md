# macOS Calendar MCP Server

A Model Context Protocol (MCP) server for macOS Calendar using icalBuddy. Accesses all calendars synced to macOS (iCloud, Google, Exchange, etc.) without needing separate OAuth for each provider.

## Features

- **Zero configuration** - No OAuth needed, uses macOS Calendar directly
- **All calendars in one place** - Access iCloud, Google, Exchange, and any other synced calendars
- **Fast local access** - No API calls, reads from local calendar store
- **Calendar filtering** - Include or exclude specific calendars

## Prerequisites

Install icalBuddy:
```bash
brew install ical-buddy
```

## Tools

| Tool | Description |
|------|-------------|
| `calendar_list` | List all synced calendars |
| `calendar_today` | Get today's events |
| `calendar_tomorrow` | Get tomorrow's events |
| `calendar_week` | Get events for next 7 days |
| `calendar_upcoming` | Get events for N days ahead |
| `calendar_range` | Get events in a date range |

## Setup

### 1. Install

```bash
cd calendar-mcp
uv venv
uv pip install -e .
```

### 2. Configure Claude Code

Add to your Claude Code MCP settings (`~/.claude/claude_code_config.json`):

```json
{
  "mcpServers": {
    "calendar": {
      "command": "/path/to/calendar-mcp/.venv/bin/calendar-mcp",
      "args": []
    }
  }
}
```

## Usage Examples

### Get today's events
```
calendar_today()
```

### Get events excluding holidays
```
calendar_today(exclude_calendars=["Holidays in Canada", "Canadian Holidays"])
```

### Get events from specific calendars with details
```
calendar_today(
    include_calendars=["Work", "john@zanemoney.com"],
    include_details=true
)
```

### Get events for a date range
```
calendar_range(
    start_date="2026-02-10",
    end_date="2026-02-14"
)
```

## How It Works

This server wraps [icalBuddy](https://hasseg.org/icalBuddy/), a CLI tool that reads directly from the macOS Calendar store. Because Calendar.app syncs all your accounts locally, this single MCP server gives you access to:

- iCloud calendars
- Google calendars
- Microsoft Exchange/Outlook
- CalDAV calendars
- Subscribed calendars (ICS feeds)

No separate OAuth configuration needed for each provider.

## License

MIT
