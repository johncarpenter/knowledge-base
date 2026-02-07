/**
 * OAuth authentication for Harvest with local token storage.
 * Tokens are stored locally and refreshed automatically.
 */

import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const HARVEST_AUTH_URL = "https://id.getharvest.com/oauth2/authorize";
const HARVEST_TOKEN_URL = "https://id.getharvest.com/api/v2/oauth2/token";
const HARVEST_ACCOUNTS_URL = "https://id.getharvest.com/api/v2/accounts";

export interface HarvestCredentials {
  clientId: string;
  clientSecret: string;
}

export interface HarvestToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  accountId: string;
  accountName: string;
  userId: string;
  userName: string;
  email: string;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthManager {
  private credentialsDir: string;

  constructor(credentialsDir?: string) {
    this.credentialsDir = credentialsDir || join(__dirname, "..", "credentials");
  }

  private get tokenPath(): string {
    return join(this.credentialsDir, "token.json");
  }

  private get clientSecretsPath(): string {
    return join(this.credentialsDir, "client_secrets.json");
  }

  /**
   * Check if credentials are configured
   */
  async hasCredentials(): Promise<boolean> {
    return existsSync(this.tokenPath);
  }

  /**
   * Load client credentials from file
   */
  async getClientCredentials(): Promise<HarvestCredentials> {
    if (!existsSync(this.clientSecretsPath)) {
      throw new AuthError(
        `No client secrets found. Create ${this.clientSecretsPath} with:\n` +
        `{\n  "clientId": "YOUR_CLIENT_ID",\n  "clientSecret": "YOUR_CLIENT_SECRET"\n}\n\n` +
        `Get these from https://id.getharvest.com/oauth2/access_tokens/new`
      );
    }

    const data = await readFile(this.clientSecretsPath, "utf-8");
    const parsed = JSON.parse(data);

    if (!parsed.clientId || !parsed.clientSecret) {
      throw new AuthError("client_secrets.json must contain clientId and clientSecret");
    }

    return parsed as HarvestCredentials;
  }

  /**
   * Get valid credentials, refreshing if needed
   */
  async getToken(): Promise<HarvestToken> {
    if (!existsSync(this.tokenPath)) {
      throw new AuthError("Not authenticated. Run: harvest-mcp auth");
    }

    const data = await readFile(this.tokenPath, "utf-8");
    const token = JSON.parse(data) as HarvestToken;

    // Check if token is expired (with 5 minute buffer)
    const now = Date.now();
    if (token.expiresAt && token.expiresAt < now + 5 * 60 * 1000) {
      return await this.refreshToken(token);
    }

    return token;
  }

  /**
   * Refresh an expired token
   */
  private async refreshToken(token: HarvestToken): Promise<HarvestToken> {
    const credentials = await this.getClientCredentials();

    const response = await fetch(HARVEST_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Harvest MCP Server",
      },
      body: new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        refresh_token: token.refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new AuthError(`Failed to refresh token: ${error}`);
    }

    const tokenData = await response.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    const newToken: HarvestToken = {
      ...token,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };

    await this.saveToken(newToken);
    console.error("Token refreshed successfully");
    return newToken;
  }

  /**
   * Save token to file
   */
  private async saveToken(token: HarvestToken): Promise<void> {
    await mkdir(this.credentialsDir, { recursive: true });
    await writeFile(this.tokenPath, JSON.stringify(token, null, 2));
  }

  /**
   * Run OAuth flow to authenticate
   */
  async authenticate(): Promise<HarvestToken> {
    const credentials = await this.getClientCredentials();

    // Start local server for callback
    const port = 8765;
    const redirectUri = `http://localhost:${port}/callback`;

    return new Promise((resolve, reject) => {
      const server = createServer(async (req, res) => {
        const url = new URL(req.url || "/", `http://localhost:${port}`);

        if (url.pathname === "/callback") {
          const code = url.searchParams.get("code");
          const error = url.searchParams.get("error");

          if (error) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`<html><body><h1>Error</h1><p>${error}</p></body></html>`);
            server.close();
            reject(new AuthError(`OAuth error: ${error}`));
            return;
          }

          if (!code) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`<html><body><h1>Error</h1><p>Missing authorization code</p></body></html>`);
            server.close();
            reject(new AuthError("Missing authorization code"));
            return;
          }

          try {
            // Exchange code for token
            const tokenResponse = await fetch(HARVEST_TOKEN_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Harvest MCP Server",
              },
              body: new URLSearchParams({
                client_id: credentials.clientId,
                client_secret: credentials.clientSecret,
                code: code,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
              }).toString(),
            });

            if (!tokenResponse.ok) {
              const errorText = await tokenResponse.text();
              throw new Error(`Token exchange failed: ${errorText}`);
            }

            const tokenData = await tokenResponse.json() as {
              access_token: string;
              refresh_token: string;
              expires_in: number;
            };

            // Fetch account info
            const accountsResponse = await fetch(HARVEST_ACCOUNTS_URL, {
              headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                "User-Agent": "Harvest MCP Server",
              },
            });

            if (!accountsResponse.ok) {
              throw new Error("Failed to fetch account info");
            }

            const accountsData = await accountsResponse.json() as {
              accounts: Array<{ id: number; name: string }>;
              user: { id: number; first_name: string; last_name: string; email: string };
            };

            const user = accountsData.user;
            const account = accountsData.accounts[0];

            const token: HarvestToken = {
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              expiresAt: Date.now() + tokenData.expires_in * 1000,
              accountId: account?.id.toString() || "",
              accountName: account?.name || "",
              userId: user.id.toString(),
              userName: `${user.first_name} ${user.last_name}`,
              email: user.email,
            };

            await this.saveToken(token);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(`
              <html>
                <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                  <h1>Authentication Successful!</h1>
                  <p>Logged in as <strong>${token.userName}</strong> (${token.email})</p>
                  <p>Account: <strong>${token.accountName}</strong></p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);

            server.close();
            resolve(token);
          } catch (err) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end(`<html><body><h1>Error</h1><p>${err}</p></body></html>`);
            server.close();
            reject(err);
          }
        } else {
          res.writeHead(404);
          res.end("Not found");
        }
      });

      server.listen(port, async () => {
        // Build authorization URL
        const authUrl = new URL(HARVEST_AUTH_URL);
        authUrl.searchParams.set("client_id", credentials.clientId);
        authUrl.searchParams.set("redirect_uri", redirectUri);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", "harvest:all");

        console.log("\nOpening browser for Harvest authentication...");
        console.log(`If browser doesn't open, visit: ${authUrl.toString()}\n`);

        // Open browser
        const open = (await import("open")).default;
        await open(authUrl.toString());
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new AuthError("Authentication timed out"));
      }, 5 * 60 * 1000);
    });
  }
}
