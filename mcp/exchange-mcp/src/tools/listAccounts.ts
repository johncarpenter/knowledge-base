import { loadConfig } from '../auth/config.js';

export async function listAccounts(): Promise<{ accounts: string[] }> {
  const config = loadConfig();
  return {
    accounts: Object.keys(config.accounts),
  };
}
