import { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/Components/Ui/button';

interface ChatMessage {
  content: string;
  conversationId: string;
  createdAt: string;
  messageId: string;
  tenantId: string;
  traceId: string;
  userId: string;
}

const tenantId = 'tenant-demo';
const userId = 'user-admin';
const conversationId = 'conversation-mvp';

export function MessagePanel(): JSX.Element {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const socketUrl = useMemo(() => {
    return (import.meta.env.VITE_CORE_API_SOCKET_URL as string | undefined) ?? 'http://localhost:3001';
  }, []);

  useEffect(() => {
    const socket = io(socketUrl, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinConversation', {
        conversationId,
        tenantId,
        userId,
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('conversationHistory', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on('messageReceived', (message: ChatMessage) => {
      setMessages((currentMessages) => [...currentMessages, message]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketUrl]);

  const sendMessage = (): void => {
    const normalizedContent = content.trim();
    if (!normalizedContent || !socketRef.current) {
      return;
    }

    const nonce = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    socketRef.current.emit('sendMessage', {
      content: normalizedContent,
      conversationId,
      messageId: `msg-${nonce}`,
      tenantId,
      traceId: `trace-${nonce}`,
      userId,
    });

    setContent('');
  };

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-md border border-border bg-white p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">IM MVP 会话</h2>
        <span className="text-xs text-muted-foreground">{connected ? 'connected' : 'disconnected'}</span>
      </header>

      <div className="h-80 overflow-y-auto rounded-md bg-muted p-3">
        <ul className="flex flex-col gap-2">
          {messages.map((message) => (
            <li className="rounded-md bg-white p-2 text-sm" key={message.messageId}>
              <p className="font-medium">{message.userId}</p>
              <p>{message.content}</p>
              <p className="text-xs text-muted-foreground">{message.createdAt}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <input
          className="h-10 flex-1 rounded-md border border-border px-3 text-sm"
          onChange={(event) => setContent(event.target.value)}
          placeholder="输入消息并回车发送"
          value={content}
        />
        <Button onClick={sendMessage} type="button" variant="default">
          发送
        </Button>
      </div>
    </section>
  );
}
