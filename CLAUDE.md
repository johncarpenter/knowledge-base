# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Location & Timezone

- **Location:** Edmonton, Alberta, Canada
- **Timezone:** Mountain Time (America/Edmonton)
- **UTC Offset:** UTC-7 (MST) / UTC-6 (MDT during daylight saving)

All times in this repo and in conversations should use **local Mountain Time** unless explicitly stated otherwise.

## What This Repo Is

This is a **knowledge base and memory system** for 2Lines Software. It aggregates information from various sources (meetings, research, client interactions) and stores them as markdown files within a structured directory hierarchy. The repo serves as the company's persistent memory — a single place to capture, organize, and retrieve institutional knowledge. There is no application code, build system, or test suite.

## Directory Structure

- `clients/` — Client-specific documentation, subdirectories named after the client org (e.g., `clients/JOT/`, `clients/Circuit/`)
- `operations/` — Internal ops: `meetings/` for meeting notes, `pmo/` for project management standards
- `finance/` — Financial documentation
- `marketing/` — Marketing strategies and collateral
- `pipeline/` — Sales pipeline and business development
- `research/` — Technical research, spikes, and exploration

**Note:** There is also a `client/` directory (singular) that was created ad-hoc. The canonical location for client files is `clients/` (plural).

## Conventions

- All content is Markdown (`.md`)
- Filenames use **lowercase kebab-case** (e.g., `quarterly-review.md`)
- Meeting notes follow the pattern `YYYY-MM-DD-meeting-title-slug.md`
- Each directory may have its own `INDEX.md` describing its contents
- Client directories under `clients/` are named after the client organisation

## Key Skills

### kb-search (QMD CLI)
The primary tool for querying the knowledge base. Use `/kb-search` to find existing information **before** creating new content or answering questions about stored knowledge. QMD indexes the markdown files and supports keyword, semantic, and hybrid search.
```bash
qmd query "search term"          # Hybrid search (preferred default)
qmd search "term"                # Keyword search
qmd vsearch "concept"            # Semantic search
qmd collection add /path --name <name>  # Index a new directory
qmd embed                        # Generate embeddings after indexing
qmd update                       # Re-index after file changes
```

### meetings (Granola MCP)
Pulls meeting notes from Granola and saves them locally as markdown. Meeting files go in the relevant directory (e.g., `clients/Circuit/` for Circuit meetings, `operations/meetings/` for internal meetings).

## Agents

Worker agents are defined in `.claude/agents/` and can be invoked via the Task tool for autonomous work.

| Agent | Purpose |
|-------|---------|
| pmo-worker | PMO coordination, Jira sync, weekly planning |

Agents coordinate via:
- **Task tools** - TaskList, TaskCreate, TaskUpdate for work items
- **Shared state** - `operations/pmo/agent-activity.md` for visibility
- **Local files** - PMO markdown files for persistent state

See `.claude/agents/INDEX.md` for full documentation.

## When Adding Content

1. Place files in the correct domain directory
2. Use kebab-case filenames
3. Prefix date-specific docs (meetings, reports) with `YYYY-MM-DD-`
4. Update the parent `INDEX.md` if one exists
