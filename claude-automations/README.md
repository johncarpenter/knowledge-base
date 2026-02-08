# Claude Code Automations

Scheduled workflows for Claude Code tasks.

## Quick Start

```bash
# Show all available commands
make help

# Check MCP auth status
make auth-status

# Test that automation works
make test

# Run morning workflow manually
make run-morning

# Install scheduled automation
make install

# Check launchd status
make status
```

## MCP Authentication

```bash
# Check which MCPs need auth
make auth-status

# Authenticate individual services
make auth-harvest      # Opens browser for Harvest OAuth
make auth-zoho         # Opens browser for Zoho OAuth
make auth-exchange     # Opens browser for Exchange OAuth

# Gmail requires account name
make auth-gmail ACCOUNT=personal
make auth-gmail ACCOUNT=work
make auth-gmail-list   # Show authenticated accounts

# Granola requires API key
make auth-granola API_KEY=grn_xxxx...
make auth-granola-status

# Run all OAuth flows (interactive)
make auth-all
```

## Building MCPs

```bash
# Check build status
make mcp-status

# Build all MCP servers
make build-all

# Build individual servers
make build-harvest
make build-zoho
make build-exchange
make build-granola
make build-gmail      # Python - runs uv sync
make build-calendar   # Python - runs uv sync
```

## Structure

```
claude-automations/
├── Makefile            # All management commands (make help)
├── run-workflow.sh     # Main workflow runner (edit to add workflows)
├── install.sh          # Legacy installer (use Makefile instead)
├── launchd/            # launchd plist files
│   ├── com.2lines.qmd-indexer.plist
│   ├── com.2lines.claude-morning.plist
│   ├── com.2lines.granola-reminder.plist
│   └── com.2lines.claude-evening.plist
└── README.md
```

## Daily Schedule

| Time | Agent | What it does |
|------|-------|--------------|
| 3:30 AM | `qmd-indexer` | Re-indexes knowledge base (`qmd update && qmd embed`) |
| 4:00 AM | `claude-morning` | Runs `/daily-digest` workflow |
| 7:00 PM | `granola-reminder` | macOS notification to check Granola auth |
| 8:00 PM | `claude-evening` | Runs `/time-entry-from-calendar` workflow |

## Workflows

| Workflow | Schedule | What it does |
|----------|----------|--------------|
| `morning` | 4:00 AM daily | Runs `/daily-digest` |
| `evening` | 8:00 PM daily | Runs `/time-entry-from-calendar` |
| `weekly` | (not scheduled) | Placeholder for weekly tasks |
| `test` | Manual only | Verifies automation works |

## Scheduling (launchd)

```bash
# Install all scheduled agents
make install

# Install individual agents
make install-indexer    # QMD indexer (3:30 AM)
make install-morning    # Daily digest (4:00 AM)
make install-reminder   # Granola auth reminder (7:00 PM)
make install-evening    # Timesheet (8:00 PM)

# Check status
make status

# Enable/disable without uninstalling
make disable-morning
make enable-morning
make disable-indexer
make enable-indexer

# Remove all scheduled agents
make uninstall
```

## Customizing Workflows

Edit `run-workflow.sh` to modify workflows. Each workflow is a function:

```bash
workflow_morning() {
    log "=== Starting Morning Workflow ==="

    # Run commands in sequence
    run_claude_in "$KNOWLEDGE_BASE" "step1" "/daily-digest"
    run_claude_in "$KNOWLEDGE_BASE" "step2" "/some-other-skill"

    # Conditional logic
    if some_condition; then
        run_claude "optional-step" "do something"
    fi

    log "=== Morning Workflow Complete ==="
}
```

## Logs

Logs are written to `~/logs/claude-automations/`:
- `runner.log` - Summary of all workflow runs
- `<task>_<timestamp>.log` - Detailed output from each Claude command
- `launchd-*.log` - launchd stdout/stderr

## Troubleshooting

**Workflow doesn't run at scheduled time:**
- Check if laptop was asleep: `./install.sh status`
- Check launchd logs: `cat ~/logs/claude-automations/launchd-morning.log`
- Verify agent is loaded: `launchctl list | grep 2lines`

**Claude command fails:**
- Check task-specific log in `~/logs/claude-automations/`
- Run manually: `./run-workflow.sh morning`
- Test Claude: `claude -p "hello"`

**Environment issues:**
- launchd runs with minimal environment
- Edit plist `EnvironmentVariables` if Claude needs specific vars
