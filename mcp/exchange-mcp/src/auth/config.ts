import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface AccountInfo {
  email: string;
  name: string;
  addedAt: string;
}

export interface Config {
  clientId: string;
  accounts: Record<string, AccountInfo>;
}

const CONFIG_DIR = join(homedir(), '.config', 'exchange-mcp');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): Config {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    return {
      clientId: '',
      accounts: {}
    };
  }

  const content = readFileSync(CONFIG_FILE, 'utf-8');
  return JSON.parse(content) as Config;
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}
