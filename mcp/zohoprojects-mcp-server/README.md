# Zoho Projects MCP Server

Local [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for Zoho Projects time tracking with OAuth authentication and automatic token refresh.

## Features

- OAuth 2.0 authentication with Zoho Projects
- Automatic token refresh when expired
- Local token storage (no external services required)
- Full access to Zoho Projects time tracking features

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create a Zoho OAuth App

1. Go to [Zoho API Console](https://api-console.zohocloud.ca) (or your region's console)
2. Click "Add Client" → "Server-based Applications"
3. Fill in:
   - **Client Name**: Your app name
   - **Homepage URL**: `http://localhost:8766`
   - **Authorized Redirect URIs**: `http://localhost:8766/callback`
4. Add scopes:
   - `aaaserver.profile.READ`
   - `ZohoProjects.portals.ALL`
   - `ZohoProjects.projects.ALL`
   - `ZohoProjects.tasks.ALL`
   - `ZohoProjects.users.ALL`
   - `ZohoProjects.timesheets.ALL`
5. Note your **Client ID** and **Client Secret**

### 3. Configure Credentials

Create `credentials/client_secrets.json`:

```json
{
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET"
}
```

### 4. Authenticate

```bash
npm run auth
```

This opens your browser for Zoho OAuth. After authentication, tokens are saved locally.

### 5. Build & Run

```bash
npm run build
npm start
```

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "zoho-projects": {
      "command": "node",
      "args": ["/path/to/zoho-projects-mcp-server/dist/cli.js", "serve"]
    }
  }
}
```

## Available Tools

### User & Portal Management

- **getCurrentUser** - Get current user information
- **getPortals** - Get all accessible portals

### Project Management

- **getProjects** - Get projects (filterable by status: active, archived, template, all)
- **getTasks** - Get tasks for a specific project

### Time Tracking

- **addTimeLog** - Add a time log entry
  - Supports both decimal hours (e.g., "2.5") and HH:MM format (e.g., "02:30")
  - Can log to specific task or general project time
- **getTimeLogs** - Get time logs with date range filters
- **startTimer** - Start a timer for a task
- **stopTimer** - Stop a running timer
- **getRunningTimer** - Get currently running timer

## Example Prompts

- "Show me all my active projects in Zoho"
- "Log 2 hours to project X for today"
- "What tasks are in the Development project?"
- "Start a timer for task ABC"
- "Get my time logs for this week"

## Development

```bash
npm run dev     # Watch mode for TypeScript
npm run build   # Compile TypeScript
npm run auth    # Re-authenticate with Zoho
npm start       # Start MCP server
```

## Regional Data Centers

By default, this uses the Canadian Zoho data center (`.zohocloud.ca`). To use a different region, modify the URLs in `src/auth.ts`:

- US: `.zoho.com`
- EU: `.zoho.eu`
- India: `.zoho.in`
- Australia: `.zoho.com.au`
- China: `.zoho.com.cn`

## License

MIT
