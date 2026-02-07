# QMD CLI Reference

Complete command reference for the QMD search engine CLI.

## Table of Contents

- Collection Management
- Context Descriptions
- Embedding
- Search Commands
- Document Retrieval
- Index Maintenance
- Named Indexes
- MCP Integration

---

## Collection Management

```
qmd collection add <path> --name <name> [--mask <glob>]
qmd collection list
qmd collection remove <name>
qmd collection rename <old> <new>
qmd ls <collection>
```

- `--mask` defaults to `**/*.md`
- `qmd ls` lists all files in a collection

## Context Descriptions

Provide semantic context to improve search quality:

```
qmd context add qmd://<collection>[/path] "<description>"
qmd context list
qmd context rm qmd://<collection>[/path]
```

## Embedding

```
qmd embed           # Process unembedded docs (800 token chunks, 15% overlap)
qmd embed -f        # Force full re-embed
```

Models auto-download on first run (~2GB total):
- embedding-gemma-300M (~300MB)
- qwen3-reranker-0.6b (~640MB)
- qmd-query-expansion-1.7B (~1.1GB)

## Search Commands

### BM25 Full-Text Search
```
qmd search "<query>" [options]
```

### Vector Semantic Search
```
qmd vsearch "<query>" [options]
```

### Hybrid Query (recommended)
```
qmd query "<query>" [options]
```
Combines FTS + vectors + query expansion + reranking.

### Common Search Options

| Flag | Description | Default |
|---|---|---|
| `-n <num>` | Number of results | 5 (20 for --files/--json) |
| `-c, --collection <name>` | Restrict to collection | all |
| `--all` | Return all matches | off |
| `--min-score <num>` | Relevance threshold | 0 |
| `--full` | Show complete content | off |
| `--line-numbers` | Add line numbers | off |

### Output Format Flags

| Flag | Format |
|---|---|
| `--json` | Structured JSON with snippets |
| `--files` | `docid,score,filepath,context` |
| `--csv` | Comma-separated values |
| `--md` | Markdown |
| `--xml` | XML |

## Document Retrieval

### Single Document
```
qmd get <path-or-docid>
qmd get "#<docid>"
qmd get <path>:<line> -l <count>
qmd get <path> --from <line>
qmd get <path> -l <count>
```

### Multiple Documents
```
qmd multi-get "<glob-or-csv>" [options]
```

| Flag | Description |
|---|---|
| `-l <num>` | Max lines per file |
| `--max-bytes <num>` | Skip files above size (default 10KB) |
| `--json` | JSON output |

## Index Maintenance

```
qmd status              # Index health and collection info
qmd update              # Re-index all collections
qmd update --pull       # Re-index after git pull
qmd cleanup             # Remove cache and orphaned data
```

## Named Indexes

Separate knowledge bases using the `--index` flag:

```
qmd --index <name> <command> [args...]
```

Example:
```
qmd --index work collection add ~/work-docs --name docs
qmd --index work query "quarterly reports"
```

## Data Storage

- Index: `~/.cache/qmd/index.sqlite`
- Models: `~/.cache/qmd/models/`

## MCP Integration

QMD exposes an MCP server for Claude integration:

```bash
qmd mcp
```

Exposed tools: `qmd_search`, `qmd_vsearch`, `qmd_query`, `qmd_get`, `qmd_multi_get`, `qmd_status`.
