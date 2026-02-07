# Zoho Projects MCP Server

Local MCP server for Zoho Projects time tracking with OAuth and automatic token refresh.

## Commands

- `npm run build` - Build TypeScript
- `npm run auth` - Authenticate with Zoho Projects (opens browser)
- `npm start` - Start MCP server

## Architecture

```
src/
├── cli.ts        # CLI entry point (auth/serve commands)
├── server.ts     # MCP server with tool definitions
├── auth.ts       # OAuth flow with local token storage
├── zoho-api.ts   # Zoho Projects API client
└── index.ts      # Package exports

credentials/
├── client_secrets.json  # OAuth client ID/secret (create manually)
└── token.json           # Access + refresh tokens (auto-generated)
```

## Token Flow

1. User runs `zoho-projects-mcp auth`
2. Browser opens for Zoho OAuth
3. Callback saves access + refresh tokens to `credentials/token.json`
4. On each API call, token expiry is checked
5. If expired, refresh token gets new access token automatically
6. Token file is updated with new expiry

## Adding Tools

Tools are defined in `server.ts` using the MCP SDK pattern:

```typescript
server.tool(
  "toolName",
  "Description",
  { param: z.string().describe("Parameter description") },
  async ({ param }) => {
    const result = await zohoApi.someMethod(param);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);
```

## Zoho Projects API

### Authentication Headers
```typescript
{
  "Authorization": `Zoho-oauthtoken ${accessToken}`,
  "Content-Type": "application/json"
}
```

Note: Uses `Zoho-oauthtoken` (not `Bearer`).

### Data Model
Portal → Projects → Tasks → Time Logs

### Key Endpoints
- `/portals` - Get all accessible portals
- `/portal/{id}/projects` - Get projects
- `/portal/{id}/projects/{projectId}/tasks` - Get tasks
- `/portal/{id}/projects/{projectId}/log` - Add time log
- `/portal/{id}/projects/{projectId}/logs` - Get time logs

## OAuth Scopes

Required scopes (configure in Zoho API Console):
- `aaaserver.profile.READ`
- `ZohoProjects.portals.ALL`
- `ZohoProjects.projects.ALL`
- `ZohoProjects.tasks.ALL`
- `ZohoProjects.users.ALL`
- `ZohoProjects.timesheets.ALL`

## Troubleshooting

1. **Token Expiration**: Tokens auto-refresh. If issues persist, re-run `npm run auth`.
2. **No Portal Found**: Ensure your Zoho account has a Zoho Projects portal created.
3. **Date Format**: Use YYYY-MM-DD format for dates (e.g., "2025-01-18").
4. **Rate Limits**: Zoho has rate limits. Implement appropriate error handling.

## Documentation Links

- [Zoho Projects API](https://www.zoho.com/projects/help/rest-api/projects-api.html)
- [Zoho OAuth Documentation](https://www.zoho.com/accounts/protocol/oauth.html)
- [MCP Protocol](https://modelcontextprotocol.io/)
