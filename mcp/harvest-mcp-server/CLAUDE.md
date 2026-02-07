# Harvest MCP Server

Local MCP server for Harvest time tracking with OAuth and automatic token refresh.

## Commands

- `npm run build` - Build TypeScript
- `npm run auth` - Authenticate with Harvest (opens browser)
- `npm start` - Start MCP server

## Architecture

```
src/
├── cli.ts        # CLI entry point (auth/serve commands)
├── server.ts     # MCP server with tool definitions
├── auth.ts       # OAuth flow with local token storage
├── harvest-api.ts # Harvest API client
└── index.ts      # Package exports

credentials/
├── client_secrets.json  # OAuth client ID/secret (create manually)
└── token.json           # Access + refresh tokens (auto-generated)
```

## Token Flow

1. User runs `harvest-mcp auth`
2. Browser opens for Harvest OAuth
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
    const result = await harvestApi.someMethod(param);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);
```
