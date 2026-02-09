---
name: meetings
description: >
  Query, retrieve, and save Granola meeting notes and summaries locally using the
  proofgeist Granola MCP server (local cache-based). Use this skill whenever the user wants to:
  search or find past meetings, get meeting summaries or transcripts, copy meeting notes to
  local markdown files, review what was discussed in a meeting, look up action items or decisions
  from meetings, export meeting data, or analyze meeting patterns.
  Triggers: "meeting notes", "meeting summary", "what was discussed", "find the meeting",
  "copy meeting notes", "export meeting", "meeting transcript", "action items from meeting",
  "last meeting", "recent meetings", "meeting with [person]", "granola".
---

# Meetings — Granola MCP Integration

Query, retrieve, and save Granola meeting notes locally via the proofgeist Granola MCP server. This server reads from Granola's local cache file — no API connection required.

## Important: Local Cache Limitations

The proofgeist MCP reads from `~/Library/Application Support/Granola/cache-v3.json`:
- **All meeting metadata** is available (~300+ meetings)
- **Only ~15 recent meetings** have transcripts cached locally
- Older transcripts are stored in AWS and not accessible via this MCP

## Available MCP Tools

The Granola MCP (`mcp__granola__*`) exposes these tools:

| Tool | Purpose | Parameters |
|------|---------|------------|
| `search_meetings` | Search meetings by keyword, participant, or content | `query` (string), `limit` (int, default 10) |
| `get_meeting_details` | Get comprehensive meeting metadata | `meeting_id` (string) |
| `get_meeting_transcript` | Get full transcript with speaker identification | `meeting_id` (string) |
| `get_meeting_documents` | Get meeting notes, summaries, and structured content | `meeting_id` (string) |
| `analyze_meeting_patterns` | Analyze patterns across meetings | `pattern_type` ('topics'/'participants'/'frequency'), `date_range` (optional) |

## Workflows

### 1. Find a Meeting

Search to locate the target meeting:

```
mcp__granola__search_meetings(query="quarterly planning", limit=10)
mcp__granola__search_meetings(query="Circuit", limit=5)
mcp__granola__search_meetings(query="John", limit=10)
```

Present results as a concise list (title, date, attendees). Confirm with the user if ambiguous.

### 2. Retrieve Meeting Details

With a `meeting_id`, pull the content:

```
mcp__granola__get_meeting_details(meeting_id="<uuid>")
mcp__granola__get_meeting_documents(meeting_id="<uuid>")
mcp__granola__get_meeting_transcript(meeting_id="<uuid>")
```

### 3. Save Meeting Summary Locally

The key deliverable — copy meeting content to a local `.md` file.

**Markdown format:**

```markdown
# [Meeting Title]

**Date:** YYYY-MM-DD HH:MM
**Attendees:** Name1, Name2, Name3

## Summary
[AI-generated summary from meeting documents]

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

**Save locations:**
- Client meetings: `clients/<ClientName>/meetings/`
- Internal meetings: `operations/meetings/`

### 4. Analyze Meeting Patterns

Use the pattern analysis tool for insights:

```
mcp__granola__analyze_meeting_patterns(pattern_type="participants")
mcp__granola__analyze_meeting_patterns(pattern_type="topics", date_range={"start_date": "2026-01-01", "end_date": "2026-01-31"})
mcp__granola__analyze_meeting_patterns(pattern_type="frequency")
```

### 5. Batch Export

For multiple meetings:

1. `search_meetings` to get the set
2. Iterate through each `meeting_id`
3. Retrieve details and documents for each
4. Save all to appropriate subdirectory

## Tips

- **Transcript availability:** Only ~15 recent meetings have transcripts in local cache. Older meetings will have metadata but no transcript.
- **Speaker labels:** Transcripts include speaker identification — preserve this in output.
- **Documents vs Transcript:** Use `get_meeting_documents` for notes/summaries, `get_meeting_transcript` for the full conversation.
- **Timezone:** All timestamps display in local timezone automatically.

## Error Handling

- **No transcript available:** Meeting may be older than the cache window. Note this to the user.
- **Empty results:** Broaden the search query.
- **MCP not connected:** Restart Claude Code to reload MCPs. Check `.mcp.json` config.

## Current Configuration

Server installed at: `mcp/granola-ai-mcp-server/`
Config in: `.mcp.json`

```json
{
  "granola": {
    "command": "/Users/john/Documents/Workspace/2Lines/knowledge-base/mcp/granola-ai-mcp-server/.venv/bin/granola-mcp-server",
    "args": []
  }
}
```
