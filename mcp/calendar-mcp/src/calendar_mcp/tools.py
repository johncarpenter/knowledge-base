"""MCP tool definitions for macOS Calendar operations."""

from mcp.server import Server
from mcp.types import TextContent, Tool

from .icalbuddy import ICalBuddy


def register_tools(server: Server, get_icalbuddy: callable):
    """Register all Calendar tools with the MCP server."""

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        return [
            Tool(
                name="calendar_list",
                description="List all calendars synced to macOS Calendar (iCloud, Google, Exchange, etc.)",
                inputSchema={
                    "type": "object",
                    "properties": {},
                    "required": [],
                },
            ),
            Tool(
                name="calendar_today",
                description="Get today's calendar events from macOS Calendar",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "include_calendars": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Only include events from these calendars (by name)",
                        },
                        "exclude_calendars": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Exclude events from these calendars (by name)",
                        },
                        "include_details": {
                            "type": "boolean",
                            "description": "Include attendees and notes (default: false)",
                            "default": False,
                        },
                    },
                    "required": [],
                },
            ),
            Tool(
                name="calendar_tomorrow",
                description="Get tomorrow's calendar events from macOS Calendar",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "include_calendars": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Only include events from these calendars",
                        },
                        "exclude_calendars": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Exclude events from these calendars",
                        },
                        "include_details": {
                            "type": "boolean",
                            "description": "Include attendees and notes",
                            "default": False,
                        },
                    },
                    "required": [],
                },
            ),
            Tool(
                name="calendar_week",
                description="Get calendar events for the next 7 days",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "include_calendars": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Only include events from these calendars",
                        },
                        "exclude_calendars": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Exclude events from these calendars",
                        },
                        "include_details": {
                            "type": "boolean",
                            "description": "Include attendees and notes",
                            "default": False,
                        },
                    },
                    "required": [],
                },
            ),
            Tool(
                name="calendar_upcoming",
                description="Get upcoming calendar events for a specified number of days",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "days": {
                            "type": "integer",
                            "description": "Number of days to look ahead (default: 14)",
                            "default": 14,
                        },
                        "include_calendars": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Only include events from these calendars",
                        },
                        "exclude_calendars": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Exclude events from these calendars",
                        },
                        "include_details": {
                            "type": "boolean",
                            "description": "Include attendees and notes",
                            "default": False,
                        },
                    },
                    "required": [],
                },
            ),
            Tool(
                name="calendar_range",
                description="Get calendar events within a specific date range",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "start_date": {
                            "type": "string",
                            "description": "Start date in YYYY-MM-DD format",
                        },
                        "end_date": {
                            "type": "string",
                            "description": "End date in YYYY-MM-DD format",
                        },
                        "include_calendars": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Only include events from these calendars",
                        },
                        "exclude_calendars": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Exclude events from these calendars",
                        },
                        "include_details": {
                            "type": "boolean",
                            "description": "Include attendees and notes",
                            "default": False,
                        },
                    },
                    "required": ["start_date", "end_date"],
                },
            ),
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict) -> list[TextContent]:
        try:
            ical = get_icalbuddy()

            if name == "calendar_list":
                calendars = ical.list_calendars()
                if not calendars:
                    return [TextContent(type="text", text="No calendars found.")]

                lines = ["## Calendars\n"]
                for cal in calendars:
                    lines.append(cal.to_markdown())

                return [TextContent(type="text", text="\n".join(lines))]

            elif name == "calendar_today":
                include_cals = arguments.get("include_calendars")
                exclude_cals = arguments.get("exclude_calendars")
                include_details = arguments.get("include_details", False)

                events = ical.get_events_today(include_cals, exclude_cals)

                return [
                    TextContent(
                        type="text",
                        text=_format_events(events, "Today's Events", include_details),
                    )
                ]

            elif name == "calendar_tomorrow":
                include_cals = arguments.get("include_calendars")
                exclude_cals = arguments.get("exclude_calendars")
                include_details = arguments.get("include_details", False)

                events = ical.get_events_tomorrow(include_cals, exclude_cals)

                return [
                    TextContent(
                        type="text",
                        text=_format_events(events, "Tomorrow's Events", include_details),
                    )
                ]

            elif name == "calendar_week":
                include_cals = arguments.get("include_calendars")
                exclude_cals = arguments.get("exclude_calendars")
                include_details = arguments.get("include_details", False)

                events = ical.get_events_week(include_cals, exclude_cals)

                return [
                    TextContent(
                        type="text",
                        text=_format_events(events, "This Week's Events", include_details),
                    )
                ]

            elif name == "calendar_upcoming":
                days = arguments.get("days", 14)
                include_cals = arguments.get("include_calendars")
                exclude_cals = arguments.get("exclude_calendars")
                include_details = arguments.get("include_details", False)

                events = ical.get_events_upcoming(days, include_cals, exclude_cals)

                return [
                    TextContent(
                        type="text",
                        text=_format_events(events, f"Upcoming Events ({days} days)", include_details),
                    )
                ]

            elif name == "calendar_range":
                start_date = arguments["start_date"]
                end_date = arguments["end_date"]
                include_cals = arguments.get("include_calendars")
                exclude_cals = arguments.get("exclude_calendars")
                include_details = arguments.get("include_details", False)

                events = ical.get_events_range(start_date, end_date, include_cals, exclude_cals)

                return [
                    TextContent(
                        type="text",
                        text=_format_events(events, f"Events: {start_date} to {end_date}", include_details),
                    )
                ]

            else:
                return [TextContent(type="text", text=f"Unknown tool: {name}")]

        except Exception as e:
            return [TextContent(type="text", text=f"Error: {str(e)}")]


def _format_events(events: list, title: str, include_details: bool = False) -> str:
    """Format a list of events as markdown."""
    if not events:
        return f"## {title}\n\nNo events found."

    lines = [f"## {title}\n", f"Found {len(events)} event(s):\n"]

    for event in events:
        lines.append(event.to_markdown(include_details))

    return "\n".join(lines)
