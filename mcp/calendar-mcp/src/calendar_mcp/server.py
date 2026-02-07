"""macOS Calendar MCP Server entry point."""

import asyncio

from mcp.server import Server
from mcp.server.stdio import stdio_server

from .icalbuddy import ICalBuddy
from .tools import register_tools

# Server instance
server = Server("calendar-mcp")


def get_icalbuddy() -> ICalBuddy:
    """Get an icalBuddy instance."""
    return ICalBuddy()


# Register all tools
register_tools(server, get_icalbuddy)


async def run_server():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


def main():
    """Main entry point."""
    asyncio.run(run_server())


if __name__ == "__main__":
    main()
