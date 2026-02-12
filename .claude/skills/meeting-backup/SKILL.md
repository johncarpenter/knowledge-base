---
name: meeting-backup
description: >
  Backup today's Granola meeting notes to local markdown files, organized by client folder.
  Uses Granola folder metadata to route meetings to appropriate client directories.
  Run this as part of an evening workflow to archive meeting notes, summaries, and action items.
  Triggers: "backup meetings", "save today's meetings", "archive meetings", "evening backup",
  "download meeting notes", "sync meetings", "meeting backup".
---

# Meeting Backup — Evening Workflow

Backup today's Granola meeting notes to local markdown files, organized by Granola folder (client). Run as part of an evening routine to ensure meeting notes are archived locally.

## Output Locations (Folder-Based)

Meetings are saved to directories based on their **Granola folder**:

| Granola Folder | Local Directory |
|----------------|-----------------|
| Suncorp | `clients/Suncorp/meetings/` |
| Circuit | `clients/Circuit/meetings/` |
| Jot | `clients/JOT/meetings/` |
| Zane | `clients/Zane/meetings/` |
| Pacwest | `clients/Pacwest/meetings/` |
| 2Lines | `operations/meetings/` |
| (other/unfiled) | `operations/meetings/` |

**Filename convention:** `YYYY-MM-DD-meeting-title-slug.md`

### Example Output Structure

```
clients/
├── Circuit/
│   └── meetings/
│       └── 2026-02-09-circuit-standup.md
├── Suncorp/
│   └── meetings/
│       └── 2026-02-09-suncorp-standup.md
└── JOT/
    └── meetings/
        └── 2026-02-09-jot-review.md
operations/
└── meetings/
    └── 2026-02-09-team-sync.md
```

## Available MCP Tools

| Tool | Purpose |
|------|---------|
| `mcp__granola__list_meetings` | List meetings in a time range |
| `mcp__granola__get_meetings` | Get meeting details by ID(s) |
| `mcp__granola__get_meeting_transcript` | Get full transcript (recent meetings only) |

## Reading Folder Information

The Granola cache contains folder metadata that maps meetings to clients. Read this before processing meetings.

**Cache location:** `/Users/john/Library/Application Support/Granola/cache-v3.json`

### Step 1: Parse Folder Data

```python
import json

# Read the cache
with open('/Users/john/Library/Application Support/Granola/cache-v3.json', 'r') as f:
    data = json.load(f)
    inner = json.loads(data.get('cache'))
    state = inner.get('state', {})

# Get folder metadata and document lists
dlm = state.get('documentListsMetadata', {})
doc_lists = state.get('documentLists', {})

# Build document_id -> folder_title mapping
doc_to_folder = {}
for list_id, doc_ids in doc_lists.items():
    if isinstance(doc_ids, list):
        meta = dlm.get(list_id, {})
        folder_title = meta.get('title', 'Unfiled') if isinstance(meta, dict) else 'Unfiled'
        for doc_id in doc_ids:
            doc_to_folder[doc_id] = folder_title
```

### Step 2: Folder-to-Path Mapping

```python
FOLDER_TO_PATH = {
    'Suncorp': 'clients/Suncorp/meetings',
    'Circuit': 'clients/Circuit/meetings',
    'Jot': 'clients/JOT/meetings',
    'Zane': 'clients/Zane/meetings',
    'Pacwest': 'clients/Pacwest/meetings',
    'Stratenym': 'clients/Stratenym/meetings',
    '2Lines': 'operations/meetings',
    # Default fallback
    '_default': 'operations/meetings',
}

def get_output_path(meeting_id, doc_to_folder):
    folder = doc_to_folder.get(meeting_id, 'Unfiled')
    base_path = FOLDER_TO_PATH.get(folder, FOLDER_TO_PATH['_default'])
    return base_path
```

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

### 4. Save File (Folder-Based)

```python
# Get folder from mapping
folder = doc_to_folder.get(meeting_id, 'Unfiled')
base_path = FOLDER_TO_PATH.get(folder, FOLDER_TO_PATH['_default'])

# Generate slug from title
slug = meeting_title.lower().replace(" ", "-").replace(":", "")[:50]
filename = f"{date}-{slug}.md"
path = f"{base_path}/{filename}"

# Ensure directory exists
os.makedirs(base_path, exist_ok=True)

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
1. Read Granola cache to build document_id -> folder mapping
2. Get current date (YYYY-MM-DD format)
3. List Granola meetings for today (mcp__granola__list_meetings)
4. For each meeting found:
   a. Look up folder from doc_to_folder mapping
   b. Determine output path from FOLDER_TO_PATH
   c. Check if file already exists in target directory
   d. If not, gather details via mcp__granola__get_meetings
   e. Format as markdown
   f. Ensure target directory exists
   g. Save to {base_path}/YYYY-MM-DD-slug.md
5. Report results grouped by client/folder
```

## Handling Duplicates

- **Check before writing:** Look for existing file in target directory with same date and similar title
- **Skip if exists:** Don't overwrite existing backups
- **Or append suffix:** `2026-02-09-standup-2.md` if needed
- **Cross-folder:** Each folder is independent; the same meeting title in different folders is not a duplicate

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
Meetings found: 5
Files created: 5

By Client:
  Suncorp (2):
    - clients/Suncorp/meetings/2026-02-09-suncorp-standup.md
    - clients/Suncorp/meetings/2026-02-09-infrastructure-sync.md

  Circuit (1):
    - clients/Circuit/meetings/2026-02-09-circuit-review.md

  Zane (1):
    - clients/Zane/meetings/2026-02-09-zane-weekly-sync.md

  Internal (1):
    - operations/meetings/2026-02-09-team-planning.md

Skipped:
- (none)
```

## Tips

- **Run in evening:** Best run at end of day when all meetings are complete
- **Transcript availability:** Only recent meetings (~15) have transcripts in local cache
- **Folder assignment:** Meetings inherit their folder from Granola. If a meeting appears in the wrong client folder, update it in Granola first.
- **New clients:** To add a new client, add a mapping entry in `FOLDER_TO_PATH` and ensure the directory exists under `clients/`
- **Review after backup:** Quickly scan generated files to add any manual notes

## Error Handling

- **No meetings found:** Report "No meetings found for [date]"
- **MCP not connected:** Report error and suggest checking `.mcp.json`
- **Granola not running:** Meeting cache may be stale; suggest opening Granola to sync
