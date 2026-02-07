# MCP Servers

Locally-built Model Context Protocol servers for integrating external services with the knowledge base.

## Available Servers

| Server | Description | Status |
|--------|-------------|--------|
| [gmail-mcp](./gmail-mcp/) | Multi-account Gmail search and summarization | In Development |

## Adding a New MCP Server

1. Create a new directory: `mcp/<service>-mcp/`
2. Follow the Python MCP SDK patterns (see `gmail-mcp` for reference)
3. Document setup in the server's README
4. Add to the table above

## Integration with Claude Code

Add servers to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "uv",
      "args": ["run", "--directory", "/path/to/mcp/gmail-mcp", "gmail-mcp"]
    }
  }
}
```
