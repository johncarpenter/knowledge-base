---
name: kb-search
description: >
  Search, retrieve, and index local markdown knowledgebase files using the QMD CLI.
  Use this skill whenever the user wants to: search a local knowledgebase of markdown files,
  retrieve specific documents or passages from indexed collections, index or re-index a
  directory of .md files, check the status of the knowledge index, or perform any
  knowledge retrieval task against local documentation.
  Triggers: "search the knowledgebase", "find in docs", "index my files", "look up",
  "search notes", "retrieve document", "knowledge search", "what does the docs say about",
  "find information about", "re-index", "update the index".
---

# KB Search — QMD Knowledgebase Tool

Search, retrieve, and index local markdown knowledgebase files via the [QMD CLI](https://github.com/tobi/qmd). QMD is assumed to be installed and available on PATH.

## Workflow

### 1. First-Time Setup (Index a Directory)

When a user points to a new directory of markdown files, register it as a QMD collection and generate embeddings:

```bash
qmd collection add /path/to/docs --name <collection-name>
qmd embed
```

- Default glob is `**/*.md` — override with `--mask` if needed.
- Run `qmd embed -f` to force a full re-embed after significant content changes.
- Use `qmd status` to verify index health.

### 2. Searching

Choose the right search mode based on the query:

| Mode | Command | When to use |
|---|---|---|
| **Keyword** | `qmd search "term"` | Fast exact-match, known terminology |
| **Semantic** | `qmd vsearch "concept"` | Conceptual/fuzzy queries |
| **Hybrid** | `qmd query "question"` | Best overall quality (default choice) |

**Always prefer `qmd query`** unless the user needs speed or has a specific keyword.

Key flags:

- `-n <num>` — number of results (default 5)
- `-c <collection>` — restrict to a specific collection
- `--min-score <float>` — filter low-relevance results (0.0–1.0)
- `--json` — structured output, ideal for programmatic use
- `--full` — show complete document content in results
- `--md` — markdown-formatted output

Example — high-quality search with relevance filtering:

```bash
qmd query -n 10 --min-score 0.3 --json "user authentication"
```

### 3. Retrieving Documents

Fetch specific files or passages after identifying them via search:

```bash
qmd get <path-or-docid>                  # Full document
qmd get <path>:<line> -l <count>         # Specific line range
qmd multi-get "<glob-or-csv>"            # Multiple documents
```

- Use `#docid` syntax from search results for precise retrieval.
- Use `--max-bytes` with `multi-get` to skip oversized files.

### 4. Maintaining the Index

```bash
qmd update              # Re-index all collections after file changes
qmd status              # Check index health and stats
qmd cleanup             # Remove orphaned cache data
```

Run `qmd update` after any batch of file additions/removals. Follow with `qmd embed` if new files were added.

### 5. Working with Multiple Knowledge Bases

Use named indexes to keep separate domains isolated:

```bash
qmd --index <name> collection add /path --name <coll>
qmd --index <name> query "search term"
```

## Output Handling

- For presenting results to the user: use `--md` for readable output.
- For programmatic processing: use `--json` for structured data with snippets and scores.
- For file listings: use `--files` for `docid,score,filepath,context` format.

## Score Interpretation

| Range | Meaning |
|---|---|
| 0.8–1.0 | Highly relevant |
| 0.5–0.8 | Moderately relevant |
| 0.2–0.5 | Somewhat relevant |
| < 0.2 | Low relevance — consider filtering |

## Error Handling

- If `qmd` is not found: prompt user to install via `bun install -g github:tobi/qmd`.
- If search returns no results: try broadening the query, lowering `--min-score`, or using `qmd vsearch` for semantic matching.
- If embeddings are stale: run `qmd embed -f` to force refresh.

## Full CLI Reference

See [references/qmd-cli.md](references/qmd-cli.md) for the complete command reference including all flags and options.
