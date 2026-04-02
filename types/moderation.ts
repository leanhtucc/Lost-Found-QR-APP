/**
 * Moderation Types
 * Định nghĩa các kiểu dữ liệu cho hệ thống kiểm duyệt
 */

export interface FlagResponse {
  success: boolean;
  data: {
    flag: {
      user_id: string;
      target_message_id: string;
      created_at: string;
    };
  };
  message: string;
}

export interface UnflagResponse {
  success: boolean;
  message: string;
}

export interface MuteUserParams {
  timeout?: number; // Thời gian tắt tiếng (phút), undefined = vĩnh viễn
}

export interface MuteResponse {
  success: boolean;
  message: string;
}

export interface UnmuteResponse {
  success: boolean;
  message: string;
}

export interface BanUserParams {
  reason?: string;
  timeout?: number; // Thời gian chặn (phút)
}

export interface BanResponse {
  success: boolean;
  message: string;
}

export interface FlaggedMessageUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface FlaggedMessage {
  id: string;
  text: string;
  user: FlaggedMessageUser;
  flags_count: number;
  created_at?: string;
}

export interface FlaggedMessagesResponse {
  success: boolean;
  data: {
    total: number;
    messages: FlaggedMessage[];
  };
}
