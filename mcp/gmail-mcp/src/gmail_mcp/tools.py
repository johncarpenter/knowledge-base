"""MCP tool definitions for Gmail operations."""

from typing import Callable

from mcp.server import Server
from mcp.types import Tool, TextContent

from .auth import AuthManager
from .gmail import GmailClient


def register_tools(
    server: Server,
    get_client: Callable[[str], GmailClient],
    get_auth: Callable[[], AuthManager],
):
    """Register all Gmail tools with the MCP server."""

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        return [
            Tool(
                name="gmail_list_accounts",
                description="List all authenticated Gmail accounts",
                inputSchema={
                    "type": "object",
                    "properties": {},
                    "required": [],
                },
            ),
            Tool(
                name="gmail_search",
                description=(
                    "Search emails using Gmail query syntax. "
                    "Examples: 'from:alice@example.com', 'subject:invoice after:2025/01/01', "
                    "'is:unread label:important', 'has:attachment filename:pdf'"
                ),
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name (e.g., 'personal', 'work')",
                        },
                        "query": {
                            "type": "string",
                            "description": "Gmail search query",
                        },
                        "max_results": {
                            "type": "integer",
                            "description": "Maximum results to return (default: 20)",
                            "default": 20,
                        },
                        "include_body": {
                            "type": "boolean",
                            "description": "Include full message body (default: false)",
                            "default": False,
                        },
                    },
                    "required": ["account", "query"],
                },
            ),
            Tool(
                name="gmail_get_thread",
                description="Get a full email thread by ID, including all messages",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name",
                        },
                        "thread_id": {
                            "type": "string",
                            "description": "Gmail thread ID",
                        },
                    },
                    "required": ["account", "thread_id"],
                },
            ),
            Tool(
                name="gmail_summarize",
                description=(
                    "Get email content formatted for summarization. "
                    "Returns thread content as markdown, ready for LLM summarization."
                ),
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name",
                        },
                        "thread_id": {
                            "type": "string",
                            "description": "Thread ID to summarize",
                        },
                    },
                    "required": ["account", "thread_id"],
                },
            ),
            Tool(
                name="gmail_get_labels",
                description="List all labels/folders for an account",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "account": {
                            "type": "string",
                            "description": "Account name",
                        },
                    },
                    "required": ["account"],
                },
            ),
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict) -> list[TextContent]:
        try:
            if name == "gmail_list_accounts":
                auth = get_auth()
                accounts = auth.list_accounts()
                if not accounts:
                    return [TextContent(type="text", text="No accounts configured. Run: gmail-mcp auth --account <name>")]
                return [TextContent(type="text", text="Configured accounts:\n" + "\n".join(f"- {a}" for a in accounts))]

            elif name == "gmail_search":
                account = arguments["account"]
                query = arguments["query"]
                max_results = arguments.get("max_results", 20)
                include_body = arguments.get("include_body", False)

                client = get_client(account)
                messages = client.search(query, max_results, include_body)

                if not messages:
                    return [TextContent(type="text", text=f"No messages found for query: {query}")]

                # Format results
                lines = [f"Found {len(messages)} messages:\n"]
                for msg in messages:
                    date_str = msg.date.strftime("%Y-%m-%d %H:%M")
                    lines.append(f"- **{msg.subject}**")
                    lines.append(f"  From: {msg.sender} | Date: {date_str}")
                    lines.append(f"  Thread ID: `{msg.thread_id}`")
                    if include_body:
                        # Truncate body for display
                        body_preview = msg.body_text[:500] + "..." if len(msg.body_text) > 500 else msg.body_text
                        lines.append(f"  {body_preview}")
                    else:
                        lines.append(f"  {msg.snippet}")
                    lines.append("")

                return [TextContent(type="text", text="\n".join(lines))]

            elif name == "gmail_get_thread":
                account = arguments["account"]
                thread_id = arguments["thread_id"]

                client = get_client(account)
                thread = client.get_thread(thread_id)

                return [TextContent(type="text", text=thread.to_markdown())]

            elif name == "gmail_summarize":
                account = arguments["account"]
                thread_id = arguments["thread_id"]

                client = get_client(account)
                thread = client.get_thread(thread_id)

                # Format for summarization with clear structure
                output = f"""# Email Thread for Summarization

**Subject:** {thread.subject}
**Messages:** {len(thread.messages)}
**Thread ID:** {thread_id}

---

{thread.to_markdown()}

---

## Summarization Prompt

Please provide:
1. **TL;DR** - One sentence summary
2. **Key Points** - Main topics discussed
3. **Action Items** - Any tasks or follow-ups mentioned
4. **Decisions** - Any decisions made
5. **Open Questions** - Unresolved items
"""
                return [TextContent(type="text", text=output)]

            elif name == "gmail_get_labels":
                account = arguments["account"]
                client = get_client(account)
                labels = client.get_labels()

                lines = ["Labels:\n"]
                for label in sorted(labels, key=lambda x: x.get("name", "")):
                    name = label.get("name", "Unknown")
                    label_type = label.get("type", "user")
                    lines.append(f"- {name} ({label_type})")

                return [TextContent(type="text", text="\n".join(lines))]

            else:
                return [TextContent(type="text", text=f"Unknown tool: {name}")]

        except Exception as e:
            return [TextContent(type="text", text=f"Error: {str(e)}")]
