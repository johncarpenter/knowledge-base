# Obsidian Configuration

This folder contains Obsidian vault settings for the 2Lines knowledge base.

## Setup

1. Open Obsidian
2. Click "Open folder as vault"
3. Select the `knowledge-base` directory

## Templates

Templates are stored as `_template.md` in each directory:

| Directory | Template For |
|-----------|--------------|
| `clients/_template.md` | Client documentation |
| `operations/_template.md` | General operations docs |
| `operations/meetings/_template.md` | Meeting notes |
| `operations/emails/_template.md` | Email summaries |
| `research/_template.md` | Research spikes |
| `pipeline/_template.md` | Sales opportunities |
| `marketing/_template.md` | Marketing content |
| `finance/_template.md` | Financial documents |

### Using Templates

**Option 1: Manual copy**
1. Navigate to the directory
2. Copy `_template.md` to a new file
3. Rename with appropriate date/title

**Option 2: With Templater plugin (recommended)**
1. Install Templater from Community Plugins
2. Configure folder templates in Templater settings
3. New files automatically use the directory's template

## Recommended Community Plugins

Install these from Settings → Community Plugins → Browse:

- **Templater** - Advanced templates with folder-based auto-apply
- **Calendar** - Visual calendar for date-based notes
- **Dataview** - Query your notes like a database
- **Git** - Auto-commit and sync changes

## Graph View

The graph is pre-configured with colors:
- 🔵 Blue: Clients
- 🟢 Green: Operations
- 🟠 Orange: Research
- 🟡 Yellow: Pipeline

## File Naming Conventions

- Date-prefixed: `YYYY-MM-DD-descriptive-title.md`
- Kebab-case for all filenames
- Templates prefixed with underscore: `_template.md`
