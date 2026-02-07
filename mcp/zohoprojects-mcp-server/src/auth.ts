/**
 * OAuth authentication for Zoho Projects with local token storage.
 * Tokens are stored locally and refreshed automatically.
 */

import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Zoho OAuth endpoints - using Canadian data center by default
// Change .ca to .com, .eu, .in, .com.au, or .com.cn for other regions
const ZOHO_AUTH_URL = "https://accounts.zohocloud.ca/oauth/v2/auth";
const ZOHO_TOKEN_URL = "https://accounts.zohocloud.ca/oauth/v2/token";
const ZOHO_USER_INFO_URL = "https://accounts.zohocloud.ca/oauth/user/info";
const ZOHO_PROJECTS_API_URL = "https://projectsapi.zohocloud.ca/api/v3";

// OAuth scopes for Zoho Projects
const ZOHO_SCOPES = [
  "aaaserver.profile.READ",
  "ZohoProjects.portals.ALL",
  "ZohoProjects.projects.ALL",
  "ZohoProjects.tasks.ALL",
  "ZohoProjects.users.ALL",
  "ZohoProjects.timesheets.ALL",
].join(",");

export interface ZohoCredentials {
  clientId: string;
  clientSecret: string;
}

export interface ZohoToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  email: string;
  userId: string;
  userName: string;
  userZpuid?: string; // User's Zoho Projects UID for time log creation
  portalId: string;
  portalName: string;
  apiDomain: string; // Data center API domain
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
  async getClientCredentials(): Promise<ZohoCredentials> {
    if (!existsSync(this.clientSecretsPath)) {
      throw new AuthError(
        `No client secrets found. Create ${this.clientSecretsPath} with:\n` +
        `{\n  "clientId": "YOUR_CLIENT_ID",\n  "clientSecret": "YOUR_CLIENT_SECRET"\n}\n\n` +
        `Get these from https://api-console.zohocloud.ca (or your region's console)`
      );
    }

    const data = await readFile(this.clientSecretsPath, "utf-8");
    const parsed = JSON.parse(data);

    if (!parsed.clientId || !parsed.clientSecret) {
      throw new AuthError("client_secrets.json must contain clientId and clientSecret");
    }

    return parsed as ZohoCredentials;
  }

  /**
   * Get valid credentials, refreshing if needed
   */
  async getToken(): Promise<ZohoToken> {
    if (!existsSync(this.tokenPath)) {
      throw new AuthError("Not authenticated. Run: zoho-projects-mcp auth");
    }

    const data = await readFile(this.tokenPath, "utf-8");
    const token = JSON.parse(data) as ZohoToken;

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
  private async refreshToken(token: ZohoToken): Promise<ZohoToken> {
    const credentials = await this.getClientCredentials();

    const response = await fetch(ZOHO_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
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
      refresh_token?: string;
      expires_in: number;
    };

    const newToken: ZohoToken = {
      ...token,
      accessToken: tokenData.access_token,
      // Zoho may or may not return a new refresh token
      refreshToken: tokenData.refresh_token || token.refreshToken,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };

    await this.saveToken(newToken);
    console.error("Token refreshed successfully");
    return newToken;
  }

  /**
   * Save token to file
   */
  private async saveToken(token: ZohoToken): Promise<void> {
    await mkdir(this.credentialsDir, { recursive: true });
    await writeFile(this.tokenPath, JSON.stringify(token, null, 2));
  }

  /**
   * Run OAuth flow to authenticate
   */
  async authenticate(): Promise<ZohoToken> {
    const credentials = await this.getClientCredentials();

    // Start local server for callback
    const port = 8766;
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
            const tokenResponse = await fetch(ZOHO_TOKEN_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
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
              api_domain: string;
            };

            console.log("Access token obtained, fetching user info...");

            // Fetch user info from Zoho Accounts
            const userInfoResponse = await fetch(ZOHO_USER_INFO_URL, {
              headers: {
                Authorization: `Zoho-oauthtoken ${tokenData.access_token}`,
              },
            });

            if (!userInfoResponse.ok) {
              throw new Error("Failed to fetch user info");
            }

            const userInfo = await userInfoResponse.json() as {
              ZUID: string;
              Email: string;
              First_Name: string;
              Last_Name: string;
              Display_Name: string;
            };

            console.log(`Authenticated as: ${userInfo.Email} (${userInfo.Display_Name})`);

            // Fetch portals from Zoho Projects
            const portalsResponse = await fetch(`${ZOHO_PROJECTS_API_URL}/portals`, {
              headers: {
                Authorization: `Zoho-oauthtoken ${tokenData.access_token}`,
              },
            });

            if (!portalsResponse.ok) {
              const errorText = await portalsResponse.text();
              throw new Error(`Failed to fetch portals: ${errorText}`);
            }

            const portalsData = await portalsResponse.json() as Array<{
              id: string;
              portal_name: string;
              owner: { email: string; full_name: string };
            }>;

            if (!portalsData || portalsData.length === 0) {
              throw new Error("No Zoho Projects portals found. Please create a portal first.");
            }

            const primaryPortal = portalsData[0];
            console.log(`Using portal: ${primaryPortal.portal_name} (ID: ${primaryPortal.id})`);

            // Fetch user's zpuid from the portal
            let userZpuid: string | undefined;
            try {
              const userDetailsResponse = await fetch(
                `${ZOHO_PROJECTS_API_URL}/portal/${primaryPortal.id}/users/me`,
                {
                  headers: {
                    Authorization: `Zoho-oauthtoken ${tokenData.access_token}`,
                  },
                }
              );

              if (userDetailsResponse.ok) {
                const userData = await userDetailsResponse.json() as { id: string };
                userZpuid = userData.id;
                console.log(`User zpuid: ${userZpuid}`);
              }
            } catch (e) {
              console.warn("Could not fetch user zpuid, time logs will use default user");
            }

            const token: ZohoToken = {
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              expiresAt: Date.now() + tokenData.expires_in * 1000,
              email: userInfo.Email,
              userId: userInfo.ZUID,
              userName: userInfo.Display_Name,
              userZpuid,
              portalId: primaryPortal.id,
              portalName: primaryPortal.portal_name,
              apiDomain: ZOHO_PROJECTS_API_URL,
            };

            await this.saveToken(token);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(`
              <html>
                <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                  <h1>Authentication Successful!</h1>
                  <p>Logged in as <strong>${token.userName}</strong> (${token.email})</p>
                  <p>Portal: <strong>${token.portalName}</strong></p>
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
        const authUrl = new URL(ZOHO_AUTH_URL);
        authUrl.searchParams.set("client_id", credentials.clientId);
        authUrl.searchParams.set("redirect_uri", redirectUri);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", ZOHO_SCOPES);
        authUrl.searchParams.set("access_type", "offline");
        authUrl.searchParams.set("prompt", "consent");

        console.log("\nOpening browser for Zoho authentication...");
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
