# Google Calendar MCP Server

A Model Context Protocol (MCP) server for Google Calendar with multi-account support.

## Features

- **Multi-account support** - Manage multiple Google accounts with named profiles
- **Read-only access** - Safe, read-only operations on your calendars
- **Flexible queries** - Get events by date range, search by text, or use convenience methods
- **Rich formatting** - Events formatted as markdown with attendees, location, and more

## Tools

| Tool | Description |
|------|-------------|
| `calendar_list_accounts` | List all authenticated accounts |
| `calendar_list_calendars` | List all calendars for an account |
| `calendar_get_events` | Get events in a date range |
| `calendar_today` | Get today's events |
| `calendar_tomorrow` | Get tomorrow's events |
| `calendar_this_week` | Get events for the current week |
| `calendar_search` | Search events by text |
| `calendar_get_event` | Get a single event by ID |

## Setup

### 1. Create Google Cloud OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google Calendar API**
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
5. Select **Desktop app** as application type
6. Download the JSON credentials file

### 2. Install

```bash
cd gcalendar-mcp
uv venv
uv pip install -e .
```

### 3. Authenticate

```bash
# First time: provide the credentials file
gcalendar-mcp auth --account 2lines --credentials-file ~/Downloads/client_secret.json

# Opens browser for OAuth consent
# Token saved to credentials/2lines/token.json
```

### 4. Configure Claude Code

Add to your Claude Code MCP settings (`~/.claude/claude_code_config.json`):

```json
{
  "mcpServers": {
    "gcalendar": {
      "command": "/path/to/gcalendar-mcp/.venv/bin/gcalendar-mcp",
      "args": []
    }
  }
}
```

## Usage Examples

### List today's events
```
calendar_today(account="2lines")
```

### Get events for a specific date range
```
calendar_get_events(
    account="2lines",
    start_date="2026-02-10",
    end_date="2026-02-14"
)
```

### Search for meetings
```
calendar_search(
    account="2lines",
    query="standup",
    days_ahead=14
)
```

## Permissions

This server requests read-only access:
- `calendar.readonly` - View calendars
- `calendar.events.readonly` - View events

No write operations are supported.

## License

MIT
