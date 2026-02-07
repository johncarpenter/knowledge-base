import {
  PublicClientApplication,
  Configuration,
  AuthenticationResult,
  AccountInfo,
  TokenCacheContext,
  ICachePlugin,
} from '@azure/msal-node';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadConfig, getConfigDir, ensureConfigDir } from './config.js';
import open from 'open';

const REDIRECT_PORT = 8765;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;

const SCOPES = ['Mail.Read', 'User.Read', 'offline_access'];

function getCacheFilePath(accountName: string): string {
  return join(getConfigDir(), 'cache', `${accountName}.json`);
}

function createCachePlugin(accountName: string): ICachePlugin {
  const cacheFile = getCacheFilePath(accountName);
  const cacheDir = join(getConfigDir(), 'cache');

  return {
    beforeCacheAccess: async (context: TokenCacheContext): Promise<void> => {
      if (existsSync(cacheFile)) {
        const cacheData = readFileSync(cacheFile, 'utf-8');
        context.tokenCache.deserialize(cacheData);
      }
    },
    afterCacheAccess: async (context: TokenCacheContext): Promise<void> => {
      if (context.cacheHasChanged) {
        ensureConfigDir();
        if (!existsSync(cacheDir)) {
          mkdirSync(cacheDir, { recursive: true });
        }
        writeFileSync(cacheFile, context.tokenCache.serialize(), { mode: 0o600 });
      }
    },
  };
}

function createMsalConfig(clientId: string, accountName: string): Configuration {
  return {
    auth: {
      clientId,
      authority: 'https://login.microsoftonline.com/common',
    },
    cache: {
      cachePlugin: createCachePlugin(accountName),
    },
  };
}

async function getAccount(pca: PublicClientApplication): Promise<AccountInfo | null> {
  const cache = pca.getTokenCache();
  const accounts = await cache.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

export async function getAccessToken(accountName: string): Promise<string> {
  const config = loadConfig();
  if (!config.clientId) {
    throw new Error('Client ID not configured. Set clientId in ~/.config/exchange-mcp/config.json');
  }

  const msalConfig = createMsalConfig(config.clientId, accountName);
  const pca = new PublicClientApplication(msalConfig);

  const account = await getAccount(pca);
  if (!account) {
    throw new Error(`Account "${accountName}" not found. Run: npm run auth -- add --name ${accountName}`);
  }

  try {
    // acquireTokenSilent will automatically refresh if needed
    const result = await pca.acquireTokenSilent({
      account,
      scopes: SCOPES,
    });

    return result.accessToken;
  } catch {
    throw new Error(
      `Token refresh failed for "${accountName}". Re-authenticate with: npm run auth -- add --name ${accountName} --force`
    );
  }
}

export async function authenticateInteractive(accountName: string): Promise<AuthenticationResult> {
  const config = loadConfig();
  if (!config.clientId) {
    throw new Error('Client ID not configured. Set clientId in ~/.config/exchange-mcp/config.json');
  }

  const msalConfig = createMsalConfig(config.clientId, accountName);
  const pca = new PublicClientApplication(msalConfig);

  return new Promise((resolve, reject) => {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      if (!req.url?.startsWith('/callback')) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');

      if (error) {
        res.writeHead(400);
        res.end(`Authentication failed: ${errorDescription || error}`);
        server.close();
        reject(new Error(errorDescription || error));
        return;
      }

      if (!code) {
        res.writeHead(400);
        res.end('No authorization code received');
        server.close();
        reject(new Error('No authorization code received'));
        return;
      }

      try {
        const result = await pca.acquireTokenByCode({
          code,
          scopes: SCOPES,
          redirectUri: REDIRECT_URI,
        });

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
              <div style="text-align: center;">
                <h1 style="color: #22c55e;">Success!</h1>
                <p>Account "${accountName}" authenticated. You can close this window.</p>
              </div>
            </body>
          </html>
        `);

        server.close();
        resolve(result);
      } catch (err) {
        res.writeHead(500);
        res.end(`Token exchange failed: ${err}`);
        server.close();
        reject(err);
      }
    });

    server.listen(REDIRECT_PORT, async () => {
      const authUrl = await pca.getAuthCodeUrl({
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
      });

      console.log(`Opening browser for authentication...`);
      console.log(`If browser doesn't open, visit: ${authUrl}`);

      await open(authUrl);
    });

    server.on('error', (err) => {
      reject(new Error(`Failed to start auth server: ${err.message}`));
    });
  });
}

export async function hasValidCache(accountName: string): Promise<boolean> {
  const config = loadConfig();
  if (!config.clientId) return false;

  const msalConfig = createMsalConfig(config.clientId, accountName);
  const pca = new PublicClientApplication(msalConfig);
  const account = await getAccount(pca);

  return account !== null;
}

export async function clearCache(accountName: string): Promise<void> {
  const cacheFile = getCacheFilePath(accountName);
  if (existsSync(cacheFile)) {
    const { unlinkSync } = await import('fs');
    unlinkSync(cacheFile);
  }
}
