import { sendTelegramMessage, reportErrorToTelegram } from '../telegramLogger';

// Mock fetch
const globalFetch = jest.fn();
global.fetch = globalFetch;

describe('Telegram Logger Service (Logic Test)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendTelegramMessage', () => {
    it('should send an HTML formatted message successfully', async () => {
      globalFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true, result: { message_id: 123 } }),
      });

      const result = await sendTelegramMessage('<b>Test Message</b>', 'HTML');

      expect(result).toBe(true);
      expect(globalFetch).toHaveBeenCalledTimes(1);
      const [url, options] = globalFetch.mock.calls[0];
      expect(url).toContain('https://api.telegram.org/bot');
      expect(JSON.parse(options.body)).toEqual(
        expect.objectContaining({
          chat_id: expect.any(String),
          text: '<b>Test Message</b>',
          parse_mode: 'HTML',
        })
      );
    });

    it('should handle API failure gracefully', async () => {
      globalFetch.mockResolvedValueOnce({
        json: async () => ({ ok: false, description: 'Bad Request' }),
      });

      const result = await sendTelegramMessage('Error message');
      expect(result).toBe(false);
    });

    it('should handle network exceptions gracefully', async () => {
      globalFetch.mockRejectedValueOnce(new Error('Network disconnected'));

      const result = await sendTelegramMessage('Error message');
      expect(result).toBe(false);
    });
  });

  describe('reportErrorToTelegram', () => {
    it('should format error details with stack trace and context', async () => {
      globalFetch.mockResolvedValueOnce({
        json: async () => ({ ok: true }),
      });

      const testError = new TypeError('Cannot read properties of undefined');
      const result = await reportErrorToTelegram(testError, 'TestContext_Unit_1');

      expect(result).toBe(true);
      const [, options] = globalFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      expect(body.text).toContain('Lost &amp; Found QR');
      expect(body.text).toContain('TestContext_Unit_1');
      expect(body.text).toContain('Cannot read properties of undefined');
    });

    it('should deduplicate identical errors within 30 seconds', async () => {
      globalFetch.mockResolvedValue({
        json: async () => ({ ok: true }),
      });

      const testError = new Error('Frequent looped error');
      const firstResult = await reportErrorToTelegram(testError, 'LoopContext');
      const secondResult = await reportErrorToTelegram(testError, 'LoopContext');

      expect(firstResult).toBe(true);
      expect(secondResult).toBe(false); // blocked by deduplication
      expect(globalFetch).toHaveBeenCalledTimes(1);
    });
  });
});
