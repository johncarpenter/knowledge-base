# Gmail MCP Server

A Model Context Protocol (MCP) server that provides multi-account Gmail integration with search and summarization capabilities. Designed for use with Claude Code and other MCP-compatible AI assistants.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Guide](#setup-guide)
  - [Step 1: Google Cloud Project Setup](#step-1-google-cloud-project-setup)
  - [Step 2: Enable Gmail API](#step-2-enable-gmail-api)
  - [Step 3: Configure OAuth Consent Screen](#step-3-configure-oauth-consent-screen)
  - [Step 4: Create OAuth Credentials](#step-4-create-oauth-credentials)
  - [Step 5: Install the MCP Server](#step-5-install-the-mcp-server)
  - [Step 6: Authenticate Gmail Accounts](#step-6-authenticate-gmail-accounts)
  - [Step 7: Configure Claude Code](#step-7-configure-claude-code)
- [Usage](#usage)
  - [Available Tools](#available-tools)
  - [Gmail Search Syntax](#gmail-search-syntax)
  - [Example Workflows](#example-workflows)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Development](#development)
- [Architecture](#architecture)

---

## Overview

This MCP server connects your Gmail accounts to Claude Code, enabling you to:

- Search across multiple Gmail accounts using natural language or Gmail's query syntax
- Retrieve full email threads for context
- Get email content formatted for AI summarization
- Export email digests to your knowledge base

**What is MCP?** The Model Context Protocol is an open standard that allows AI assistants to securely connect to external data sources. This server implements MCP to expose Gmail operations as tools that Claude can invoke.

---

## Features

| Feature | Description |
|---------|-------------|
| **Multi-Account** | Configure multiple Gmail accounts (personal, work, etc.) and switch between them |
| **Full Search** | Use Gmail's powerful search operators (`from:`, `to:`, `subject:`, `after:`, `label:`, etc.) |
| **Thread Retrieval** | Fetch complete email conversations with all messages |
| **Summarization Ready** | Output formatted with prompts for AI-powered summarization |
| **Markdown Export** | Email content formatted as markdown for your knowledge base |
| **Read-Only** | Only requests read permissions — cannot send, delete, or modify emails |

---

## Prerequisites

Before starting, ensure you have:

- **Python 3.11+** installed
- **uv** package manager ([install guide](https://docs.astral.sh/uv/getting-started/installation/))
- **A Google account** with Gmail
- **Claude Code** or another MCP-compatible client

To verify prerequisites:

```bash
python3 --version   # Should be 3.11 or higher
uv --version        # Should show uv version
```

---

## Setup Guide

### Step 1: Google Cloud Project Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. **Create a new project** (or use an existing one):
   - Click the project dropdown at the top of the page
   - Click "New Project"
   - Enter a name (e.g., "Gmail MCP Server")
   - Click "Create"

3. **Wait for the project to be created**, then select it from the project dropdown

> **Tip:** If you're using Google Workspace, you may want to create the project under your organization for easier management.

### Step 2: Enable Gmail API

1. In the Google Cloud Console, go to **APIs & Services → Library**
   - Or navigate directly to: https://console.cloud.google.com/apis/library

2. Search for **"Gmail API"**

3. Click on **Gmail API** in the results

4. Click **"Enable"**

5. Wait for the API to be enabled (a few seconds)

### Step 3: Configure OAuth Consent Screen

Before creating credentials, you must configure the OAuth consent screen. This defines what users see when authenticating.

1. Go to **APIs & Services → OAuth consent screen**
   - Or: https://console.cloud.google.com/apis/credentials/consent

2. **Select User Type:**
   - **Internal** (recommended for Google Workspace users) — Only users in your organization can authenticate
   - **External** — Any Google account can authenticate (requires verification for production, but works immediately in "Testing" mode)

3. Click **"Create"**

4. **Fill in the App Information:**
   - **App name:** Gmail MCP Server
   - **User support email:** Your email address
   - **Developer contact email:** Your email address

5. Click **"Save and Continue"**

6. **Add Scopes:**
   - Click "Add or Remove Scopes"
   - Search for and select these scopes:
     - `https://www.googleapis.com/auth/gmail.readonly` — Read all email
     - `https://www.googleapis.com/auth/gmail.labels` — Read labels
   - Click "Update"

7. Click **"Save and Continue"**

8. **Add Test Users** (for External apps only):
   - Click "Add Users"
   - Enter the Gmail addresses you want to authenticate
   - Click "Add"

9. Click **"Save and Continue"**, then **"Back to Dashboard"**

> **Important:** For External apps, your app will be in "Testing" mode. This is fine for personal use — you don't need to submit for verification unless you want to distribute it publicly.

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
   - Or: https://console.cloud.google.com/apis/credentials

2. Click **"Create Credentials" → "OAuth client ID"**

3. **Select Application Type:** Desktop app

4. **Name:** Gmail MCP Client (or any name you prefer)

5. Click **"Create"**

6. **Download the credentials:**
   - A dialog will show your Client ID and Client Secret
   - Click **"Download JSON"**
   - Save the file somewhere accessible (e.g., `~/Downloads/client_secret_xxx.json`)

> **Keep this file secure!** It contains your OAuth client credentials. Never commit it to git or share it publicly.

### Step 5: Install the MCP Server

1. **Navigate to the MCP server directory:**

   ```bash
   cd /Users/john/Documents/Workspace/2Lines/knowledge-base/mcp/gmail-mcp
   ```

2. **Install dependencies using uv:**

   ```bash
   uv sync
   ```

   This creates a virtual environment and installs all required packages.

3. **Verify the installation:**

   ```bash
   uv run gmail-mcp --help
   ```

   You should see the help message with available commands.

### Step 6: Authenticate Gmail Accounts

For each Gmail account you want to access:

1. **Run the auth command:**

   ```bash
   # First account — provide the credentials file
   uv run gmail-mcp auth --account personal --credentials-file ~/Downloads/client_secret_xxx.json

   # Additional accounts — reuse the same credentials file
   uv run gmail-mcp auth --account work --credentials-file ~/Downloads/client_secret_xxx.json
   ```

   Replace `personal` and `work` with meaningful names for your accounts.

2. **Complete OAuth flow:**
   - A browser window will open automatically
   - Sign in with the Gmail account you want to connect
   - Review the permissions and click "Allow"
   - The browser will show "The authentication flow has completed" — you can close it

3. **Verify authentication:**

   ```bash
   ls credentials/
   ```

   You should see a directory for each account (e.g., `personal/`, `work/`).

> **Tip:** Account names are just labels — use whatever makes sense to you (e.g., `john-personal`, `2lines-work`, `client-acme`).

### Step 7: Configure Claude Code

1. **Open your Claude Code settings:**

   ```bash
   # Using your preferred editor
   code ~/.claude/settings.json
   # or
   nano ~/.claude/settings.json
   ```

2. **Add the Gmail MCP server configuration:**

   ```json
   {
     "mcpServers": {
       "gmail": {
         "command": "uv",
         "args": [
           "run",
           "--directory",
           "/Users/john/Documents/Workspace/2Lines/knowledge-base/mcp/gmail-mcp",
           "gmail-mcp"
         ]
       }
     }
   }
   ```

   If you already have other MCP servers configured, add `gmail` to the existing `mcpServers` object.

3. **Restart Claude Code** to load the new server

4. **Verify the connection:**
   - Open Claude Code
   - The Gmail tools should now be available
   - Try: "List my Gmail accounts" — Claude should use `gmail_list_accounts`

---

## Usage

### Available Tools

| Tool | Description | Required Parameters |
|------|-------------|---------------------|
| `gmail_list_accounts` | List all authenticated Gmail accounts | None |
| `gmail_search` | Search emails using Gmail query syntax | `account`, `query` |
| `gmail_get_thread` | Retrieve a complete email thread | `account`, `thread_id` |
| `gmail_summarize` | Get thread content formatted for summarization | `account`, `thread_id` |
| `gmail_get_labels` | List all labels/folders for an account | `account` |

### Gmail Search Syntax

The `gmail_search` tool uses Gmail's native search syntax. Here's a quick reference:

#### Basic Operators

| Operator | Example | Description |
|----------|---------|-------------|
| `from:` | `from:alice@example.com` | Emails from a specific sender |
| `to:` | `to:bob@example.com` | Emails to a specific recipient |
| `subject:` | `subject:invoice` | Emails with word in subject |
| `label:` | `label:important` | Emails with a specific label |
| `is:` | `is:unread`, `is:starred` | Email state filters |
| `has:` | `has:attachment` | Emails with attachments |

#### Date Filters

| Operator | Example | Description |
|----------|---------|-------------|
| `after:` | `after:2025/01/01` | Emails after a date |
| `before:` | `before:2025/02/01` | Emails before a date |
| `older_than:` | `older_than:7d` | Emails older than period (d/m/y) |
| `newer_than:` | `newer_than:2d` | Emails newer than period |

#### Advanced Operators

| Operator | Example | Description |
|----------|---------|-------------|
| `filename:` | `filename:pdf` | Attachments by file type |
| `larger:` | `larger:5M` | Emails larger than size |
| `smaller:` | `smaller:1M` | Emails smaller than size |
| `in:` | `in:inbox`, `in:sent` | Location filter |
| `category:` | `category:primary` | Gmail category |

#### Combining Operators

```
# Emails from Alice in the last week with attachments
from:alice@example.com newer_than:7d has:attachment

# Unread emails in inbox about invoices
is:unread in:inbox subject:invoice

# Large emails from a specific domain
from:@bigcorp.com larger:10M

# Emails between two dates
after:2025/01/01 before:2025/01/31 from:client@example.com
```

### Example Workflows

#### 1. Daily Email Digest

Ask Claude:
> "Search my work email for unread messages from today and summarize the important ones"

Claude will:
1. Use `gmail_search` with `account="work"` and `query="is:unread newer_than:1d"`
2. Review the results and identify important threads
3. Use `gmail_summarize` on key threads
4. Provide a digest of action items and key information

#### 2. Find a Specific Conversation

Ask Claude:
> "Find the email thread with Acme Corp about the Q4 proposal"

Claude will:
1. Use `gmail_search` with `query="from:@acmecorp.com subject:Q4 proposal"`
2. Use `gmail_get_thread` to retrieve the full conversation
3. Present the relevant information

#### 3. Export Meeting Follow-ups

Ask Claude:
> "Find all emails from last week mentioning 'action items' or 'follow up' and save a summary to my knowledge base"

Claude will:
1. Search across accounts for relevant emails
2. Summarize each thread
3. Format as markdown and save to the appropriate location

#### 4. Client Communication Summary

Ask Claude:
> "Give me a summary of all communication with client@example.com in January"

Claude will:
1. Use `gmail_search` with date filters
2. Retrieve and summarize threads
3. Provide a chronological overview of the relationship

---

## Troubleshooting

### "Account not authenticated" Error

**Symptom:** `AuthError: Account 'work' not authenticated`

**Solution:** Run the auth command for that account:
```bash
uv run gmail-mcp auth --account work --credentials-file /path/to/client_secret.json
```

### "Invalid credentials" Error

**Symptom:** `AuthError: Invalid credentials for 'personal'`

**Cause:** The OAuth token has expired and couldn't be refreshed.

**Solution:** Re-authenticate the account:
```bash
uv run gmail-mcp auth --account personal
```

### Browser Doesn't Open During Auth

**Symptom:** Auth command hangs without opening a browser

**Solution:**
1. Check if you're running in a headless environment
2. If so, you'll need to authenticate on a machine with a browser, then copy the `credentials/<account>/` directory

### "Access Denied" or "App Not Verified"

**Symptom:** Google shows a warning about unverified app

**Solution:** This is expected for External apps in Testing mode:
1. Click "Advanced" on the warning screen
2. Click "Go to [App Name] (unsafe)"
3. Review and allow the permissions

### Gmail Tools Not Appearing in Claude

**Symptom:** Claude doesn't recognize Gmail commands

**Solutions:**
1. Verify the server is in settings.json:
   ```bash
   cat ~/.claude/settings.json | grep gmail
   ```
2. Check for JSON syntax errors in settings.json
3. Restart Claude Code completely
4. Check server logs:
   ```bash
   uv run mcp dev src/gmail_mcp/server.py
   ```

### Rate Limiting

**Symptom:** Errors mentioning quota or rate limits

**Cause:** Gmail API has usage quotas (typically 250 quota units per user per second)

**Solution:**
- Reduce `max_results` in searches
- Wait a few seconds between large operations
- For heavy usage, request quota increase in Google Cloud Console

---

## Security Considerations

### Permissions

This server only requests **read-only** access:
- `gmail.readonly` — Read email content and metadata
- `gmail.labels` — Read label information

It **cannot**:
- Send emails
- Delete emails
- Modify emails or labels
- Access contacts or calendar

### Credential Storage

- OAuth tokens are stored in `credentials/<account>/token.json`
- Client secrets are stored in `credentials/<account>/client_secrets.json`
- The `credentials/` directory is gitignored by default
- **Never commit credentials to version control**

### Token Refresh

- Tokens automatically refresh when expired
- If refresh fails, you'll need to re-authenticate
- Tokens remain valid as long as you don't revoke access

### Revoking Access

To revoke this server's access to your Gmail:
1. Go to [Google Account Security](https://myaccount.google.com/permissions)
2. Find "Gmail MCP Server" (or your app name)
3. Click "Remove Access"

You can also delete local credentials:
```bash
rm -rf credentials/<account>/
```

---

## Development

### Running in Development Mode

The MCP inspector provides a UI for testing tools:

```bash
uv run mcp dev src/gmail_mcp/server.py
```

### Running Tests

```bash
uv run pytest
```

### Linting and Formatting

```bash
# Check for issues
uv run ruff check src/

# Auto-fix issues
uv run ruff check --fix src/

# Format code
uv run ruff format src/
```

### Adding New Tools

1. Define the tool schema in `tools.py` within `list_tools()`
2. Implement the handler in `call_tool()`
3. Add any new Gmail API methods to `gmail.py`

---

## Architecture

```
gmail-mcp/
├── src/gmail_mcp/
│   ├── __init__.py      # Package metadata
│   ├── server.py        # MCP server entry point and CLI
│   ├── auth.py          # Multi-account OAuth management
│   ├── gmail.py         # Gmail API client wrapper
│   └── tools.py         # MCP tool definitions and handlers
├── credentials/         # OAuth tokens (gitignored)
│   ├── personal/
│   │   ├── client_secrets.json
│   │   └── token.json
│   └── work/
│       ├── client_secrets.json
│       └── token.json
├── pyproject.toml       # Dependencies and build config
├── README.md            # This file
└── .gitignore           # Excludes credentials
```

### Data Flow

```
Claude Code
    ↓ MCP Protocol (stdio)
gmail-mcp/server.py
    ↓ Tool dispatch
gmail-mcp/tools.py
    ↓ Gmail operations
gmail-mcp/gmail.py
    ↓ Google API
Gmail API
```

### Key Classes

- **`AuthManager`** — Handles OAuth flows and token storage for multiple accounts
- **`GmailClient`** — Wraps the Gmail API with convenient methods
- **`EmailMessage`** / **`EmailThread`** — Data classes with markdown formatting

---

## License

MIT License — See [LICENSE](./LICENSE) for details.
