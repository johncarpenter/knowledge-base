/**
 * Harvest MCP Server
 * Local MCP server for Harvest time tracking with automatic token refresh.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { HarvestApi } from "./harvest-api.js";
import { AuthManager } from "./auth.js";

export async function startServer(): Promise<void> {
  const authManager = new AuthManager();

  // Get valid token (auto-refreshes if needed)
  const token = await authManager.getToken();

  // Create Harvest API client
  const harvestApi = new HarvestApi(token.accessToken, token.accountId);

  // Create MCP server
  const server = new McpServer({
    name: "Harvest Time Tracking",
    version: "1.0.0",
  });

  // Get current user info
  server.tool(
    "getCurrentUser",
    "Get current user information from Harvest",
    {},
    async () => {
      const userData = await harvestApi.getCurrentUser();
      return {
        content: [{ type: "text", text: JSON.stringify(userData, null, 2) }],
      };
    }
  );

  // Get all active projects
  server.tool(
    "getProjects",
    "Get all active projects from Harvest",
    { isActive: z.boolean().optional().describe("Filter by active status (default: true)") },
    async () => {
      const projects = await harvestApi.getProjects();
      return {
        content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
      };
    }
  );

  // Get task assignments for a project
  server.tool(
    "getTasks",
    "Get tasks for a specific project",
    { projectId: z.number().describe("The project ID to get tasks for") },
    async ({ projectId }) => {
      const taskAssignments = await harvestApi.getTaskAssignments(projectId);
      return {
        content: [{ type: "text", text: JSON.stringify(taskAssignments, null, 2) }],
      };
    }
  );

  // Add a time entry
  server.tool(
    "createTimeEntry",
    "Create a new time entry in Harvest",
    {
      projectId: z.number().describe("The project ID"),
      startTime: z.string().describe("Start time in ISO 8601 format"),
      description: z.string().describe("Description of the work done"),
      endTime: z.string().optional().describe("End time in ISO 8601 format (optional)"),
      taskId: z.number().optional().describe("The task ID (optional - will use first available task if not provided)"),
      isBillable: z.boolean().optional().describe("Whether the time is billable (default: true)"),
    },
    async ({ projectId, startTime, description, endTime, taskId }) => {
      // Parse ISO dates to get date and hours
      const start = new Date(startTime);
      const spentDate = start.toISOString().split("T")[0];

      let hours = 0;
      if (endTime) {
        const end = new Date(endTime);
        hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }

      const timeEntry = await harvestApi.addTimeEntry({
        project_id: projectId,
        task_id: taskId,
        spent_date: spentDate,
        hours: hours || 0,
        notes: description,
      });
      return {
        content: [{ type: "text", text: `Time entry created:\n${JSON.stringify(timeEntry, null, 2)}` }],
      };
    }
  );

  // Get time entries
  server.tool(
    "getTimeEntries",
    "Get time entries from Harvest with optional filters",
    {
      startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
      projectId: z.number().optional().describe("Filter by project ID"),
    },
    async ({ startDate, endDate }) => {
      const timeEntries = await harvestApi.getTimeEntries({
        from: startDate,
        to: endDate,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(timeEntries, null, 2) }],
      };
    }
  );

  // Get time reports
  server.tool(
    "getTimeReports",
    "Get time reports from Harvest for a date range",
    {
      startDate: z.string().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().describe("End date in YYYY-MM-DD format"),
      groupBy: z.string().optional().describe("Group by (default: project)"),
    },
    async ({ startDate, endDate }) => {
      const reports = await harvestApi.getTimeReports(startDate, endDate);
      return {
        content: [{ type: "text", text: JSON.stringify(reports, null, 2) }],
      };
    }
  );

  // Start a timer
  server.tool(
    "startTimer",
    "Start a timer for a project in Harvest",
    {
      projectId: z.number().describe("The project ID to start timer for"),
      taskId: z.number().optional().describe("The task ID (optional - will use first available task if not provided)"),
      description: z.string().optional().describe("Description for the time entry"),
    },
    async ({ projectId, taskId, description = "" }) => {
      const timeEntry = await harvestApi.startTimer(projectId, taskId, description);
      return {
        content: [{ type: "text", text: `Timer started:\n${JSON.stringify(timeEntry, null, 2)}` }],
      };
    }
  );

  // Stop a timer
  server.tool(
    "stopTimer",
    "Stop the running timer in Harvest",
    {},
    async () => {
      const runningEntry = await harvestApi.getRunningTimeEntry();
      if (!runningEntry) {
        return {
          content: [{ type: "text", text: "No running timer found" }],
        };
      }
      const timeEntry = await harvestApi.stopTimer(runningEntry.id);
      return {
        content: [{ type: "text", text: `Timer stopped:\n${JSON.stringify(timeEntry, null, 2)}` }],
      };
    }
  );

  // Get running timer
  server.tool(
    "getRunningTimer",
    "Get the currently running timer if any",
    {},
    async () => {
      const runningEntry = await harvestApi.getRunningTimeEntry();
      if (runningEntry) {
        return {
          content: [{ type: "text", text: `Running timer:\n${JSON.stringify(runningEntry, null, 2)}` }],
        };
      }
      return {
        content: [{ type: "text", text: "No running timer" }],
      };
    }
  );

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
