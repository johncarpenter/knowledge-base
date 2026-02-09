---
name: meeting-backup
description: >
  Backup today's Granola meeting notes to local markdown files in operations/meetings/.
  Run this as part of an evening workflow to archive meeting notes, summaries, and action items.
  Organizes files by date with consistent naming conventions.
  Triggers: "backup meetings", "save today's meetings", "archive meetings", "evening backup",
  "download meeting notes", "sync meetings", "meeting backup".
---

# Meeting Backup — Evening Workflow

Backup today's Granola meeting notes to local markdown files. Run as part of an evening routine to ensure meeting notes are archived locally.

## Output Location

```
operations/meetings/
├── 2026-02-09-team-standup.md
├── 2026-02-09-client-call-circuit.md
├── 2026-02-08-weekly-planning.md
└── ...
```

**Filename convention:** `YYYY-MM-DD-meeting-title-slug.md`

## Available MCP Tools

| Tool | Purpose |
|------|---------|
| `mcp__granola__search_meetings` | Find meetings by date or keyword |
| `mcp__granola__get_meeting_details` | Get meeting metadata |
| `mcp__granola__get_meeting_documents` | Get notes, summaries, structured content |
| `mcp__granola__get_meeting_transcript` | Get full transcript (recent meetings only) |

## Workflow

### 1. Find Today's Meetings

```python
# Search for today's date
mcp__granola__search_meetings(query="2026-02-09", limit=20)

# Or search broadly and filter by date
mcp__granola__search_meetings(query="", limit=50)
# Then filter results where created_at matches today
```

### 2. For Each Meeting, Gather Content

```python
meeting_id = "<uuid from search results>"

# Get metadata
details = mcp__granola__get_meeting_details(meeting_id=meeting_id)

# Get notes and summaries
documents = mcp__granola__get_meeting_documents(meeting_id=meeting_id)

# Get transcript if available (recent meetings only)
transcript = mcp__granola__get_meeting_transcript(meeting_id=meeting_id)
```

### 3. Generate Markdown File

**Template:**

```markdown
# [Meeting Title]

**Date:** YYYY-MM-DD HH:MM
**Attendees:** Name1, Name2, Name3
**Source:** Granola (backed up YYYY-MM-DD)

---

## Summary

[AI-generated summary from documents]

## Key Decisions

- [Decision 1]
- [Decision 2]

## Action Items

- [ ] [Action item with owner]
- [ ] [Action item with owner]

## Notes

[Human-written notes or structured panel content]

---

## Transcript

<details>
<summary>Click to expand full transcript</summary>

[Full transcript with speaker labels]

</details>
```

### 4. Save File

```python
# Generate slug from title
slug = meeting_title.lower().replace(" ", "-").replace(":", "")[:50]
filename = f"{date}-{slug}.md"
path = f"operations/meetings/{filename}"

# Write file
Write(file_path=path, content=markdown_content)
```

### 5. Report Summary

After processing all meetings, report:
- Number of meetings backed up
- List of files created
- Any meetings skipped (already exists, no content, etc.)

## Full Automation Script

When triggered, execute this workflow:

```
1. Get current date (YYYY-MM-DD format)
2. Search Granola for meetings matching today's date
3. For each meeting found:
   a. Check if file already exists in operations/meetings/
   b. If not, gather details + documents + transcript
   c. Format as markdown
   d. Save to operations/meetings/YYYY-MM-DD-slug.md
4. Report results
```

## Handling Duplicates

- **Check before writing:** Look for existing file with same date and similar title
- **Skip if exists:** Don't overwrite existing backups
- **Or append suffix:** `2026-02-09-standup-2.md` if needed

## Handling Missing Data

| Scenario | Action |
|----------|--------|
| No transcript available | Include note: "Transcript not available in local cache" |
| No summary | Use first 200 chars of notes as summary |
| No attendees | List as "Unknown" |
| Empty meeting | Skip with note in report |

## Date Handling

For evening backup (default: today):
```python
from datetime import date
today = date.today().isoformat()  # "2026-02-09"
```

For specific date backup:
```python
target_date = "2026-02-08"  # User-specified
```

## Example Output

After running `/meeting-backup`:

```
Meeting Backup Complete

Date: 2026-02-09
Meetings found: 3
Files created: 3

Created:
- operations/meetings/2026-02-09-team-standup.md
- operations/meetings/2026-02-09-circuit-client-call.md
- operations/meetings/2026-02-09-weekly-planning.md

Skipped:
- (none)
```

## Tips

- **Run in evening:** Best run at end of day when all meetings are complete
- **Transcript availability:** Only recent meetings (~15) have transcripts in local cache
- **Client meetings:** Consider also copying to `clients/<ClientName>/meetings/` for client-specific notes
- **Review after backup:** Quickly scan generated files to add any manual notes

## Error Handling

- **No meetings found:** Report "No meetings found for [date]"
- **MCP not connected:** Report error and suggest checking `.mcp.json`
- **Granola not running:** Meeting cache may be stale; suggest opening Granola to sync
