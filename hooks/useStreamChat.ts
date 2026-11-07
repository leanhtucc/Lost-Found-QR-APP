/**
 * useStreamChat — live messages for one Stream channel.
 * Works for registered users and guest finders (see services/chat/stream.ts).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Channel, Event, LocalMessage } from 'stream-chat';
import { connectStreamClient } from '@/services/chat/stream';
import type { ChatMessage } from '@/screens/chat/detail/types';

export type StreamChatStatus = 'connecting' | 'ready' | 'error';

const toChatMessage = (message: LocalMessage): ChatMessage => ({
  id: message.id,
  senderId: message.type === 'system' ? 'system' : (message.user?.id ?? 'unknown'),
  content: message.text ?? '',
  timestamp: message.created_at ? new Date(message.created_at) : new Date(),
  isRead: true,
  type: message.attachments?.some(a => a.type === 'image') ? 'image' : 'text',
});

const isVisible = (message: LocalMessage): boolean =>
  message.type !== 'deleted' && message.type !== 'ephemeral' && message.status !== 'failed';

export function useStreamChat(channelId: string | undefined) {
  const [status, setStatus] = useState<StreamChatStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!channelId) {
      setStatus('error');
      setError('Không tìm thấy cuộc trò chuyện.');
      return;
    }

    let cancelled = false;
    const cleanups: (() => void)[] = [];
    setStatus('connecting');
    setError(null);

    (async () => {
      try {
        const client = await connectStreamClient(channelId);
        const channel = client.channel('messaging', channelId);
        await channel.watch({ messages: { limit: 50 } });
        if (cancelled) return;

        channelRef.current = channel;
        setUserId(client.userID ?? null);

        const sync = () => {
          if (cancelled) return;
          setMessages(channel.state.messages.filter(isVisible).map(toChatMessage));
        };
        sync();
        setStatus('ready');
        void channel.markRead().catch(() => undefined);

        const onMessage = (event: Event) => {
          sync();
          if (event.user?.id !== client.userID) {
            void channel.markRead().catch(() => undefined);
          }
        };
        const onTypingStart = (event: Event) => {
          if (event.user?.id !== client.userID) setIsPartnerTyping(true);
        };
        const onTypingStop = (event: Event) => {
          if (event.user?.id !== client.userID) setIsPartnerTyping(false);
        };

        for (const type of ['message.new', 'message.updated', 'message.deleted'] as const) {
          cleanups.push(channel.on(type, onMessage).unsubscribe);
        }
        cleanups.push(channel.on('typing.start', onTypingStart).unsubscribe);
        cleanups.push(channel.on('typing.stop', onTypingStop).unsubscribe);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Không kết nối được chat.');
      }
    })();

    return () => {
      cancelled = true;
      cleanups.forEach(fn => fn());
      channelRef.current = null;
    };
  }, [channelId, attempt]);

  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    const channel = channelRef.current;
    const trimmed = text.trim();
    if (!channel || !trimmed) return false;
    try {
      await channel.sendMessage({ text: trimmed });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi tin nhắn thất bại.');
      return false;
    }
  }, []);

  const notifyTyping = useCallback(() => {
    void channelRef.current?.keystroke().catch(() => undefined);
  }, []);

  const retry = useCallback(() => setAttempt(value => value + 1), []);

  return { status, error, messages, userId, isPartnerTyping, sendMessage, notifyTyping, retry };
}
