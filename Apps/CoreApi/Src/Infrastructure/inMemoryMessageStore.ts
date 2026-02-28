import { Injectable } from '@nestjs/common';

export interface StoredMessage {
  content: string;
  conversationId: string;
  createdAt: string;
  messageId: string;
  tenantId: string;
  traceId: string;
  userId: string;
}

@Injectable()
export class InMemoryMessageStore {
  private readonly messagesByStream = new Map<string, StoredMessage[]>();

  append(message: StoredMessage): void {
    const streamKey = this.toStreamKey(message.tenantId, message.conversationId);
    const currentMessages = this.messagesByStream.get(streamKey) ?? [];
    currentMessages.push(message);
    this.messagesByStream.set(streamKey, currentMessages.slice(-200));
  }

  getLatest(tenantId: string, conversationId: string, limit: number): StoredMessage[] {
    const streamKey = this.toStreamKey(tenantId, conversationId);
    const currentMessages = this.messagesByStream.get(streamKey) ?? [];
    return currentMessages.slice(-limit);
  }

  private toStreamKey(tenantId: string, conversationId: string): string {
    return `${tenantId}::${conversationId}`;
  }
}
