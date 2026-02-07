/**
 * Zoho Projects MCP Server
 * Local MCP server for Zoho Projects time tracking with automatic token refresh.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ZohoProjectsApi } from "./zoho-api.js";
import { AuthManager } from "./auth.js";

export async function startServer(): Promise<void> {
  const authManager = new AuthManager();

  // Get valid token (auto-refreshes if needed)
  const token = await authManager.getToken();

  // Create Zoho Projects API client
  const zohoApi = new ZohoProjectsApi(
    token.accessToken,
    token.portalId,
    token.apiDomain,
    token.email,
    token.userZpuid
  );

  // Create MCP server
  const server = new McpServer({
    name: "Zoho Projects Time Tracking",
    version: "1.0.0",
  });

  // Get current user info
  server.tool(
    "getCurrentUser",
    "Get current user information from Zoho Projects",
    {},
    async () => {
      try {
        const userData = await zohoApi.getCurrentUser();
        return {
          content: [{ type: "text", text: JSON.stringify(userData, null, 2) }],
        };
      } catch (error) {
        throw new Error(`Failed to fetch user info: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Get all portals
  server.tool(
    "getPortals",
    "Get all Zoho Projects portals accessible to the user. Each portal represents a separate organization/workspace.",
    {},
    async () => {
      try {
        const portals = await zohoApi.getPortals();
        return {
          content: [{ type: "text", text: JSON.stringify(portals, null, 2) }],
        };
      } catch (error) {
        throw new Error(`Failed to fetch portals: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Get all projects
  server.tool(
    "getProjects",
    "Get projects from Zoho Projects. By default returns all projects (active, archived, templates). Can filter by status.",
    {
      status: z.enum(["active", "archived", "template", "all"]).optional().describe("Filter projects by status. Options: 'active', 'archived', 'template', 'all'. Defaults to 'all'."),
    },
    async ({ status = "all" }) => {
      try {
        const projects = await zohoApi.getProjects(status);
        return {
          content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
        };
      } catch (error) {
        throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Get tasks for a project
  server.tool(
    "getTasks",
    "Get tasks for a specific project",
    { projectId: z.string().describe("The project ID to get tasks for") },
    async ({ projectId }) => {
      try {
        const tasks = await zohoApi.getTasks(projectId);
        return {
          content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
        };
      } catch (error) {
        throw new Error(`Failed to fetch tasks: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Add a time log
  server.tool(
    "addTimeLog",
    "Add a new time log to Zoho Projects. Hours can be provided as decimal (e.g., '2' or '2.5') or HH:MM format (e.g., '02:30').",
    {
      projectId: z.string().describe("The project ID"),
      taskId: z.string().optional().describe("The task ID (optional - creates general time log if not provided)"),
      date: z.string().describe("The date in YYYY-MM-DD format (e.g., '2025-01-18')"),
      hours: z.string().describe("Time worked. Can be decimal hours (e.g., '2' for 2 hours, '2.5' for 2.5 hours) or HH:MM format (e.g., '02:30' for 2 hours 30 minutes)"),
      notes: z.string().describe("Description of the work done"),
      logName: z.string().optional().describe("Name for the time log entry (defaults to 'Time Log - {date}' if not provided)"),
      billStatus: z.enum(["Billable", "Non Billable"]).optional().describe("Billing status (default: Billable)"),
      approver: z.string().optional().describe("The approver's ZPuid (optional)"),
    },
    async ({ projectId, taskId, date, hours, notes, logName, billStatus = "Billable", approver }) => {
      try {
        const timeLog = taskId
          ? await zohoApi.addTimeLog(projectId, taskId, {
              date,
              hours,
              notes,
              log_name: logName,
              bill_status: billStatus,
              approver: approver,
            })
          : await zohoApi.addGeneralTimeLog(projectId, {
              date,
              hours,
              notes,
              log_name: logName,
              bill_status: billStatus,
              approver: approver,
            });
        return {
          content: [{ type: "text", text: `Time log added successfully:\n${JSON.stringify(timeLog, null, 2)}` }],
        };
      } catch (error) {
        throw new Error(`Failed to add time log: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Get time logs
  server.tool(
    "getTimeLogs",
    "Get time logs from Zoho Projects with optional filters",
    {
      projectId: z.string().describe("The project ID to get logs for"),
      fromDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      toDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
    },
    async ({ projectId, fromDate, toDate }) => {
      try {
        const timeLogs = await zohoApi.getTimeLogs(projectId, {
          fromDate,
          toDate,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(timeLogs, null, 2) }],
        };
      } catch (error) {
        throw new Error(`Failed to fetch time logs: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Start a timer
  server.tool(
    "startTimer",
    "Start a timer for a task in Zoho Projects",
    {
      projectId: z.string().describe("The project ID"),
      taskId: z.string().describe("The task ID to start timer for"),
      notes: z.string().optional().describe("Initial notes for the time log"),
    },
    async ({ projectId, taskId, notes = "" }) => {
      try {
        const timeLog = await zohoApi.startTimer(projectId, taskId, notes);
        return {
          content: [{ type: "text", text: `Timer started successfully:\n${JSON.stringify(timeLog, null, 2)}` }],
        };
      } catch (error) {
        throw new Error(`Failed to start timer: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Stop a timer
  server.tool(
    "stopTimer",
    "Stop a running timer in Zoho Projects",
    {
      projectId: z.string().describe("The project ID"),
      logId: z.string().describe("The time log ID to stop"),
    },
    async ({ projectId, logId }) => {
      try {
        const timeLog = await zohoApi.stopTimer(projectId, logId);
        return {
          content: [{ type: "text", text: `Timer stopped successfully:\n${JSON.stringify(timeLog, null, 2)}` }],
        };
      } catch (error) {
        throw new Error(`Failed to stop timer: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Get running timer
  server.tool(
    "getRunningTimer",
    "Get the currently running timer if any",
    {},
    async () => {
      try {
        const runningTimer = await zohoApi.getRunningTimer();
        if (runningTimer) {
          return {
            content: [{ type: "text", text: `Running timer found:\n${JSON.stringify(runningTimer, null, 2)}` }],
          };
        }
        return {
          content: [{ type: "text", text: "No running timer found" }],
        };
      } catch (error) {
        throw new Error(`Failed to fetch running timer: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
