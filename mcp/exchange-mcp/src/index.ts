#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { listAccounts } from './tools/listAccounts.js';
import { search } from './tools/search.js';
import { getMessageTool } from './tools/getMessage.js';
import { getThreadTool } from './tools/getThread.js';
import { getFoldersTool } from './tools/getFolders.js';

const server = new Server(
  {
    name: 'exchange-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'exchange_list_accounts',
        description: 'List all authenticated Exchange/Outlook accounts',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'exchange_search',
        description:
          'Search emails using Microsoft Graph query syntax. Examples: "from:alice@example.com", "subject:invoice", "hasAttachments:true", "received:2025-01-01..2025-01-31"',
        inputSchema: {
          type: 'object',
          properties: {
            account: {
              type: 'string',
              description: 'Account name (e.g., "jot", "suncorp")',
            },
            query: {
              type: 'string',
              description: 'Search query (KQL syntax)',
            },
            max_results: {
              type: 'integer',
              description: 'Maximum results to return (default: 20)',
              default: 20,
            },
            include_body: {
              type: 'boolean',
              description: 'Include full message body (default: false)',
              default: false,
            },
          },
          required: ['account', 'query'],
        },
      },
      {
        name: 'exchange_get_message',
        description: 'Get full details of a specific email message by ID',
        inputSchema: {
          type: 'object',
          properties: {
            account: {
              type: 'string',
              description: 'Account name',
            },
            message_id: {
              type: 'string',
              description: 'Message ID from search results',
            },
          },
          required: ['account', 'message_id'],
        },
      },
      {
        name: 'exchange_get_thread',
        description: 'Get all messages in an email thread/conversation',
        inputSchema: {
          type: 'object',
          properties: {
            account: {
              type: 'string',
              description: 'Account name',
            },
            conversation_id: {
              type: 'string',
              description: 'Conversation ID from search results',
            },
          },
          required: ['account', 'conversation_id'],
        },
      },
      {
        name: 'exchange_get_folders',
        description: 'List all mail folders for an account',
        inputSchema: {
          type: 'object',
          properties: {
            account: {
              type: 'string',
              description: 'Account name',
            },
          },
          required: ['account'],
        },
      },
    ],
  };
});

interface SearchArgs {
  account: string;
  query: string;
  max_results?: number;
  include_body?: boolean;
}

interface MessageArgs {
  account: string;
  message_id: string;
}

interface ThreadArgs {
  account: string;
  conversation_id: string;
}

interface FolderArgs {
  account: string;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case 'exchange_list_accounts':
        result = await listAccounts();
        break;

      case 'exchange_search': {
        const searchArgs = args as unknown as SearchArgs;
        result = await search(searchArgs);
        break;
      }

      case 'exchange_get_message': {
        const messageArgs = args as unknown as MessageArgs;
        result = await getMessageTool(messageArgs);
        break;
      }

      case 'exchange_get_thread': {
        const threadArgs = args as unknown as ThreadArgs;
        result = await getThreadTool(threadArgs);
        break;
      }

      case 'exchange_get_folders': {
        const folderArgs = args as unknown as FolderArgs;
        result = await getFoldersTool(folderArgs);
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Exchange MCP server running');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
