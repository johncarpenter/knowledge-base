#!/usr/bin/env node
/**
 * Zoho Projects MCP CLI
 * Commands:
 *   serve - Start the MCP server (default)
 *   auth  - Authenticate with Zoho Projects
 */

import { AuthManager } from "./auth.js";
import { startServer } from "./server.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || "serve";

  const authManager = new AuthManager();

  switch (command) {
    case "auth": {
      console.log("Authenticating with Zoho Projects...\n");
      try {
        const token = await authManager.authenticate();
        console.log(`\nAuthenticated as ${token.userName} (${token.email})`);
        console.log(`Portal: ${token.portalName}`);
        console.log("\nYou can now use the MCP server.");
      } catch (error) {
        console.error("Authentication failed:", error);
        process.exit(1);
      }
      break;
    }

    case "serve": {
      // Check if authenticated
      if (!(await authManager.hasCredentials())) {
        console.error("Not authenticated. Run: zoho-projects-mcp auth");
        process.exit(1);
      }

      try {
        await startServer();
      } catch (error) {
        console.error("Server error:", error);
        process.exit(1);
      }
      break;
    }

    default:
      console.log("Usage: zoho-projects-mcp [command]");
      console.log("");
      console.log("Commands:");
      console.log("  serve   Start the MCP server (default)");
      console.log("  auth    Authenticate with Zoho Projects");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
