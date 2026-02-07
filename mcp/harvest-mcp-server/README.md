# Harvest MCP Server

Local MCP server for Harvest time tracking with OAuth authentication and automatic token refresh.

## Features

- OAuth 2.0 authentication with local token storage
- Automatic token refresh (no manual re-authentication needed)
- Full Harvest API integration: projects, tasks, time entries, timers, reports

## Setup

### 1. Create Harvest OAuth App

1. Go to https://id.getharvest.com/oauth2/access_tokens/new
2. Create a new OAuth2 application
3. Set redirect URI to `http://localhost:8765/callback`
4. Note the Client ID and Client Secret

### 2. Configure Credentials

Create `credentials/client_secrets.json`:

```json
{
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET"
}
```

### 3. Install & Build

```bash
npm install
npm run build
```

### 4. Authenticate

```bash
npm run auth
# or
node dist/cli.js auth
```

This opens a browser for Harvest login. Tokens are saved to `credentials/token.json` and auto-refresh.

## Usage

### As MCP Server

Add to your Claude Code config (`.mcp.json`):

```json
{
  "mcpServers": {
    "harvest": {
      "command": "node",
      "args": ["/path/to/harvest-mcp-server/dist/cli.js", "serve"]
    }
  }
}
```

### Available Tools

| Tool | Description |
|------|-------------|
| `getCurrentUser` | Get current user info |
| `getProjects` | List active projects |
| `getTasks` | Get tasks for a project |
| `createTimeEntry` | Create a time entry |
| `getTimeEntries` | List time entries with filters |
| `getTimeReports` | Get time reports for date range |
| `startTimer` | Start a timer for a project |
| `stopTimer` | Stop the running timer |
| `getRunningTimer` | Get currently running timer |

## Token Management

Tokens are stored in `credentials/token.json` and include:
- Access token (short-lived, ~18 hours)
- Refresh token (long-lived)
- Expiration timestamp

The server automatically refreshes expired tokens before API calls. You should never need to re-authenticate unless you revoke access.

## Development

```bash
npm run dev    # Watch mode
npm run build  # Build once
```
