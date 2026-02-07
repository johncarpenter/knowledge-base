# Granola MCP Setup Reference

## Table of Contents

- Official Granola MCP
- Community MCP Servers
- Common Data Source
- Troubleshooting

---

## Official Granola MCP

Granola's official MCP connects your account to Claude, ChatGPT, or any MCP-compatible tool.

- **Enterprise plans:** Early access beta. Admins enable in Settings > Security.
- **Docs:** https://docs.granola.ai/help-center/sharing/integrations/mcp

---

## Community MCP Servers

### btn0s/granola-mcp (Node.js — API-based)

**Tools:** `search_granola_notes`, `search_granola_transcripts`, `search_granola_events`, `search_granola_panels`, `get_granola_document`, `get_granola_transcript`, `list_granola_documents`

```bash
git clone https://github.com/btn0s/granola-mcp.git && cd granola-mcp
npm install && npm run build
```

```json
{
  "mcpServers": {
    "granola": {
      "command": "node",
      "args": ["/absolute/path/to/granola-mcp/dist/index.js"]
    }
  }
}
```

Auth: Reads from `~/Library/Application Support/Granola/supabase.json`. Requires active Granola login.

---

### pedramamini/GranolaMCP (Python — cache-based, 10 tools)

**Tools:** `get_recent_meetings`, `list_meetings`, `search_meetings`, `get_meeting`, `get_transcript`, `get_meeting_notes`, `list_participants`, `get_statistics`, `export_meeting`, `analyze_patterns`

```bash
git clone https://github.com/pedramamini/GranolaMCP.git && cd GranolaMCP
pip install -e . && cp .env.example .env
```

```json
{
  "mcpServers": {
    "granola-mcp": {
      "command": "python",
      "args": ["-m", "granola_mcp.mcp"],
      "env": {
        "GRANOLA_CACHE_PATH": "/Users/USERNAME/Library/Application Support/Granola/cache-v3.json"
      }
    }
  }
}
```

Zero external dependencies. Fully offline — reads local cache only.

---

### proofgeist/granola-ai-mcp-server (Python — cache-based)

**Tools:** `search_meetings(query, limit)`, `get_meeting_details(meeting_id)`

```json
{
  "mcpServers": {
    "granola": {
      "command": "/path/to/granola-ai-mcp-server/.venv/bin/granola-mcp-server"
    }
  }
}
```

---

### cobblehillmachine/granola-claude-mcp (Python — cache-based)

**Tools:** `list_meetings(limit)`, `search_meetings(query, limit)`, `get_meeting(meeting_id)`

```json
{
  "mcpServers": {
    "granola": {
      "command": "python3",
      "args": ["/path/to/granola_mcp_server.py"],
      "env": {
        "GRANOLA_CACHE_PATH": "~/Library/Application Support/Granola/cache-v3.json"
      }
    }
  }
}
```

---

## Common Data Source

Most community servers read Granola's local cache at:

```
~/Library/Application Support/Granola/cache-v3.json
```

Contains all meetings, transcripts, participants, and metadata. Updates automatically while Granola runs.

---

## Troubleshooting

- **MCP not responding:** Restart Claude Desktop (Cmd+Q, reopen).
- **Empty results:** Verify `cache-v3.json` exists and is non-empty. Open Granola to sync.
- **macOS permissions:** Clone repos to `~` rather than `~/Documents`.
- **Tool names don't match:** List available tools from the MCP server first, then map to the workflow.
