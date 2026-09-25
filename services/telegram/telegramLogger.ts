import { Platform } from 'react-native';
import Constants from 'expo-constants';
import ENV from '@/constants/environment';

interface ErrorReportOptions {
  context?: string;
  isFatal?: boolean;
  metadata?: Record<string, unknown>;
}

// Deduplication cache to prevent spamming Telegram if an error loops
const recentErrors = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 30000; // 30 seconds
let isInitialized = false;

/**
 * Escapes HTML characters for Telegram HTML mode
 */
const escapeHtml = (text: string): string => {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * Sends a formatted message to Telegram Bot
 */
export const sendTelegramMessage = async (
  message: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> => {
  const botToken = ENV.TELEGRAM_BOT_TOKEN;
  const chatId = ENV.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    if (__DEV__) {
      console.warn('[TelegramLogger] Bot token or Chat ID is not configured.');
    }
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (!data.ok && __DEV__) {
      console.warn('[TelegramLogger] Failed to send message:', data.description);
    }
    return data.ok;
  } catch (err) {
    if (__DEV__) {
      console.warn('[TelegramLogger] Network error when sending to Telegram:', err);
    }
    return false;
  }
};

/**
 * Formats and reports an error to Telegram
 */
export const reportErrorToTelegram = async (
  error: unknown,
  options?: string | ErrorReportOptions
): Promise<boolean> => {
  const opts: ErrorReportOptions =
    typeof options === 'string' ? { context: options } : options || {};
  const errorObj = error instanceof Error ? error : new Error(String(error));

  const errorName = errorObj.name || 'Error';
  const errorMessage = errorObj.message || 'Unknown error';
  const context = opts.context || 'App Runtime';
  const isFatal = opts.isFatal ?? false;

  // Deduplication check
  const errorKey = `${errorName}:${errorMessage}:${context}`;
  const now = Date.now();
  const lastSent = recentErrors.get(errorKey);
  if (lastSent && now - lastSent < DEDUPLICATION_WINDOW_MS) {
    return false;
  }
  recentErrors.set(errorKey, now);

  // Device & App info
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const platformInfo = `${Platform.OS.toUpperCase()} ${Platform.Version}`;
  const env = ENV.ENVIRONMENT || (__DEV__ ? 'development' : 'production');
  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  // Clean stack trace (max 8 lines to stay readable in Telegram)
  let stackSummary = 'No stack trace';
  if (errorObj.stack) {
    stackSummary = errorObj.stack.split('\n').slice(0, 8).join('\n');
  }

  const fatalTag = isFatal ? '🔥 <b>[FATAL CRASH]</b>' : '⚠️ <b>[ERROR ALERT]</b>';

  const html = [
    `${fatalTag} <b>Lost &amp; Found QR</b>`,
    '',
    `📍 <b>Ngữ cảnh:</b> ${escapeHtml(context)}`,
    `❌ <b>Lỗi:</b> <code>${escapeHtml(errorName)}: ${escapeHtml(errorMessage)}</code>`,
    `📱 <b>Thiết bị:</b> ${escapeHtml(platformInfo)} (App v${escapeHtml(appVersion)})`,
    `🌐 <b>Môi trường:</b> <code>${escapeHtml(env)}</code>`,
    `⏰ <b>Thời gian:</b> ${escapeHtml(timestamp)}`,
    '',
    '📜 <b>Stack Trace:</b>',
    `<pre><code>${escapeHtml(stackSummary)}</code></pre>`,
  ].join('\n');

  return sendTelegramMessage(html, 'HTML');
};

/**
 * Initializes global error listeners and sends launch test if configured
 */
export const initTelegramLogger = (): void => {
  if (isInitialized) return;
  isInitialized = true;

  // 1. Hook into Global JS Error Handler (React Native)
  const defaultErrorHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    reportErrorToTelegram(error, {
      context: isFatal ? 'Fatal Crash' : 'Global JS Handler',
      isFatal,
    }).catch(() => {
      // Ignore Telegram network failure on crash
    });

    if (defaultErrorHandler) {
      defaultErrorHandler(error, isFatal);
    }
  });

  // 2. Hook into Promise Rejection if supported
  if (typeof global !== 'undefined' && (global as any).HermesInternal?.hasPromise?.()) {
    // Hermes promise rejection tracking can also be tracked if needed
  }

  // 3. Test on launch notification
  if (ENV.TELEGRAM_TEST_ON_LAUNCH) {
    const appVersion = Constants.expoConfig?.version ?? '1.0.0';
    const env = ENV.ENVIRONMENT || (__DEV__ ? 'development' : 'production');
    const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    const launchMessage = [
      '🚀 <b>[Lost &amp; Found QR] Khởi động ứng dụng</b>',
      '',
      `✅ Kết nối Telegram Bot báo lỗi thành công!`,
      `📱 <b>Nền tảng:</b> ${Platform.OS.toUpperCase()} ${Platform.Version}`,
      `📦 <b>Phiên bản App:</b> v${appVersion}`,
      `🌐 <b>Môi trường:</b> <code>${env}</code>`,
      `⏰ <b>Thời gian:</b> ${timestamp}`,
    ].join('\n');

    sendTelegramMessage(launchMessage, 'HTML').catch(() => {
      // Ignore launch test errors
    });
  }
};
