import { Client } from '@microsoft/microsoft-graph-client';
import { getAccessToken } from '../auth/oauth.js';
import 'isomorphic-fetch';

export function createGraphClient(accountName: string): Client {
  return Client.init({
    authProvider: async (done) => {
      try {
        const token = await getAccessToken(accountName);
        done(null, token);
      } catch (error) {
        done(error as Error, null);
      }
    },
  });
}

export interface Message {
  id: string;
  conversationId: string;
  subject: string;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  toRecipients: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
  }>;
  receivedDateTime: string;
  bodyPreview: string;
  body?: {
    contentType: string;
    content: string;
  };
  hasAttachments: boolean;
  isRead: boolean;
}

export interface MailFolder {
  id: string;
  displayName: string;
  parentFolderId: string;
  childFolderCount: number;
  unreadItemCount: number;
  totalItemCount: number;
}

export interface Attachment {
  id: string;
  name: string;
  contentType: string;
  size: number;
}

export async function searchMessages(
  accountName: string,
  query: string,
  maxResults: number = 20,
  includeBody: boolean = false
): Promise<Message[]> {
  const client = createGraphClient(accountName);

  const select = [
    'id',
    'conversationId',
    'subject',
    'from',
    'toRecipients',
    'receivedDateTime',
    'bodyPreview',
    'hasAttachments',
    'isRead',
  ];

  if (includeBody) {
    select.push('body');
  }

  // Note: Microsoft Graph API doesn't support $orderBy with $search
  // Results are returned in relevance order when using search
  const response = await client
    .api('/me/messages')
    .search(`"${query}"`)
    .select(select.join(','))
    .top(maxResults)
    .get();

  return response.value as Message[];
}

export async function getMessage(
  accountName: string,
  messageId: string
): Promise<Message & { attachments: Attachment[] }> {
  const client = createGraphClient(accountName);

  const message = await client
    .api(`/me/messages/${messageId}`)
    .expand('attachments($select=id,name,contentType,size)')
    .get();

  return message;
}

export async function getThread(
  accountName: string,
  conversationId: string
): Promise<Message[]> {
  const client = createGraphClient(accountName);

  const response = await client
    .api('/me/messages')
    .filter(`conversationId eq '${conversationId}'`)
    .select('id,conversationId,subject,from,toRecipients,receivedDateTime,body,hasAttachments,isRead')
    .orderby('receivedDateTime asc')
    .get();

  return response.value as Message[];
}

export async function getFolders(accountName: string): Promise<MailFolder[]> {
  const client = createGraphClient(accountName);

  const response = await client
    .api('/me/mailFolders')
    .select('id,displayName,parentFolderId,childFolderCount,unreadItemCount,totalItemCount')
    .top(100)
    .get();

  return response.value as MailFolder[];
}

export async function getUserInfo(accountName: string): Promise<{ displayName: string; mail: string }> {
  const client = createGraphClient(accountName);

  const user = await client
    .api('/me')
    .select('displayName,mail')
    .get();

  return user;
}
