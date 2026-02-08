#!/usr/bin/env node
/**
 * Granola MCP CLI
 * Entry point for the Granola MCP server.
 */

import { startServer } from "./server.js";
import { saveConfig, getConfig } from "./config.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "serve":
      await startServer();
      break;

    case "configure": {
      const apiKeyIndex = args.indexOf("--api-key");
      if (apiKeyIndex === -1 || !args[apiKeyIndex + 1]) {
        console.error("Usage: granola-mcp configure --api-key YOUR_API_KEY");
        console.error("");
        console.error("Get your API key from Granola:");
        console.error("  Settings → Workspaces → API tab → Generate API Key");
        console.error("");
        console.error("Note: API access requires Enterprise plan and admin access.");
        process.exit(1);
      }

      const apiKey = args[apiKeyIndex + 1];
      saveConfig({ apiKey });
      console.log("API key saved successfully.");
      console.log("You can now start the server with: granola-mcp serve");
      break;
    }

    case "status": {
      const config = getConfig();
      const envKey = process.env.GRANOLA_API_KEY;

      console.log("Granola MCP Configuration Status");
      console.log("=================================");

      if (envKey) {
        console.log("✓ API key found in GRANOLA_API_KEY environment variable");
      } else if (config?.apiKey) {
        console.log("✓ API key found in credentials/config.json");
        console.log(`  Key: ${config.apiKey.substring(0, 8)}...`);
      } else {
        console.log("✗ No API key configured");
        console.log("");
        console.log("To configure, either:");
        console.log("  1. Set GRANOLA_API_KEY environment variable");
        console.log("  2. Run: granola-mcp configure --api-key YOUR_API_KEY");
      }
      break;
    }

    default:
      console.log("Granola MCP Server");
      console.log("");
      console.log("Usage: granola-mcp <command>");
      console.log("");
      console.log("Commands:");
      console.log("  serve       Start the MCP server (for Claude Code)");
      console.log("  configure   Save API key to credentials file");
      console.log("  status      Check configuration status");
      console.log("");
      console.log("Examples:");
      console.log("  granola-mcp configure --api-key grn_xxxx...");
      console.log("  granola-mcp serve");
      console.log("");
      console.log("Environment variables:");
      console.log("  GRANOLA_API_KEY - API key (takes precedence over config file)");
      break;
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
