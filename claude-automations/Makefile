# Claude Code Automation Management
# Usage: make <target>
#
# Run `make help` for available commands

SHELL := /bin/bash
.DEFAULT_GOAL := help

# Paths
SCRIPT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
LAUNCHD_SRC := $(SCRIPT_DIR)launchd
LAUNCHD_DST := $(HOME)/Library/LaunchAgents
LOG_DIR := $(HOME)/logs/claude-automations

# Knowledge base root: relative to cwd (run make from repo root)
KB_ROOT ?= $(CURDIR)
MCP_DIR := $(KB_ROOT)/../mcp
KNOWLEDGE_BASE := $(KB_ROOT)

# Colors (use echo -e or printf %b so \033 is interpreted)
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
CYAN := \033[0;36m
NC := \033[0m # No Color
ECHO := echo -e

.PHONY: help
help: ## Show this help message
	@echo ""
	@$(ECHO) "$(CYAN)Claude Code Automation Management$(NC)"
	@echo ""
	@$(ECHO) "$(YELLOW)Workflows:$(NC)"
	@grep -E '^(run-|workflow-)' $(MAKEFILE_LIST) | grep -E ':.*?## ' | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@$(ECHO) "$(YELLOW)Scheduling (launchd):$(NC)"
	@grep -E '^(install|uninstall|status|enable|disable)' $(MAKEFILE_LIST) | grep -E ':.*?## ' | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@$(ECHO) "$(YELLOW)MCP Authentication:$(NC)"
	@grep -E '^auth-' $(MAKEFILE_LIST) | grep -E ':.*?## ' | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@$(ECHO) "$(YELLOW)MCP Management:$(NC)"
	@grep -E '^(mcp-|build-)' $(MAKEFILE_LIST) | grep -E ':.*?## ' | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@$(ECHO) "$(YELLOW)Utilities:$(NC)"
	@grep -E '^(logs|clean|test)' $(MAKEFILE_LIST) | grep -E ':.*?## ' | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ==============================================================================
# WORKFLOW COMMANDS
# ==============================================================================

.PHONY: run-morning
run-morning: ## Run morning workflow (daily digest)
	@$(SCRIPT_DIR)run-workflow.sh morning

.PHONY: run-evening
run-evening: ## Run evening workflow (timesheet)
	@$(SCRIPT_DIR)run-workflow.sh evening

.PHONY: run-weekly
run-weekly: ## Run weekly workflow
	@$(SCRIPT_DIR)run-workflow.sh weekly

.PHONY: run-test
run-test: ## Test that Claude automation works
	@$(SCRIPT_DIR)run-workflow.sh test

.PHONY: workflow-list
workflow-list: ## List available workflows
	@$(SCRIPT_DIR)run-workflow.sh --list

# ==============================================================================
# LAUNCHD SCHEDULING
# ==============================================================================

$(LOG_DIR):
	@mkdir -p $(LOG_DIR)

.PHONY: install
install: $(LOG_DIR) ## Install all scheduled automation agents
	@$(ECHO) "$(CYAN)Installing launchd agents...$(NC)"
	@for plist in $(LAUNCHD_SRC)/*.plist; do \
		name=$$(basename $$plist); \
		cp $$plist $(LAUNCHD_DST)/; \
		launchctl load $(LAUNCHD_DST)/$$name 2>/dev/null || true; \
		echo -e "  $(GREEN)✓$(NC) $$name"; \
	done
	@echo ""
	@$(ECHO) "$(GREEN)Done!$(NC) Run 'make status' to verify."

.PHONY: install-morning
install-morning: $(LOG_DIR) ## Install only morning agent
	@cp $(LAUNCHD_SRC)/com.2lines.claude-morning.plist $(LAUNCHD_DST)/
	@launchctl load $(LAUNCHD_DST)/com.2lines.claude-morning.plist
	@$(ECHO) "$(GREEN)✓$(NC) Morning agent installed"

.PHONY: install-evening
install-evening: $(LOG_DIR) ## Install only evening agent
	@cp $(LAUNCHD_SRC)/com.2lines.claude-evening.plist $(LAUNCHD_DST)/
	@launchctl load $(LAUNCHD_DST)/com.2lines.claude-evening.plist
	@$(ECHO) "$(GREEN)✓$(NC) Evening agent installed"

.PHONY: uninstall
uninstall: ## Uninstall all scheduled automation agents
	@$(ECHO) "$(CYAN)Uninstalling launchd agents...$(NC)"
	@for plist in $(LAUNCHD_SRC)/*.plist; do \
		name=$$(basename $$plist); \
		launchctl unload $(LAUNCHD_DST)/$$name 2>/dev/null || true; \
		rm -f $(LAUNCHD_DST)/$$name; \
		echo -e "  $(GREEN)✓$(NC) $$name removed"; \
	done

.PHONY: status
status: ## Show status of all launchd agents
	@$(ECHO) "$(CYAN)Claude Automation Status$(NC)"
	@echo ""
	@for plist in $(LAUNCHD_SRC)/*.plist; do \
		name=$$(basename $$plist .plist); \
		if launchctl list 2>/dev/null | grep -q $$name; then \
			echo -e "  $(GREEN)●$(NC) $$name: $(GREEN)RUNNING$(NC)"; \
		elif [ -f $(LAUNCHD_DST)/$$(basename $$plist) ]; then \
			echo -e "  $(YELLOW)○$(NC) $$name: $(YELLOW)LOADED$(NC) (not running)"; \
		else \
			echo -e "  $(RED)○$(NC) $$name: $(RED)NOT INSTALLED$(NC)"; \
		fi \
	done

.PHONY: enable-morning
enable-morning: ## Enable (start) morning agent
	@launchctl load $(LAUNCHD_DST)/com.2lines.claude-morning.plist 2>/dev/null || true
	@$(ECHO) "$(GREEN)✓$(NC) Morning agent enabled"

.PHONY: disable-morning
disable-morning: ## Disable (stop) morning agent
	@launchctl unload $(LAUNCHD_DST)/com.2lines.claude-morning.plist 2>/dev/null || true
	@$(ECHO) "$(YELLOW)○$(NC) Morning agent disabled"

.PHONY: enable-evening
enable-evening: ## Enable (start) evening agent
	@launchctl load $(LAUNCHD_DST)/com.2lines.claude-evening.plist 2>/dev/null || true
	@$(ECHO) "$(GREEN)✓$(NC) Evening agent enabled"

.PHONY: disable-evening
disable-evening: ## Disable (stop) evening agent
	@launchctl unload $(LAUNCHD_DST)/com.2lines.claude-evening.plist 2>/dev/null || true
	@$(ECHO) "$(YELLOW)○$(NC) Evening agent disabled"

# ==============================================================================
# MCP AUTHENTICATION
# ==============================================================================

.PHONY: auth-harvest
auth-harvest: ## Authenticate with Harvest (opens browser)
	@$(ECHO) "$(CYAN)Authenticating with Harvest...$(NC)"
	@cd $(MCP_DIR)/harvest-mcp-server && node dist/cli.js auth

.PHONY: auth-zoho
auth-zoho: ## Authenticate with Zoho Projects (opens browser)
	@$(ECHO) "$(CYAN)Authenticating with Zoho Projects...$(NC)"
	@cd $(MCP_DIR)/zohoprojects-mcp-server && node dist/cli.js auth

.PHONY: auth-exchange
auth-exchange: ## Authenticate with Exchange/Outlook (opens browser)
	@$(ECHO) "$(CYAN)Authenticating with Exchange...$(NC)"
	@cd $(MCP_DIR)/exchange-mcp && node dist/cli.js

.PHONY: auth-gmail
auth-gmail: ## Authenticate Gmail account (opens browser)
	@$(ECHO) "$(CYAN)Authenticating with Gmail...$(NC)"
	@echo "Usage: make auth-gmail ACCOUNT=personal"
	@echo ""
	@if [ -z "$(ACCOUNT)" ]; then \
		echo -e "$(RED)Error:$(NC) ACCOUNT is required"; \
		echo "Example: make auth-gmail ACCOUNT=personal"; \
		exit 1; \
	fi
	@cd $(MCP_DIR)/gmail-mcp && uv run gmail-mcp auth --account $(ACCOUNT)

.PHONY: auth-gmail-list
auth-gmail-list: ## List authenticated Gmail accounts
	@$(ECHO) "$(CYAN)Gmail Accounts:$(NC)"
	@ls -1 $(MCP_DIR)/gmail-mcp/credentials/*.json 2>/dev/null | \
		xargs -I {} basename {} _token.json | grep -v client_secrets || \
		echo "  No accounts authenticated"

.PHONY: auth-granola
auth-granola: ## Configure Granola API key
	@$(ECHO) "$(CYAN)Configuring Granola...$(NC)"
	@echo ""
	@if [ -z "$(API_KEY)" ]; then \
		echo "Usage: make auth-granola API_KEY=grn_xxxx..."; \
		echo ""; \
		echo "Get your API key from Granola:"; \
		echo "  Settings → Workspaces → API tab → Generate API Key"; \
		echo ""; \
		echo "Note: API access requires Enterprise plan and admin access."; \
		exit 1; \
	fi
	@cd $(MCP_DIR)/granola-mcp && node dist/cli.js configure --api-key $(API_KEY)

.PHONY: auth-granola-status
auth-granola-status: ## Check Granola configuration status
	@cd $(MCP_DIR)/granola-mcp && node dist/cli.js status

.PHONY: auth-all
auth-all: ## Run all auth flows (interactive)
	@$(ECHO) "$(CYAN)Running all authentication flows...$(NC)"
	@echo ""
	@echo "This will open browser windows for each service."
	@echo "Press Enter to continue or Ctrl+C to cancel."
	@read
	@$(MAKE) -s auth-harvest
	@echo ""
	@$(MAKE) -s auth-zoho
	@echo ""
	@$(MAKE) -s auth-exchange
	@echo ""
	@$(ECHO) "$(YELLOW)Note:$(NC) Gmail and Granola require additional parameters."
	@echo "  Gmail: make auth-gmail ACCOUNT=<name>"
	@echo "  Granola: make auth-granola API_KEY=<key>"

.PHONY: auth-status
auth-status: ## Check authentication status for all MCPs
	@$(ECHO) "$(CYAN)MCP Authentication Status$(NC)"
	@echo ""
	@$(ECHO) "$(YELLOW)Harvest:$(NC)"
	@if [ -f $(MCP_DIR)/harvest-mcp-server/credentials/token.json ]; then \
		echo -e "  $(GREEN)✓$(NC) Token exists"; \
	else \
		echo -e "  $(RED)✗$(NC) Not authenticated (run: make auth-harvest)"; \
	fi
	@echo ""
	@$(ECHO) "$(YELLOW)Zoho Projects:$(NC)"
	@if [ -f $(MCP_DIR)/zohoprojects-mcp-server/credentials/token.json ]; then \
		echo -e "  $(GREEN)✓$(NC) Token exists"; \
	else \
		echo -e "  $(RED)✗$(NC) Not authenticated (run: make auth-zoho)"; \
	fi
	@echo ""
	@$(ECHO) "$(YELLOW)Exchange:$(NC)"
	@if [ -f $(MCP_DIR)/exchange-mcp/credentials/token.json ]; then \
		echo -e "  $(GREEN)✓$(NC) Token exists"; \
	else \
		echo -e "  $(RED)✗$(NC) Not authenticated (run: make auth-exchange)"; \
	fi
	@echo ""
	@$(ECHO) "$(YELLOW)Gmail:$(NC)"
	@if ls $(MCP_DIR)/gmail-mcp/credentials/*_token.json 1>/dev/null 2>&1; then \
		echo -e "  $(GREEN)✓$(NC) Accounts:"; \
		ls -1 $(MCP_DIR)/gmail-mcp/credentials/*_token.json 2>/dev/null | \
			xargs -I {} basename {} _token.json | sed 's/^/    - /'; \
	else \
		echo -e "  $(RED)✗$(NC) No accounts (run: make auth-gmail ACCOUNT=<name>)"; \
	fi
	@echo ""
	@$(ECHO) "$(YELLOW)Granola:$(NC)"
	@cd $(MCP_DIR)/granola-mcp && node dist/cli.js status 2>/dev/null | sed 's/^/  /' || \
		echo -e "  $(RED)✗$(NC) Not configured"
	@echo ""
	@$(ECHO) "$(YELLOW)Calendar:$(NC)"
	@$(ECHO) "  $(GREEN)✓$(NC) Uses macOS Calendar (system permissions)"

# ==============================================================================
# MCP MANAGEMENT
# ==============================================================================

.PHONY: build-all
build-all: build-harvest build-zoho build-exchange build-granola build-gmail build-calendar ## Build all MCP servers

.PHONY: build-harvest
build-harvest: ## Build Harvest MCP server
	@$(ECHO) "$(CYAN)Building Harvest MCP...$(NC)"
	@cd $(MCP_DIR)/harvest-mcp-server && npm run build

.PHONY: build-zoho
build-zoho: ## Build Zoho Projects MCP server
	@$(ECHO) "$(CYAN)Building Zoho MCP...$(NC)"
	@cd $(MCP_DIR)/zohoprojects-mcp-server && npm run build

.PHONY: build-exchange
build-exchange: ## Build Exchange MCP server
	@$(ECHO) "$(CYAN)Building Exchange MCP...$(NC)"
	@cd $(MCP_DIR)/exchange-mcp && npm run build

.PHONY: build-granola
build-granola: ## Build Granola MCP server
	@$(ECHO) "$(CYAN)Building Granola MCP...$(NC)"
	@cd $(MCP_DIR)/granola-mcp && npm run build

.PHONY: build-gmail
build-gmail: ## Install Gmail MCP dependencies
	@$(ECHO) "$(CYAN)Installing Gmail MCP dependencies...$(NC)"
	@cd $(MCP_DIR)/gmail-mcp && uv sync

.PHONY: build-calendar
build-calendar: ## Install Calendar MCP dependencies
	@$(ECHO) "$(CYAN)Installing Calendar MCP dependencies...$(NC)"
	@cd $(MCP_DIR)/calendar-mcp && uv sync

.PHONY: mcp-status
mcp-status: ## Check if MCP servers are built/ready
	@$(ECHO) "$(CYAN)MCP Build Status$(NC)"
	@echo ""
	@$(ECHO) "$(YELLOW)Node.js MCPs:$(NC)"
	@for mcp in harvest-mcp-server zohoprojects-mcp-server exchange-mcp granola-mcp; do \
		if [ -d $(MCP_DIR)/$$mcp/dist ]; then \
			echo -e "  $(GREEN)✓$(NC) $$mcp"; \
		else \
			echo -e "  $(RED)✗$(NC) $$mcp (run: make build-$${mcp%%-mcp*})"; \
		fi \
	done
	@echo ""
	@$(ECHO) "$(YELLOW)Python MCPs:$(NC)"
	@for mcp in gmail-mcp calendar-mcp; do \
		if [ -d $(MCP_DIR)/$$mcp/.venv ]; then \
			echo -e "  $(GREEN)✓$(NC) $$mcp"; \
		else \
			echo -e "  $(RED)✗$(NC) $$mcp (run: make build-$${mcp%%-mcp})"; \
		fi \
	done

# ==============================================================================
# UTILITIES
# ==============================================================================

.PHONY: logs
logs: ## Show recent automation logs
	@$(ECHO) "$(CYAN)Recent Automation Logs$(NC)"
	@echo ""
	@if [ -f $(LOG_DIR)/runner.log ]; then \
		tail -30 $(LOG_DIR)/runner.log; \
	else \
		echo "No logs yet. Run a workflow first."; \
	fi

.PHONY: logs-morning
logs-morning: ## Show most recent morning workflow log
	@ls -t $(LOG_DIR)/daily-digest_*.log 2>/dev/null | head -1 | xargs cat 2>/dev/null || \
		echo "No morning logs found"

.PHONY: logs-evening
logs-evening: ## Show most recent evening workflow log
	@ls -t $(LOG_DIR)/timesheet_*.log 2>/dev/null | head -1 | xargs cat 2>/dev/null || \
		echo "No evening logs found"

.PHONY: logs-launchd
logs-launchd: ## Show launchd agent logs
	@$(ECHO) "$(CYAN)Launchd Morning Log:$(NC)"
	@tail -20 $(LOG_DIR)/launchd-morning.log 2>/dev/null || echo "  No log"
	@echo ""
	@$(ECHO) "$(CYAN)Launchd Evening Log:$(NC)"
	@tail -20 $(LOG_DIR)/launchd-evening.log 2>/dev/null || echo "  No log"

.PHONY: logs-follow
logs-follow: ## Follow runner log in real-time
	@tail -f $(LOG_DIR)/runner.log

.PHONY: clean-logs
clean-logs: ## Remove logs older than 7 days
	@$(ECHO) "$(CYAN)Cleaning old logs...$(NC)"
	@find $(LOG_DIR) -name "*.log" -mtime +7 -delete 2>/dev/null || true
	@$(ECHO) "$(GREEN)Done$(NC)"

.PHONY: test
test: run-test ## Alias for run-test
