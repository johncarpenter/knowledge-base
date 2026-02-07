import { searchMessages, Message } from '../graph/client.js';

interface SearchParams {
  account: string;
  query: string;
  max_results?: number;
  include_body?: boolean;
}

interface SearchResult {
  messages: Array<{
    id: string;
    conversationId: string;
    subject: string;
    from: string;
    receivedDateTime: string;
    bodyPreview: string;
    body?: string;
    hasAttachments: boolean;
    isRead: boolean;
  }>;
}

export async function search(params: SearchParams): Promise<SearchResult> {
  const messages = await searchMessages(
    params.account,
    params.query,
    params.max_results ?? 20,
    params.include_body ?? false
  );

  return {
    messages: messages.map((msg: Message) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      subject: msg.subject,
      from: msg.from?.emailAddress?.address || 'unknown',
      receivedDateTime: msg.receivedDateTime,
      bodyPreview: msg.bodyPreview,
      body: msg.body?.content,
      hasAttachments: msg.hasAttachments,
      isRead: msg.isRead,
    })),
  };
}
