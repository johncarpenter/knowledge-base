#!/usr/bin/env node

import { parseArgs } from 'util';
import { loadConfig, saveConfig, AccountInfo } from './auth/config.js';
import { authenticateInteractive, hasValidCache, clearCache } from './auth/oauth.js';
import { getUserInfo } from './graph/client.js';

async function addAccount(name: string, force: boolean = false): Promise<void> {
  const config = loadConfig();

  if (!config.clientId) {
    console.error('Error: Client ID not configured.');
    console.error('Create ~/.config/exchange-mcp/config.json with:');
    console.error(JSON.stringify({ clientId: 'YOUR_APPLICATION_CLIENT_ID', accounts: {} }, null, 2));
    process.exit(1);
  }

  if (config.accounts[name] && !force) {
    console.error(`Account "${name}" already exists. Use --force to re-authenticate.`);
    process.exit(1);
  }

  if (force) {
    await clearCache(name);
  }

  console.log(`Authenticating account "${name}"...`);

  try {
    const result = await authenticateInteractive(name);

    // Get user info to store email
    const userInfo = await getUserInfo(name);

    const accountInfo: AccountInfo = {
      email: userInfo.mail || result.account?.username || 'unknown',
      name: userInfo.displayName || name,
      addedAt: new Date().toISOString(),
    };

    config.accounts[name] = accountInfo;
    saveConfig(config);

    console.log(`\nSuccess! Account "${name}" added.`);
    console.log(`  Email: ${accountInfo.email}`);
    console.log(`  Name: ${accountInfo.name}`);
  } catch (error) {
    console.error('Authentication failed:', error);
    process.exit(1);
  }
}

async function removeAccount(name: string): Promise<void> {
  const config = loadConfig();

  if (!config.accounts[name]) {
    console.error(`Account "${name}" not found.`);
    process.exit(1);
  }

  await clearCache(name);
  delete config.accounts[name];
  saveConfig(config);

  console.log(`Account "${name}" removed.`);
}

async function listAccountsCli(): Promise<void> {
  const config = loadConfig();
  const accounts = Object.entries(config.accounts);

  if (accounts.length === 0) {
    console.log('No accounts configured.');
    console.log('Add one with: npm run auth -- add --name <account-name>');
    return;
  }

  console.log('Configured accounts:\n');
  for (const [name, info] of accounts) {
    const hasCache = await hasValidCache(name);
    const status = hasCache ? 'authenticated' : 'needs re-auth';
    console.log(`  ${name}`);
    console.log(`    Email: ${info.email}`);
    console.log(`    Status: ${status}`);
    console.log();
  }
}

async function showStatus(): Promise<void> {
  const config = loadConfig();

  console.log('Exchange MCP Configuration\n');

  if (!config.clientId) {
    console.log('Client ID: NOT CONFIGURED');
    console.log('\nCreate ~/.config/exchange-mcp/config.json with your Azure App client ID.');
  } else {
    console.log(`Client ID: ${config.clientId.substring(0, 8)}...`);
  }

  console.log();
  await listAccountsCli();
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      name: { type: 'string', short: 'n' },
      force: { type: 'boolean', short: 'f', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  const command = positionals[0];

  if (values.help || !command) {
    console.log(`
Exchange MCP Authentication CLI

Usage:
  npm run auth -- <command> [options]

Commands:
  add       Add a new account
  remove    Remove an account
  list      List all accounts
  status    Show configuration status

Options:
  --name, -n    Account name (required for add/remove)
  --force, -f   Force re-authentication
  --help, -h    Show this help

Examples:
  npm run auth -- add --name jot
  npm run auth -- add --name suncorp --force
  npm run auth -- remove --name oldaccount
  npm run auth -- list
  npm run auth -- status
`);
    return;
  }

  switch (command) {
    case 'add':
      if (!values.name) {
        console.error('Error: --name is required');
        process.exit(1);
      }
      await addAccount(values.name, values.force);
      break;

    case 'remove':
      if (!values.name) {
        console.error('Error: --name is required');
        process.exit(1);
      }
      await removeAccount(values.name);
      break;

    case 'list':
      await listAccountsCli();
      break;

    case 'status':
      await showStatus();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
