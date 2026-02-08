/**
 * Granola MCP Server
 * Local MCP server for Granola meeting notes.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GranolaApi } from "./granola-api.js";
import { getApiKey } from "./config.js";

export async function startServer(): Promise<void> {
  const apiKey = getApiKey();
  const granolaApi = new GranolaApi(apiKey);

  const server = new McpServer({
    name: "Granola Meeting Notes",
    version: "1.0.0",
  });

  // List notes with optional filters
  server.tool(
    "list_notes",
    "List meeting notes from Granola with optional date filters. Returns note metadata without full content.",
    {
      created_after: z
        .string()
        .optional()
        .describe("Return notes created after this date (YYYY-MM-DD or ISO 8601 datetime)"),
      created_before: z
        .string()
        .optional()
        .describe("Return notes created before this date (YYYY-MM-DD or ISO 8601 datetime)"),
      page_size: z
        .number()
        .min(1)
        .max(30)
        .optional()
        .describe("Number of results per page (1-30, default: 10)"),
      cursor: z.string().optional().describe("Pagination cursor from previous response"),
    },
    async ({ created_after, created_before, page_size, cursor }) => {
      const response = await granolaApi.listNotes({
        created_after,
        created_before,
        page_size,
        cursor,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );

  // Get a specific note with full details
  server.tool(
    "get_note",
    "Get a specific meeting note by ID, including summary and optionally the full transcript.",
    {
      note_id: z
        .string()
        .describe("The note ID (format: not_XXXXXXXXXXXXXX)"),
      include_transcript: z
        .boolean()
        .optional()
        .describe("Include the full meeting transcript (default: false)"),
    },
    async ({ note_id, include_transcript }) => {
      const note = await granolaApi.getNote(note_id, include_transcript ?? false);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(note, null, 2),
          },
        ],
      };
    }
  );

  // Get all notes (auto-pagination)
  server.tool(
    "get_all_notes",
    "Get all meeting notes within a date range. Handles pagination automatically. Use with caution for large date ranges.",
    {
      created_after: z
        .string()
        .optional()
        .describe("Return notes created after this date (YYYY-MM-DD or ISO 8601 datetime)"),
      created_before: z
        .string()
        .optional()
        .describe("Return notes created before this date (YYYY-MM-DD or ISO 8601 datetime)"),
    },
    async ({ created_after, created_before }) => {
      const notes = await granolaApi.getAllNotes({
        created_after,
        created_before,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                total_count: notes.length,
                notes,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Get recent notes (convenience method)
  server.tool(
    "get_recent_notes",
    "Get notes from the last N days. A convenience wrapper around list_notes.",
    {
      days: z
        .number()
        .min(1)
        .max(90)
        .optional()
        .describe("Number of days to look back (default: 7, max: 90)"),
      page_size: z
        .number()
        .min(1)
        .max(30)
        .optional()
        .describe("Number of results per page (1-30, default: 10)"),
    },
    async ({ days = 7, page_size }) => {
      const afterDate = new Date();
      afterDate.setDate(afterDate.getDate() - days);

      const response = await granolaApi.listNotes({
        created_after: afterDate.toISOString().split("T")[0],
        page_size,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }
  );

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
