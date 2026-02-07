"""icalBuddy wrapper for accessing macOS Calendar."""

import re
import subprocess
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Calendar:
    """Represents a calendar."""

    name: str
    calendar_type: str
    uid: str

    def to_markdown(self) -> str:
        return f"- **{self.name}** ({self.calendar_type})"


@dataclass
class Event:
    """Represents a calendar event."""

    title: str
    time_range: str
    uid: str | None = None
    location: str | None = None
    notes: str | None = None
    attendees: list[str] = field(default_factory=list)

    def to_markdown(self, include_details: bool = False) -> str:
        """Format event as markdown."""
        parts = [f"- **{self.time_range}** - {self.title}"]

        if self.location:
            parts.append(f"  - Location: {self.location}")

        if include_details:
            if self.attendees:
                parts.append(f"  - Attendees: {', '.join(self.attendees[:10])}")
                if len(self.attendees) > 10:
                    parts.append(f"    ... and {len(self.attendees) - 10} more")

            if self.notes:
                # Clean up notes - remove Teams/Meet boilerplate, truncate
                clean_notes = self._clean_notes(self.notes)
                if clean_notes:
                    parts.append(f"  - Notes: {clean_notes}")

        return "\n".join(parts)

    def _clean_notes(self, notes: str) -> str:
        """Clean up meeting notes, removing boilerplate."""
        # Remove common meeting boilerplate
        patterns_to_remove = [
            r"-::~:~::~:~:.*?-::~:~::-",  # Google Meet markers
            r"_{10,}",  # Long underscores (Teams separators)
            r"Microsoft Teams.*?(?=\n\n|\Z)",  # Teams boilerplate
            r"Join with Google Meet:.*",
            r"Meeting ID:.*",
            r"Passcode:.*",
            r"For organizers:.*",
            r"https?://\S+",  # URLs
        ]

        result = notes
        for pattern in patterns_to_remove:
            result = re.sub(pattern, "", result, flags=re.DOTALL | re.IGNORECASE)

        # Clean up whitespace
        result = re.sub(r"\n{3,}", "\n\n", result)
        result = result.strip()

        # Truncate if too long
        if len(result) > 200:
            result = result[:200] + "..."

        return result


