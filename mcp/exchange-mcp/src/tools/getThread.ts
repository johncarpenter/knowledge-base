import { getThread as getThreadFromGraph, Message } from '../graph/client.js';

interface GetThreadParams {
  account: string;
  conversation_id: string;
}

interface ThreadResult {
  conversationId: string;
  messages: Array<{
    id: string;
    subject: string;
    from: string;
    receivedDateTime: string;
    body: string;
    hasAttachments: boolean;
  }>;
}

export async function getThreadTool(params: GetThreadParams): Promise<ThreadResult> {
  const messages = await getThreadFromGraph(params.account, params.conversation_id);

  return {
    conversationId: params.conversation_id,
    messages: messages.map((msg: Message) => ({
      id: msg.id,
      subject: msg.subject,
      from: msg.from?.emailAddress?.address || 'unknown',
      receivedDateTime: msg.receivedDateTime,
      body: msg.body?.content || '',
      hasAttachments: msg.hasAttachments,
    })),
  };
}
