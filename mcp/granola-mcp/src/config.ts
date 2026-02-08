/**
 * Configuration management for Granola MCP
 * Handles API key storage and retrieval.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_DIR = join(__dirname, "..", "credentials");
const CONFIG_FILE = join(CREDENTIALS_DIR, "config.json");

interface Config {
  apiKey: string;
}

export function ensureCredentialsDir(): void {
  if (!existsSync(CREDENTIALS_DIR)) {
    mkdirSync(CREDENTIALS_DIR, { recursive: true });
  }
}

export function getConfig(): Config | null {
  if (!existsSync(CONFIG_FILE)) {
    return null;
  }
  try {
    const content = readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(content) as Config;
  } catch {
    return null;
  }
}

export function saveConfig(config: Config): void {
  ensureCredentialsDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getApiKey(): string {
  // Check environment variable first
  const envKey = process.env.GRANOLA_API_KEY;
  if (envKey) {
    return envKey;
  }

  // Fall back to config file
  const config = getConfig();
  if (config?.apiKey) {
    return config.apiKey;
  }

  throw new Error(
    "Granola API key not found. Set GRANOLA_API_KEY environment variable or run 'granola-mcp configure --api-key YOUR_KEY'"
  );
}
