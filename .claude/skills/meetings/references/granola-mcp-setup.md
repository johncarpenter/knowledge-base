# Granola MCP Setup Reference

## Current Active Configuration

**Server:** proofgeist/granola-ai-mcp-server (local cache-based)

**Location:** `mcp/granola-ai-mcp-server/`

**Tools available:**
- `search_meetings(query, limit)` - Search by keyword/participant/content
- `get_meeting_details(meeting_id)` - Meeting metadata with local timezone
- `get_meeting_transcript(meeting_id)` - Full transcript with speaker IDs
- `get_meeting_documents(meeting_id)` - Notes, summaries, structured content
- `analyze_meeting_patterns(pattern_type, date_range)` - Cross-meeting analysis

**Config (.mcp.json):**
```json
{
  "granola": {
    "command": "/Users/john/Documents/Workspace/2Lines/knowledge-base/mcp/granola-ai-mcp-server/.venv/bin/granola-mcp-server",
    "args": []
  }
}
```

**Data source:** `~/Library/Application Support/Granola/cache-v3.json`

**Limitations:**
- Only ~15 recent meetings have transcripts in local cache
- Older meetings have metadata but transcripts are in AWS (not accessible)
- 100% offline — no API calls

---

## Alternative MCP Servers

### Official Granola MCP (Enterprise)

- **Enterprise plans only** — Early access beta
- Admins enable in Settings > Security
- Docs: https://docs.granola.ai/help-center/sharing/integrations/mcp

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
      "args": ["/path/to/granola-mcp/dist/index.js"]
    }
  }
}
```

Auth: Reads from `~/Library/Application Support/Granola/supabase.json`. Requires active Granola login. **Note:** May require enterprise license.

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

## Troubleshooting

- **MCP not responding:** Restart Claude Code to reload MCPs.
- **Empty results:** Verify `cache-v3.json` exists and is non-empty. Open Granola to sync.
- **No transcript:** Only recent meetings have transcripts in local cache. Older transcripts are in AWS.
- **macOS permissions:** If installed in `~/Documents`, may need Full Disk Access for Claude.
- **Tool names don't match:** List available tools from the MCP server first (`/mcp`), then map to the workflow.

---

## Cache Statistics (as of 2026-02-09)

- **Total documents:** 319 meetings
- **With transcripts:** 15 meetings
- **Date range:** 2025-07-31 to 2026-02-06
- **Cache size:** ~12 MB