class ICalBuddy:
    """Wrapper for icalBuddy CLI tool."""

    def __init__(self, icalbuddy_path: str = "/opt/homebrew/bin/icalBuddy"):
        self.icalbuddy_path = icalbuddy_path

    def _run(self, args: list[str]) -> str:
        """Run icalBuddy with given arguments."""
        cmd = [self.icalbuddy_path] + args
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
            )
            return result.stdout
        except FileNotFoundError:
            raise RuntimeError(
                "icalBuddy not found. Install with: brew install ical-buddy"
            )
        except subprocess.TimeoutExpired:
            raise RuntimeError("icalBuddy timed out")

    def list_calendars(self) -> list[Calendar]:
        """List all available calendars."""
        output = self._run(["calendars"])
        calendars = []

        current_name = None
        current_type = None
        current_uid = None

        for line in output.split("\n"):
            line = line.strip()
            if not line:
                continue

            if line.startswith("• "):
                # Save previous calendar if exists
                if current_name and current_uid:
                    calendars.append(Calendar(current_name, current_type or "unknown", current_uid))

                current_name = line[2:].strip()
                current_type = None
                current_uid = None
            elif line.startswith("type: "):
                current_type = line[6:].strip()
            elif line.startswith("UID: "):
                current_uid = line[5:].strip()

        # Don't forget the last one
        if current_name and current_uid:
            calendars.append(Calendar(current_name, current_type or "unknown", current_uid))

        return calendars

    def get_events_today(
        self,
        include_calendars: list[str] | None = None,
        exclude_calendars: list[str] | None = None,
    ) -> list[Event]:
        """Get today's events."""
        return self._get_events("eventsToday", include_calendars, exclude_calendars)

    def get_events_tomorrow(
        self,
        include_calendars: list[str] | None = None,
        exclude_calendars: list[str] | None = None,
    ) -> list[Event]:
        """Get tomorrow's events."""
        return self._get_events("eventsToday+1", include_calendars, exclude_calendars, skip_today=True)

    def get_events_week(
        self,
        include_calendars: list[str] | None = None,
        exclude_calendars: list[str] | None = None,
    ) -> list[Event]:
        """Get events for the next 7 days."""
        return self._get_events("eventsToday+7", include_calendars, exclude_calendars)

    def get_events_range(
        self,
        start_date: str,
        end_date: str,
        include_calendars: list[str] | None = None,
        exclude_calendars: list[str] | None = None,
    ) -> list[Event]:
        """Get events in a date range (YYYY-MM-DD format)."""
        command = f"eventsFrom:{start_date} to:{end_date}"
        return self._get_events(command, include_calendars, exclude_calendars)

    def get_events_upcoming(
        self,
        days: int = 14,
        include_calendars: list[str] | None = None,
        exclude_calendars: list[str] | None = None,
    ) -> list[Event]:
        """Get upcoming events for N days."""
        return self._get_events(f"eventsToday+{days}", include_calendars, exclude_calendars)

    def _get_events(
        self,
        command: str,
        include_calendars: list[str] | None = None,
        exclude_calendars: list[str] | None = None,
        skip_today: bool = False,
    ) -> list[Event]:
        """Get events with given command and filters."""
        args = [
            "-nc",  # No calendar names in output
            "-uid",  # Include UIDs
            # Note: removed "-n" flag which filtered to "only events from now on"
            # This was hiding past events when querying today's calendar
        ]

        if include_calendars:
            args.extend(["-ic", ",".join(include_calendars)])

        if exclude_calendars:
            args.extend(["-ec", ",".join(exclude_calendars)])

        args.append(command)

        output = self._run(args)
        events = self._parse_events(output)

        # For tomorrow, filter out today's events
        if skip_today:
            today = datetime.now().strftime("%Y-%m-%d")
            events = [e for e in events if today not in e.time_range and "today" not in e.time_range.lower()]

        return events

    def _parse_events(self, output: str) -> list[Event]:
        """Parse icalBuddy output into Event objects."""
        events = []
        current_event: dict | None = None

        for line in output.split("\n"):
            if line.startswith("• "):
                # Save previous event
                if current_event:
                    events.append(self._make_event(current_event))

                current_event = {
                    "title": line[2:].strip(),
                    "time_range": "",
                    "uid": None,
                    "location": None,
                    "notes": None,
                    "attendees": [],
                }
            elif current_event is not None:
                line = line.strip()
                if not line:
                    continue

                if line.startswith("location: "):
                    current_event["location"] = line[10:]
                elif line.startswith("notes: "):
                    current_event["notes"] = line[7:]
                elif line.startswith("attendees: "):
                    attendees_str = line[11:]
                    current_event["attendees"] = [a.strip() for a in attendees_str.split(",")]
                elif line.startswith("uid: "):
                    current_event["uid"] = line[5:]
                elif self._looks_like_time(line):
                    current_event["time_range"] = line
                elif current_event.get("notes") is not None:
                    # Continuation of notes
                    current_event["notes"] += "\n" + line

        # Don't forget the last event
        if current_event:
            events.append(self._make_event(current_event))

        return events

    def _looks_like_time(self, line: str) -> bool:
        """Check if line looks like a time range."""
        time_patterns = [
            r"\d{1,2}:\d{2}\s*(AM|PM)",
            r"today at",
            r"tomorrow at",
            r"day after tomorrow at",
            r"\w{3}\s+\d{1,2},\s+\d{4}\s+at",
        ]
        for pattern in time_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                return True
        return False

    def _make_event(self, data: dict) -> Event:
        """Create an Event from parsed data."""
        return Event(
            title=data["title"],
            time_range=data.get("time_range", ""),
            uid=data.get("uid"),
            location=data.get("location"),
            notes=data.get("notes"),
            attendees=data.get("attendees", []),
        )
