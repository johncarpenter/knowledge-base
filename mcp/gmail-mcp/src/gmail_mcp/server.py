"""Gmail MCP Server entry point."""

import asyncio
import argparse
import sys
from pathlib import Path

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

from .auth import AuthManager
from .gmail import GmailClient
from .tools import register_tools


# Server instance
server = Server("gmail-mcp")

# Paths
CREDENTIALS_DIR = Path(__file__).parent.parent.parent / "credentials"


def get_auth_manager() -> AuthManager:
    """Get or create the auth manager."""
    return AuthManager(CREDENTIALS_DIR)


def get_gmail_client(account: str) -> GmailClient:
    """Get a Gmail client for the specified account."""
    auth = get_auth_manager()
    credentials = auth.get_credentials(account)
    return GmailClient(credentials)


# Register all tools
register_tools(server, get_gmail_client, get_auth_manager)


async def run_server():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Gmail MCP Server")
    subparsers = parser.add_subparsers(dest="command")

    # Auth subcommand
    auth_parser = subparsers.add_parser("auth", help="Authenticate a Gmail account")
    auth_parser.add_argument("--account", required=True, help="Account name (e.g., 'personal', 'work')")
    auth_parser.add_argument(
        "--credentials-file",
        type=Path,
        help="Path to OAuth client credentials JSON from Google Cloud Console",
    )

    args = parser.parse_args()

    if args.command == "auth":
        # Run authentication flow
        auth = get_auth_manager()
        try:
            auth.authenticate(args.account, args.credentials_file)
            print(f"Successfully authenticated account: {args.account}")
        except Exception as e:
            print(f"Authentication failed: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Run the MCP server
        asyncio.run(run_server())


if __name__ == "__main__":
    main()
