/**
 * Chat Types
 * Định nghĩa các kiểu dữ liệu cho hệ thống chat
 * Uses Stream Chat SDK with memberId as primary identifier
 * API Key: tbn8y285wevk
 */

// UI Conversation Type for Chat List
export interface Conversation {
  id: string;
  itemName: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date | string;
  unreadCount: number;
  isOnline: boolean;
  isVerified?: boolean; // Verified badge for chat participants
}

export interface ChatChannel {
  id: string;
  type: string;
  name: string;
  last_message?: string;
  unread_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChatReceiver {
  id: string; // Uses memberId for identification
  memberId?: string; // Explicit memberId field
  name: string;
  image?: string;
  avatar?: string;
  isVerified?: boolean; // Verified status for badge display
  trustScore?: number; // Trust score for display
}

export interface InboxChannel {
  id: string;
  last_message?: string;
  unread_count: number;
  receiver: ChatReceiver;
  created_at?: string;
}

export interface CreateChannelResponse {
  success: boolean;
  data: {
    channel: ChatChannel;
    itemName: string;
  };
  message?: string;
}

export interface GetInboxResponse {
  success: boolean;
  data: {
    total: number;
    channels: InboxChannel[];
  };
}

export interface CloseChannelResponse {
  success: boolean;
  message: string;
}

export interface SendMessageParams {
  text: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  type: 'image' | 'file' | 'video';
  asset_url: string;
  title?: string;
  mime_type?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  user: ChatReceiver;
  created_at: string;
  attachments?: MessageAttachment[];
}
