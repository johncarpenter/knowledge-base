# Exchange MCP Server

Minimal MCP server for reading Microsoft Exchange/Outlook mail via Microsoft Graph API. Designed for multi-tenant use with minimal permissions.

## Azure App Registration

### Step 1: Create the App

1. Go to [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations**
2. Click **New registration**
3. Configure:
   - **Name:** `Exchange MCP` (or similar)
   - **Supported account types:** Select **"Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)"**
   - **Redirect URI:** Select **Public client/native (mobile & desktop)** and enter:
     ```
     http://localhost:8765/callback
     ```
4. Click **Register**

### Step 2: Note Your App Details

After registration, note these values from the **Overview** page:
- **Application (client) ID** — You'll need this for config

### Step 3: Configure API Permissions

1. Go to **API permissions** → **Add a permission**
2. Select **Microsoft Graph** → **Delegated permissions**
3. Add these permissions:
   - `Mail.Read` — Read user mail
   - `User.Read` — Sign in and read user profile
4. Click **Add permissions**

> **Note:** Do NOT add any Application permissions. Delegated-only keeps this minimal and easier to approve.

### Step 4: Enable Public Client Flow

1. Go to **Authentication**
2. Scroll to **Advanced settings**
3. Set **Allow public client flows** to **Yes**
4. Click **Save**

### Step 5: Admin Consent (if required)

For some organizations, an admin must grant consent:
- Go to **API permissions**
- Click **Grant admin consent for [org]** (if you're an admin)
- Or share the consent URL with the org's admin

**Consent URL format:**
```
https://login.microsoftonline.com/common/adminconsent?client_id=YOUR_CLIENT_ID
```

---

## Installation

```bash
cd mcp/exchange-mcp
npm install
npm run build
```

## Configuration

Create `~/.config/exchange-mcp/config.json`:

```json
{
  "clientId": "YOUR_APPLICATION_CLIENT_ID",
  "accounts": {}
}
```

## Adding an Account

```bash
npm run auth -- add --name jot
```

This will:
1. Open your browser to the Microsoft login page
2. You sign in with your org credentials (e.g., john@jot.digital)
3. Consent to the permissions
4. Token is stored securely

## Usage with Claude Code

Add to your Claude Code MCP config (`~/.claude/settings.json` or project config):

```json
{
  "mcpServers": {
    "exchange": {
      "command": "node",
      "args": ["/path/to/exchange-mcp/dist/index.js"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `exchange_list_accounts` | List all authenticated accounts |
| `exchange_search` | Search emails (KQL syntax) |
| `exchange_get_message` | Get a single message by ID |
| `exchange_get_thread` | Get full conversation thread |
| `exchange_get_folders` | List mail folders |

## Search Query Examples

```
from:alice@example.com
subject:invoice
hasAttachments:true
received:2025-01-01..2025-01-31
isRead:false
from:boss@company.com AND subject:urgent
```

## Permissions Summary

| Permission | Type | Access |
|------------|------|--------|
| `Mail.Read` | Delegated | Read-only mail access |
| `User.Read` | Delegated | Basic profile info |

**No write access. No application permissions. User context only.**

## Troubleshooting

### "AADSTS65001: The user or administrator has not consented"
The org hasn't approved the app. Either:
- User self-consents (if org allows)
- Admin grants consent via the consent URL

### "AADSTS7000218: The request body must contain: client_secret"
Make sure **Allow public client flows** is set to **Yes** in Authentication settings.

### Token expired
Tokens auto-refresh. If issues persist, re-add the account:
```bash
npm run auth -- add --name jot --force
```
