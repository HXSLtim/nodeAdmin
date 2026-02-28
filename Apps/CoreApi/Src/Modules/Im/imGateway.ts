import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConnectionRegistry } from '../../Infrastructure/connectionRegistry';
import { InMemoryMessageStore, StoredMessage } from '../../Infrastructure/inMemoryMessageStore';
import { JoinConversationDto } from './dto/joinConversationDto';
import { SendMessageDto } from './dto/sendMessageDto';

@WebSocketGateway({
  cors: {
    credentials: true,
    origin: true,
  },
  transports: ['websocket'],
})
export class ImGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly connectionRegistry: ConnectionRegistry,
    private readonly messageStore: InMemoryMessageStore,
  ) {}

  handleConnection(client: Socket): void {
    client.emit('serverReady', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket): void {
    this.connectionRegistry.remove(client.id);
  }

  @SubscribeMessage('joinConversation')
  joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody(
      new ValidationPipe({
        exceptionFactory: (errors) => new WsException(errors),
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    )
    payload: JoinConversationDto,
  ): { ok: true; roomKey: string } {
    const roomKey = this.toRoomKey(payload.tenantId, payload.conversationId);

    this.connectionRegistry.upsert(client.id, {
      conversationId: payload.conversationId,
      tenantId: payload.tenantId,
      userId: payload.userId,
    });

    client.join(roomKey);

    client.emit('conversationHistory', this.messageStore.getLatest(payload.tenantId, payload.conversationId, 50));

    this.server.to(roomKey).emit('presenceChanged', {
      conversationId: payload.conversationId,
      event: 'joined',
      tenantId: payload.tenantId,
      userId: payload.userId,
    });

    return {
      ok: true,
      roomKey,
    };
  }

  @SubscribeMessage('sendMessage')
  sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(
      new ValidationPipe({
        exceptionFactory: (errors) => new WsException(errors),
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    )
    payload: SendMessageDto,
  ): { accepted: true; messageId: string } {
    const context = this.connectionRegistry.get(client.id);
    if (!context) {
      throw new WsException('Please join a conversation before sending messages.');
    }

    const sameConversation =
      context.tenantId === payload.tenantId &&
      context.conversationId === payload.conversationId &&
      context.userId === payload.userId;

    if (!sameConversation) {
      throw new WsException('Socket context mismatch for tenant, conversation, or user.');
    }

    const message: StoredMessage = {
      content: payload.content,
      conversationId: payload.conversationId,
      createdAt: new Date().toISOString(),
      messageId: payload.messageId,
      tenantId: payload.tenantId,
      traceId: payload.traceId,
      userId: payload.userId,
    };

    this.messageStore.append(message);

    const roomKey = this.toRoomKey(payload.tenantId, payload.conversationId);
    this.server.to(roomKey).emit('messageReceived', message);

    return {
      accepted: true,
      messageId: payload.messageId,
    };
  }

  private toRoomKey(tenantId: string, conversationId: string): string {
    return `${tenantId}::${conversationId}`;
  }
}
