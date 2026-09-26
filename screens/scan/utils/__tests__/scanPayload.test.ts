/**
 * Tests for scanPayload utility
 */

import { normalizeScanPayload, extractItemId, MAX_INPUT_LENGTH } from '../scanPayload';

describe('normalizeScanPayload', () => {
  // ── Valid raw IDs ─────────────────────────────────────────────

  it('accepts a valid raw item ID', () => {
    const result = normalizeScanPayload('abc-123-def');
    expect(result).toEqual({ success: true, itemId: 'abc-123-def' });
  });

  it('accepts alphanumeric ID', () => {
    const result = normalizeScanPayload('A1b2C3');
    expect(result).toEqual({ success: true, itemId: 'A1b2C3' });
  });

  it('trims whitespace from input', () => {
    const result = normalizeScanPayload('  abc-123  ');
    expect(result).toEqual({ success: true, itemId: 'abc-123' });
  });

  // ── Valid deep links ──────────────────────────────────────────

  it('extracts ID from lostfound://item/<id>', () => {
    const result = normalizeScanPayload('lostfound://item/my-item-id');
    expect(result).toEqual({ success: true, itemId: 'my-item-id' });
  });

  it('extracts ID from lostfoundqr://item/<id>', () => {
    const result = normalizeScanPayload('lostfoundqr://item/abc-123');
    expect(result).toEqual({ success: true, itemId: 'abc-123' });
  });

  // ── Valid web URLs ────────────────────────────────────────────

  it('extracts ID from approved host URL', () => {
    const result = normalizeScanPayload('https://lostfound.app/item/abc-123');
    expect(result).toEqual({ success: true, itemId: 'abc-123' });
  });

  it('extracts ID from www.lostfound.app URL', () => {
    const result = normalizeScanPayload('https://www.lostfound.app/item/xyz-789');
    expect(result).toEqual({ success: true, itemId: 'xyz-789' });
  });

  it('extracts ID from app.lostfound.vn URL', () => {
    const result = normalizeScanPayload('https://app.lostfound.vn/item/test-id');
    expect(result).toEqual({ success: true, itemId: 'test-id' });
  });

  it('strips query params from URL-extracted ID', () => {
    const result = normalizeScanPayload('https://lostfound.app/item/abc-123?ref=scan');
    expect(result).toEqual({ success: true, itemId: 'abc-123' });
  });

  // ── Rejection cases ───────────────────────────────────────────

  it('rejects empty input', () => {
    const result = normalizeScanPayload('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('nhập');
    }
  });

  it('rejects whitespace-only input', () => {
    const result = normalizeScanPayload('   ');
    expect(result.success).toBe(false);
  });

  it('rejects input exceeding MAX_INPUT_LENGTH', () => {
    const longInput = 'a'.repeat(MAX_INPUT_LENGTH + 1);
    const result = normalizeScanPayload(longInput);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('dài');
    }
  });

  it('rejects javascript: scheme', () => {
    const result = normalizeScanPayload('javascript:alert(1)');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('không hợp lệ');
    }
  });

  it('rejects data: scheme', () => {
    const result = normalizeScanPayload('data:text/html,<h1>test</h1>');
    expect(result.success).toBe(false);
  });

  it('rejects file: scheme', () => {
    const result = normalizeScanPayload('file:///etc/passwd');
    expect(result.success).toBe(false);
  });

  it('rejects blob: scheme', () => {
    const result = normalizeScanPayload('blob:http://example.com/123');
    expect(result.success).toBe(false);
  });

  it('rejects unsupported host URL', () => {
    const result = normalizeScanPayload('https://evil.com/item/abc-123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('FindBack');
    }
  });

  it('rejects approved host URL without /item/ path', () => {
    const result = normalizeScanPayload('https://lostfound.app/about');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('mã vật phẩm');
    }
  });

  it('rejects IDs with invalid characters', () => {
    const result = normalizeScanPayload('abc 123!@#');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('không hợp lệ');
    }
  });

  it('rejects IDs longer than 128 chars', () => {
    const result = normalizeScanPayload('a'.repeat(129));
    expect(result.success).toBe(false);
  });

  it('rejects ftp: scheme', () => {
    const result = normalizeScanPayload('ftp://example.com/file');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('không được hỗ trợ');
    }
  });
});

describe('extractItemId', () => {
  it('returns itemId for valid input', () => {
    expect(extractItemId('abc-123')).toBe('abc-123');
  });

  it('returns null for invalid input', () => {
    expect(extractItemId('')).toBeNull();
  });

  it('returns itemId from deep link', () => {
    expect(extractItemId('lostfound://item/test-id')).toBe('test-id');
  });
});
