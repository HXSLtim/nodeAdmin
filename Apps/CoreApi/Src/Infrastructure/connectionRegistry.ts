import { Injectable } from '@nestjs/common';

export interface SocketContext {
  conversationId: string;
  tenantId: string;
  userId: string;
}

@Injectable()
export class ConnectionRegistry {
  private readonly contextBySocketId = new Map<string, SocketContext>();

  get(socketId: string): SocketContext | undefined {
    return this.contextBySocketId.get(socketId);
  }

  upsert(socketId: string, context: SocketContext): void {
    this.contextBySocketId.set(socketId, context);
  }

  remove(socketId: string): void {
    this.contextBySocketId.delete(socketId);
  }
}
