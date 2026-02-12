#!/bin/bash
#
# Claude Code Workflow Runner
# Usage: run-workflow.sh <workflow-name>
#
# Workflows are defined as functions below. Each workflow can chain
# multiple Claude commands with dependencies and error handling.
#

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${HOME}/logs/claude-automations"
CLAUDE_BIN="${CLAUDE_BIN:-/opt/homebrew/bin/claude}"
KNOWLEDGE_BASE="${HOME}/Documents/Workspace/2Lines/knowledge-base"

# Load environment variables required by MCP servers
# (Jira, Slack, etc. need API tokens from .env)
if [[ -f "$KNOWLEDGE_BASE/.env" ]]; then
    # shellcheck source=/dev/null
    source "$KNOWLEDGE_BASE/.env"
fi

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Timestamp for this run
RUN_ID=$(date +%Y-%m-%d_%H%M%S)

# Logging helper
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_DIR/runner.log"
}

# Run a Claude command with logging
run_claude() {
    local name="$1"
    local prompt="$2"
    local log_file="$LOG_DIR/${name}_${RUN_ID}.log"

    log "Starting: $name"

    if $CLAUDE_BIN -p "$prompt" \
        --dangerously-skip-permissions \
        --output-format text \
        2>&1 | tee "$log_file"; then
        log "Completed: $name"
        return 0
    else
        log "FAILED: $name (see $log_file)"
        return 1
    fi
}

# Run Claude in a specific directory
run_claude_in() {
    local dir="$1"
    local name="$2"
    local prompt="$3"
    local log_file="$LOG_DIR/${name}_${RUN_ID}.log"

    log "Starting: $name (in $dir)"

    if (cd "$dir" && $CLAUDE_BIN -p "$prompt" \
        --dangerously-skip-permissions \
        --output-format text \
        2>&1 | tee "$log_file"); then
        log "Completed: $name"
        return 0
    else
        log "FAILED: $name (see $log_file)"
        return 1
    fi
}

# ============================================================================
# WORKFLOWS
# Define your workflows as functions here
# ============================================================================

workflow_morning() {
    log "=== Starting Morning Workflow ==="

    # Step 1: Generate daily digest (emails, meetings, calendar)
    run_claude_in "$KNOWLEDGE_BASE" "daily-digest" "/daily-digest"

    # Step 2: Any follow-up tasks could go here
    # run_claude "task-name" "prompt"

    log "=== Morning Workflow Complete ==="
}

workflow_evening() {
    log "=== Starting Evening Workflow ==="

    # Step 1: Backup today's Granola meeting notes to local markdown
    run_claude_in "$KNOWLEDGE_BASE" "meeting-backup" "/meeting-backup"

    # Step 2: Summarize today's emails
    run_claude_in "$KNOWLEDGE_BASE" "email-summary" "/email-summary"

    # Step 3: Create timesheet entries from today's calendar
    run_claude_in "$KNOWLEDGE_BASE" "timesheet" "/time-entry-from-calendar"

    # Step 4: Re-index knowledge base with new content
    log "Starting: qmd-reindex"
    if (cd "$KNOWLEDGE_BASE" && qmd update && qmd embed); then
        log "Completed: qmd-reindex"
    else
        log "FAILED: qmd-reindex"
    fi

    log "=== Evening Workflow Complete ==="
}

workflow_weekly() {
    log "=== Starting Weekly Workflow ==="

    # Add weekly tasks here (e.g., weekly summary, invoice prep)
    # run_claude_in "$KNOWLEDGE_BASE" "weekly-summary" "/weekly-summary"

    log "=== Weekly Workflow Complete ==="
}

# Test workflow - useful for verifying setup
workflow_test() {
    log "=== Test Workflow ==="
    run_claude "test" "Say 'Claude automation is working!' and nothing else."
    log "=== Test Complete ==="
}

# ============================================================================
# MAIN
# ============================================================================

show_help() {
    cat << EOF
Claude Code Workflow Runner

Usage: $(basename "$0") <workflow>

Available workflows:
    morning     Daily digest (emails, meetings, calendar)
    evening     Backup meetings, email summary, timesheet, re-index KB
    weekly      Weekly summary and tasks
    test        Verify automation is working

Options:
    -h, --help  Show this help message
    -l, --list  List available workflows

Logs are written to: $LOG_DIR

Examples:
    $(basename "$0") morning
    $(basename "$0") test
EOF
}

list_workflows() {
    echo "Available workflows:"
    declare -F | grep 'workflow_' | sed 's/declare -f workflow_/  - /'
}

# Parse arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -l|--list)
        list_workflows
        exit 0
        ;;
    morning|evening|weekly|test)
        workflow_"$1"
        ;;
    "")
        echo "Error: No workflow specified"
        show_help
        exit 1
        ;;
    *)
        echo "Error: Unknown workflow '$1'"
        list_workflows
        exit 1
        ;;
esac
