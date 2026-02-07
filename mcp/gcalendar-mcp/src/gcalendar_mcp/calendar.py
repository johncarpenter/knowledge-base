"""Google Calendar API client wrapper."""

from dataclasses import dataclass
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


@dataclass
class CalendarInfo:
    """Represents a calendar."""

    id: str
    summary: str
    description: str | None
    timezone: str
    is_primary: bool
    access_role: str
    background_color: str | None
    foreground_color: str | None

    def to_markdown(self) -> str:
        """Format calendar as markdown."""
        primary = " (Primary)" if self.is_primary else ""
        desc = f"\n  {self.description}" if self.description else ""
        return f"- **{self.summary}**{primary}{desc}\n  ID: `{self.id}` | TZ: {self.timezone}"


@dataclass
class CalendarEvent:
    """Represents a calendar event."""

    id: str
    summary: str
    description: str | None
    location: str | None
    start: datetime
    end: datetime
    all_day: bool
    status: str
    creator: str | None
    organizer: str | None
    attendees: list[dict]
    html_link: str
    calendar_id: str

    def to_markdown(self) -> str:
        """Format event as markdown."""
        if self.all_day:
            time_str = self.start.strftime("%Y-%m-%d") + " (All day)"
        else:
            start_str = self.start.strftime("%Y-%m-%d %H:%M")
            end_str = self.end.strftime("%H:%M")
            time_str = f"{start_str} - {end_str}"

        parts = [f"### {self.summary}", f"**When:** {time_str}"]

        if self.location:
            parts.append(f"**Where:** {self.location}")

        if self.organizer:
            parts.append(f"**Organizer:** {self.organizer}")

        if self.attendees:
            attendee_strs = []
            for a in self.attendees[:10]:  # Limit to first 10
                name = a.get("displayName") or a.get("email", "Unknown")
                status = a.get("responseStatus", "needsAction")
                status_icon = {
                    "accepted": "Y",
                    "declined": "N",
                    "tentative": "?",
                    "needsAction": "-",
                }.get(status, "-")
                attendee_strs.append(f"{name} [{status_icon}]")
            if len(self.attendees) > 10:
                attendee_strs.append(f"... and {len(self.attendees) - 10} more")
            parts.append(f"**Attendees:** {', '.join(attendee_strs)}")

        if self.description:
            # Truncate long descriptions
            desc = self.description[:500] + "..." if len(self.description) > 500 else self.description
            parts.append(f"\n{desc}")

        return "\n".join(parts)


class CalendarClient:
    """Client for Google Calendar API operations."""

    def __init__(self, credentials: Credentials):
        self.service = build("calendar", "v3", credentials=credentials)

    def list_calendars(self) -> list[CalendarInfo]:
        """List all calendars for the account."""
        results = self.service.calendarList().list().execute()

        calendars = []
        for cal in results.get("items", []):
            calendars.append(
                CalendarInfo(
                    id=cal["id"],
                    summary=cal.get("summary", "Untitled"),
                    description=cal.get("description"),
                    timezone=cal.get("timeZone", "UTC"),
                    is_primary=cal.get("primary", False),
                    access_role=cal.get("accessRole", "reader"),
                    background_color=cal.get("backgroundColor"),
                    foreground_color=cal.get("foregroundColor"),
                )
            )

        return calendars

    def get_events(
        self,
        calendar_id: str = "primary",
        time_min: datetime | None = None,
        time_max: datetime | None = None,
        max_results: int = 50,
        query: str | None = None,
        single_events: bool = True,
    ) -> list[CalendarEvent]:
        """Get events from a calendar.

        Args:
            calendar_id: Calendar ID (default: "primary")
            time_min: Start of time range (default: now)
            time_max: End of time range (default: 7 days from now)
            max_results: Maximum number of events to return
            query: Free text search query
            single_events: Expand recurring events into instances

        Returns:
            List of calendar events
        """
        # Default time range
        now = datetime.now(ZoneInfo("UTC"))
        if time_min is None:
            time_min = now
        if time_max is None:
            time_max = now + timedelta(days=7)

        # Ensure timezone-aware
        if time_min.tzinfo is None:
            time_min = time_min.replace(tzinfo=ZoneInfo("UTC"))
        if time_max.tzinfo is None:
            time_max = time_max.replace(tzinfo=ZoneInfo("UTC"))

        kwargs = {
            "calendarId": calendar_id,
            "timeMin": time_min.isoformat(),
            "timeMax": time_max.isoformat(),
            "maxResults": max_results,
            "singleEvents": single_events,
            "orderBy": "startTime" if single_events else "updated",
        }

        if query:
            kwargs["q"] = query

        results = self.service.events().list(**kwargs).execute()

        events = []
        for event in results.get("items", []):
            parsed = self._parse_event(event, calendar_id)
            if parsed:
                events.append(parsed)

        return events

    def get_event(self, event_id: str, calendar_id: str = "primary") -> CalendarEvent | None:
        """Get a single event by ID."""
        try:
            event = self.service.events().get(
                calendarId=calendar_id,
                eventId=event_id,
            ).execute()
            return self._parse_event(event, calendar_id)
        except Exception:
            return None

    def _parse_event(self, event: dict, calendar_id: str) -> CalendarEvent | None:
        """Parse an event from the API response."""
        # Skip cancelled events
        if event.get("status") == "cancelled":
            return None

        # Parse start/end times
        start_data = event.get("start", {})
        end_data = event.get("end", {})

        all_day = "date" in start_data

        if all_day:
            start = datetime.fromisoformat(start_data["date"])
            end = datetime.fromisoformat(end_data["date"])
        else:
            start_str = start_data.get("dateTime", start_data.get("date"))
            end_str = end_data.get("dateTime", end_data.get("date"))
            start = datetime.fromisoformat(start_str)
            end = datetime.fromisoformat(end_str)

        # Get organizer
        organizer_data = event.get("organizer", {})
        organizer = organizer_data.get("displayName") or organizer_data.get("email")

        # Get creator
        creator_data = event.get("creator", {})
        creator = creator_data.get("displayName") or creator_data.get("email")

        return CalendarEvent(
            id=event["id"],
            summary=event.get("summary", "Untitled Event"),
            description=event.get("description"),
            location=event.get("location"),
            start=start,
            end=end,
            all_day=all_day,
            status=event.get("status", "confirmed"),
            creator=creator,
            organizer=organizer,
            attendees=event.get("attendees", []),
            html_link=event.get("htmlLink", ""),
            calendar_id=calendar_id,
        )
