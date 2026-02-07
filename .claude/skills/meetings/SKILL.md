---
name: meetings
description: >
  Query, retrieve, and save Granola meeting notes and summaries locally using the
  Granola MCP server. Use this skill whenever the user wants to: search or find past
  meetings, get meeting summaries or transcripts, copy meeting notes to local markdown
  files, review what was discussed in a meeting, look up action items or decisions from
  meetings, export meeting data, or analyze meeting patterns.
  Triggers: "meeting notes", "meeting summary", "what was discussed", "find the meeting",
  "copy meeting notes", "export meeting", "meeting transcript", "action items from meeting",
  "last meeting", "recent meetings", "meeting with [person]", "granola".
---

# Meetings — Granola MCP Integration

Query, retrieve, and save Granola meeting notes locally via the Granola MCP server. Assumes the Granola MCP server is configured and connected.

## Available MCP Tools

The Granola MCP exposes these tools (exact names vary by server implementation):

| Tool | Purpose |
|---|---|
| `search_meetings` / `search_granola_notes` | Find meetings by keyword, participant, or date |
| `list_meetings` / `list_granola_documents` | List recent meetings |
| `get_meeting` / `get_granola_document` | Full meeting details by ID |
| `get_transcript` / `get_granola_transcript` | Full transcript with speaker attribution |
| `get_meeting_notes` | AI-generated summary and human notes |
| `export_meeting` | Export meeting as formatted markdown |
| `get_recent_meetings` | Get the N most recent meetings |
| `search_granola_events` | Search calendar events |
| `search_granola_panels` | Search structured note sections |

> **Tip:** If a tool name isn't recognized, list available tools from the MCP server and map to the closest match above.

## Workflows

### 1. Find a Meeting

Search or list to locate the target meeting:

```
search_meetings(query="quarterly planning", limit=10)
list_meetings(limit=5)
get_recent_meetings(count=5)
list_meetings(from_date="2026-01-01", to_date="2026-01-31")
```

Present results as a concise list (title, date, attendees). Confirm with the user if ambiguous.

### 2. Retrieve Meeting Details

With a `meeting_id`, pull the content:

```
get_meeting(meeting_id="<uuid>")
get_meeting_notes(meeting_id="<uuid>")
get_transcript(meeting_id="<uuid>")
```

### 3. Save Meeting Summary Locally

The key deliverable — copy meeting content to a local `.md` file.

**Markdown format:**

```markdown
# [Meeting Title]

**Date:** YYYY-MM-DD HH:MM
**Attendees:** Name1, Name2, Name3

## Summary
[AI-generated summary]

## Key Decisions
- [Decisions extracted from notes]

## Action Items
- [ ] [Action item with owner if available]

## Notes
[Human-written notes if present]

## Transcript
[Include only if user requests it — transcripts can be large]
```

**Filename convention:** `YYYY-MM-DD-meeting-title-slug.md`

Save to the user's workspace or a designated `meetings/` subdirectory.

### 4. Batch Export

For multiple meetings:

1. `list_meetings` or `search_meetings` to get the set
2. Iterate through each `meeting_id`
3. Retrieve and format each
4. Save all to a `meetings/` subdirectory

## Tips

- **Date shortcuts:** Some servers accept relative dates (`"3d"`, `"1w"`, `"24h"`).
- **Transcript size:** Only include transcripts when explicitly requested.
- **Speaker labels:** Preserve speaker attribution from transcripts in output.
- **Deduplication:** Deduplicate by `meeting_id` when combining search results.

## Error Handling

- Tool name not found → list available MCP tools, try alternate names from the table above.
- No results → broaden query or expand date range.
- MCP not connected → see [references/granola-mcp-setup.md](references/granola-mcp-setup.md) for setup instructions.
