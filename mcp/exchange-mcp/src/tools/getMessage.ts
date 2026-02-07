import { getMessage as getMessageFromGraph } from '../graph/client.js';

interface GetMessageParams {
  account: string;
  message_id: string;
}

interface MessageResult {
  id: string;
  conversationId: string;
  subject: string;
  from: {
    name: string;
    address: string;
  };
  toRecipients: Array<{
    name: string;
    address: string;
  }>;
  receivedDateTime: string;
  body: string;
  bodyType: string;
  hasAttachments: boolean;
  isRead: boolean;
  attachments: Array<{
    id: string;
    name: string;
    contentType: string;
    size: number;
  }>;
}

export async function getMessageTool(params: GetMessageParams): Promise<MessageResult> {
  const message = await getMessageFromGraph(params.account, params.message_id);

  return {
    id: message.id,
    conversationId: message.conversationId,
    subject: message.subject,
    from: {
      name: message.from?.emailAddress?.name || '',
      address: message.from?.emailAddress?.address || '',
    },
    toRecipients: (message.toRecipients || []).map((r) => ({
      name: r.emailAddress?.name || '',
      address: r.emailAddress?.address || '',
    })),
    receivedDateTime: message.receivedDateTime,
    body: message.body?.content || '',
    bodyType: message.body?.contentType || 'text',
    hasAttachments: message.hasAttachments,
    isRead: message.isRead,
    attachments: (message.attachments || []).map((a) => ({
      id: a.id,
      name: a.name,
      contentType: a.contentType,
      size: a.size,
    })),
  };
}
