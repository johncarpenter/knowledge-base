"""MCP tool definitions for Google Calendar operations."""

from datetime import datetime, timedelta
from typing import Callable
from zoneinfo import ZoneInfo

from mcp.server import Server
from mcp.types import TextContent, Tool

from .auth import AuthManager
from .calendar import CalendarClient


def register_tools(
    server: Server,
    get_client: Callable[[str], CalendarClient],
    get_auth: Callable[[], AuthManager],
):
    """Register all Calendar tools with the MCP server."""

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        return [
            Tool(
                name="calendar_list_accounts",
                description="List all authenticated Google Calendar accounts",
                inputSchema={
                    "type": "object",
                    "properties": {},
                    "required": [],
                },
            ),
            Tool(
                name="calendar_list_calendars",
                description="List all calendars for an account",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name (e.g., 'personal', 'work')",
                        },
                    },
                    "required": ["account"],
                },
            ),
            Tool(
                name="calendar_get_events",
                description=(
                    "Get calendar events within a time range. "
                    "Defaults to the next 7 days from the primary calendar."
                ),
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name",
                        },
                        "calendar_id": {
                            "type": "string",
                            "description": "Calendar ID (default: 'primary')",
                            "default": "primary",
                        },
                        "start_date": {
                            "type": "string",
                            "description": "Start date in YYYY-MM-DD format (default: today)",
                        },
                        "end_date": {
                            "type": "string",
                            "description": "End date in YYYY-MM-DD format (default: 7 days from start)",
                        },
                        "max_results": {
                            "type": "integer",
                            "description": "Maximum events to return (default: 50)",
                            "default": 50,
                        },
                        "query": {
                            "type": "string",
                            "description": "Free text search query",
                        },
                    },
                    "required": ["account"],
                },
            ),
            Tool(
                name="calendar_today",
                description="Get all events for today",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name",
                        },
                        "calendar_id": {
                            "type": "string",
                            "description": "Calendar ID (default: 'primary')",
                            "default": "primary",
                        },
                    },
                    "required": ["account"],
                },
            ),
            Tool(
                name="calendar_tomorrow",
                description="Get all events for tomorrow",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name",
                        },
                        "calendar_id": {
                            "type": "string",
                            "description": "Calendar ID (default: 'primary')",
                            "default": "primary",
                        },
                    },
                    "required": ["account"],
                },
            ),
            Tool(
                name="calendar_this_week",
                description="Get all events for the current week (Monday to Sunday)",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name",
                        },
                        "calendar_id": {
                            "type": "string",
                            "description": "Calendar ID (default: 'primary')",
                            "default": "primary",
                        },
                    },
                    "required": ["account"],
                },
            ),
            Tool(
                name="calendar_search",
                description="Search for events by text query",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name",
                        },
                        "query": {
                            "type": "string",
                            "description": "Search query",
                        },
                        "calendar_id": {
                            "type": "string",
                            "description": "Calendar ID (default: 'primary')",
                            "default": "primary",
                        },
                        "days_ahead": {
                            "type": "integer",
                            "description": "Number of days ahead to search (default: 30)",
                            "default": 30,
                        },
                    },
                    "required": ["account", "query"],
                },
            ),
            Tool(
                name="calendar_get_event",
                description="Get a single event by its ID",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name",
                        },
                        "event_id": {
                            "type": "string",
                            "description": "Event ID",
                        },
                        "calendar_id": {
                            "type": "string",
                            "description": "Calendar ID (default: 'primary')",
                            "default": "primary",
                        },
                    },
                    "required": ["account", "event_id"],
                },
            ),
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict) -> list[TextContent]:
        try:
            if name == "calendar_list_accounts":
                auth = get_auth()
                accounts = auth.list_accounts()
                if not accounts:
                    return [
                        TextContent(
                            type="text",
                            text="No accounts configured. Run: gcalendar-mcp auth --account <name>",
                        )
                    ]
                return [
                    TextContent(
                        type="text",
                        text="Configured accounts:\n" + "\n".join(f"- {a}" for a in accounts),
                    )
                ]

            elif name == "calendar_list_calendars":
                account = arguments["account"]
                client = get_client(account)
                calendars = client.list_calendars()

                if not calendars:
                    return [TextContent(type="text", text="No calendars found.")]

                lines = ["## Calendars\n"]
                for cal in calendars:
                    lines.append(cal.to_markdown())

                return [TextContent(type="text", text="\n".join(lines))]

            elif name == "calendar_get_events":
                account = arguments["account"]
                calendar_id = arguments.get("calendar_id", "primary")
                max_results = arguments.get("max_results", 50)
                query = arguments.get("query")

                # Parse dates
                local_tz = ZoneInfo("America/Denver")  # TODO: make configurable
                now = datetime.now(local_tz)

                if "start_date" in arguments:
                    start = datetime.fromisoformat(arguments["start_date"]).replace(
                        hour=0, minute=0, second=0, tzinfo=local_tz
                    )
                else:
                    start = now.replace(hour=0, minute=0, second=0, microsecond=0)

                if "end_date" in arguments:
                    end = datetime.fromisoformat(arguments["end_date"]).replace(
                        hour=23, minute=59, second=59, tzinfo=local_tz
                    )
                else:
                    end = start + timedelta(days=7)

                client = get_client(account)
                events = client.get_events(
                    calendar_id=calendar_id,
                    time_min=start,
                    time_max=end,
                    max_results=max_results,
                    query=query,
                )

                return [TextContent(type="text", text=_format_events(events, start, end))]

            elif name == "calendar_today":
                account = arguments["account"]
                calendar_id = arguments.get("calendar_id", "primary")

                local_tz = ZoneInfo("America/Denver")
                now = datetime.now(local_tz)
                start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                end = now.replace(hour=23, minute=59, second=59, microsecond=0)

                client = get_client(account)
                events = client.get_events(
                    calendar_id=calendar_id,
                    time_min=start,
                    time_max=end,
                )

                return [
                    TextContent(
                        type="text",
                        text=_format_events(events, start, end, title="Today's Events"),
                    )
                ]

            elif name == "calendar_tomorrow":
                account = arguments["account"]
                calendar_id = arguments.get("calendar_id", "primary")

                local_tz = ZoneInfo("America/Denver")
                now = datetime.now(local_tz)
                tomorrow = now + timedelta(days=1)
                start = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
                end = tomorrow.replace(hour=23, minute=59, second=59, microsecond=0)

                client = get_client(account)
                events = client.get_events(
                    calendar_id=calendar_id,
                    time_min=start,
                    time_max=end,
                )

                return [
                    TextContent(
                        type="text",
                        text=_format_events(events, start, end, title="Tomorrow's Events"),
                    )
                ]

            elif name == "calendar_this_week":
                account = arguments["account"]
                calendar_id = arguments.get("calendar_id", "primary")

                local_tz = ZoneInfo("America/Denver")
                now = datetime.now(local_tz)

                # Find Monday of current week
                days_since_monday = now.weekday()
                monday = now - timedelta(days=days_since_monday)
                start = monday.replace(hour=0, minute=0, second=0, microsecond=0)

                # Find Sunday
                sunday = monday + timedelta(days=6)
                end = sunday.replace(hour=23, minute=59, second=59, microsecond=0)

                client = get_client(account)
                events = client.get_events(
                    calendar_id=calendar_id,
                    time_min=start,
                    time_max=end,
                )

                return [
                    TextContent(
                        type="text",
                        text=_format_events(events, start, end, title="This Week's Events"),
                    )
                ]

            elif name == "calendar_search":
                account = arguments["account"]
                query = arguments["query"]
                calendar_id = arguments.get("calendar_id", "primary")
                days_ahead = arguments.get("days_ahead", 30)

                local_tz = ZoneInfo("America/Denver")
                now = datetime.now(local_tz)
                start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                end = start + timedelta(days=days_ahead)

                client = get_client(account)
                events = client.get_events(
                    calendar_id=calendar_id,
                    time_min=start,
                    time_max=end,
                    query=query,
                )

                return [
                    TextContent(
                        type="text",
                        text=_format_events(
                            events, start, end, title=f"Search Results: '{query}'"
                        ),
                    )
                ]

            elif name == "calendar_get_event":
                account = arguments["account"]
                event_id = arguments["event_id"]
                calendar_id = arguments.get("calendar_id", "primary")

                client = get_client(account)
                event = client.get_event(event_id, calendar_id)

                if not event:
                    return [TextContent(type="text", text=f"Event not found: {event_id}")]

                return [TextContent(type="text", text=event.to_markdown())]

            else:
                return [TextContent(type="text", text=f"Unknown tool: {name}")]

        except Exception as e:
            return [TextContent(type="text", text=f"Error: {str(e)}")]


def _format_events(
    events: list,
    start: datetime,
    end: datetime,
    title: str | None = None,
) -> str:
    """Format a list of events as markdown."""
    if title is None:
        start_str = start.strftime("%Y-%m-%d")
        end_str = end.strftime("%Y-%m-%d")
        title = f"Events from {start_str} to {end_str}"

    if not events:
        return f"## {title}\n\nNo events found."

    lines = [f"## {title}\n", f"Found {len(events)} event(s):\n"]

    # Group events by date
    events_by_date: dict[str, list] = {}
    for event in events:
        date_key = event.start.strftime("%Y-%m-%d (%A)")
        if date_key not in events_by_date:
            events_by_date[date_key] = []
        events_by_date[date_key].append(event)

    for date_key in sorted(events_by_date.keys()):
        lines.append(f"\n### {date_key}\n")
        for event in events_by_date[date_key]:
            if event.all_day:
                time_str = "All day"
            else:
                time_str = f"{event.start.strftime('%H:%M')} - {event.end.strftime('%H:%M')}"

            lines.append(f"- **{time_str}** - {event.summary}")
            if event.location:
                lines.append(f"  - Location: {event.location}")

    return "\n".join(lines)
