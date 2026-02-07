"""Gmail API client wrapper."""

import base64
import email
from dataclasses import dataclass
from datetime import datetime

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


@dataclass
class EmailMessage:
    """Represents an email message."""

    id: str
    thread_id: str
    subject: str
    sender: str
    to: list[str]
    date: datetime
    snippet: str
    body_text: str
    body_html: str | None
    labels: list[str]

    def to_markdown(self) -> str:
        """Format message as markdown."""
        to_str = ", ".join(self.to) if self.to else "Unknown"
        date_str = self.date.strftime("%Y-%m-%d %H:%M")

        return f"""### {self.subject}

**From:** {self.sender}
**To:** {to_str}
**Date:** {date_str}

{self.body_text}
"""


@dataclass
class EmailThread:
    """Represents an email thread."""

    id: str
    subject: str
    messages: list[EmailMessage]
    snippet: str

    def to_markdown(self) -> str:
        """Format thread as markdown."""
        parts = [f"## Thread: {self.subject}\n"]
        for msg in self.messages:
            parts.append(msg.to_markdown())
        return "\n---\n".join(parts)


class GmailClient:
    """Client for Gmail API operations."""

    def __init__(self, credentials: Credentials):
        self.service = build("gmail", "v1", credentials=credentials)

    def search(
        self,
        query: str,
        max_results: int = 20,
        include_body: bool = False,
    ) -> list[EmailMessage]:
        """Search for emails matching a query.

        Args:
            query: Gmail search query (e.g., "from:foo@bar.com after:2025/01/01")
            max_results: Maximum number of results to return
            include_body: Whether to fetch full message bodies

        Returns:
            List of matching email messages
        """
        results = (
            self.service.users()
            .messages()
            .list(userId="me", q=query, maxResults=max_results)
            .execute()
        )

        messages = []
        for msg_info in results.get("messages", []):
            msg = self._get_message(msg_info["id"], include_body)
            messages.append(msg)

        return messages

    def get_thread(self, thread_id: str) -> EmailThread:
        """Get a full email thread by ID."""
        thread = self.service.users().threads().get(userId="me", id=thread_id).execute()

        messages = []
        for msg_data in thread.get("messages", []):
            msg = self._parse_message(msg_data, include_body=True)
            messages.append(msg)

        subject = messages[0].subject if messages else "No Subject"
        snippet = thread.get("snippet", "")

        return EmailThread(
            id=thread_id,
            subject=subject,
            messages=messages,
            snippet=snippet,
        )

    def get_labels(self) -> list[dict]:
        """Get all labels for the account."""
        results = self.service.users().labels().list(userId="me").execute()
        return results.get("labels", [])

    def _get_message(self, message_id: str, include_body: bool = False) -> EmailMessage:
        """Fetch a single message by ID."""
        format_type = "full" if include_body else "metadata"
        msg_data = (
            self.service.users()
            .messages()
            .get(userId="me", id=message_id, format=format_type)
            .execute()
        )
        return self._parse_message(msg_data, include_body)

    def _parse_message(self, msg_data: dict, include_body: bool = False) -> EmailMessage:
        """Parse a message from the API response."""
        headers = {h["name"].lower(): h["value"] for h in msg_data["payload"]["headers"]}

        # Parse date
        date_str = headers.get("date", "")
        try:
            # Handle various date formats
            date = email.utils.parsedate_to_datetime(date_str)
        except Exception:
            date = datetime.now()

        # Parse recipients
        to_raw = headers.get("to", "")
        to_list = [addr.strip() for addr in to_raw.split(",") if addr.strip()]

        # Get body if requested
        body_text = ""
        body_html = None
        if include_body:
            body_text, body_html = self._extract_body(msg_data["payload"])

        return EmailMessage(
            id=msg_data["id"],
            thread_id=msg_data["threadId"],
            subject=headers.get("subject", "No Subject"),
            sender=headers.get("from", "Unknown"),
            to=to_list,
            date=date,
            snippet=msg_data.get("snippet", ""),
            body_text=body_text or msg_data.get("snippet", ""),
            body_html=body_html,
            labels=msg_data.get("labelIds", []),
        )

    def _extract_body(self, payload: dict) -> tuple[str, str | None]:
        """Extract plain text and HTML body from message payload."""
        text_body = ""
        html_body = None

        def process_part(part: dict):
            nonlocal text_body, html_body
            mime_type = part.get("mimeType", "")

            if "body" in part and "data" in part["body"]:
                data = part["body"]["data"]
                decoded = base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

                if mime_type == "text/plain" and not text_body:
                    text_body = decoded
                elif mime_type == "text/html" and not html_body:
                    html_body = decoded

            # Recurse into multipart
            if "parts" in part:
                for sub_part in part["parts"]:
                    process_part(sub_part)

        process_part(payload)
        return text_body, html_body
