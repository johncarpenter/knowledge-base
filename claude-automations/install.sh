#!/bin/bash
#
# Install/Uninstall Claude automation launchd agents
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHD_DIR="$HOME/Library/LaunchAgents"
PLIST_DIR="$SCRIPT_DIR/launchd"

# Ensure log directory exists
mkdir -p "$HOME/logs/claude-automations"

install_agent() {
    local name="$1"
    local plist="$PLIST_DIR/$name.plist"

    if [[ ! -f "$plist" ]]; then
        echo "Error: $plist not found"
        return 1
    fi

    echo "Installing $name..."
    cp "$plist" "$LAUNCHD_DIR/"
    launchctl load "$LAUNCHD_DIR/$name.plist"
    echo "  Installed and loaded: $name"
}

uninstall_agent() {
    local name="$1"
    local plist="$LAUNCHD_DIR/$name.plist"

    if [[ -f "$plist" ]]; then
        echo "Uninstalling $name..."
        launchctl unload "$plist" 2>/dev/null || true
        rm "$plist"
        echo "  Unloaded and removed: $name"
    else
        echo "  $name not installed"
    fi
}

status() {
    echo "Claude Automation Status:"
    echo ""
    for plist in "$PLIST_DIR"/*.plist; do
        name=$(basename "$plist" .plist)
        if launchctl list | grep -q "$name"; then
            echo "  $name: RUNNING"
        elif [[ -f "$LAUNCHD_DIR/$name.plist" ]]; then
            echo "  $name: INSTALLED (not running)"
        else
            echo "  $name: NOT INSTALLED"
        fi
    done
}

show_help() {
    cat << EOF
Claude Automation Installer

Usage: $(basename "$0") <command> [agent-name]

Commands:
    install <name>      Install and enable a specific agent
    install-all         Install all automation agents
    uninstall <name>    Disable and remove a specific agent
    uninstall-all       Remove all automation agents
    status              Show status of all agents
    run-now <name>      Manually trigger an agent (for testing)

Available agents:
    com.2lines.claude-morning   Daily digest at 7:30 AM
    com.2lines.claude-evening   Timesheet entries at 5:30 PM

Examples:
    $(basename "$0") install-all
    $(basename "$0") status
    $(basename "$0") run-now com.2lines.claude-morning
EOF
}

case "${1:-}" in
    install)
        if [[ -z "${2:-}" ]]; then
            echo "Error: specify agent name"
            exit 1
        fi
        install_agent "$2"
        ;;
    install-all)
        for plist in "$PLIST_DIR"/*.plist; do
            install_agent "$(basename "$plist" .plist)"
        done
        echo ""
        echo "All agents installed. Check status with: $0 status"
        ;;
    uninstall)
        if [[ -z "${2:-}" ]]; then
            echo "Error: specify agent name"
            exit 1
        fi
        uninstall_agent "$2"
        ;;
    uninstall-all)
        for plist in "$PLIST_DIR"/*.plist; do
            uninstall_agent "$(basename "$plist" .plist)"
        done
        ;;
    status)
        status
        ;;
    run-now)
        if [[ -z "${2:-}" ]]; then
            echo "Error: specify agent name"
            exit 1
        fi
        echo "Manually triggering $2..."
        launchctl start "$2"
        ;;
    -h|--help|"")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
