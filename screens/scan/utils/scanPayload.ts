/** Maximum length for manual input */
export const MAX_INPUT_LENGTH = 500;

/** Approved deep link schemes */
const APPROVED_SCHEMES = ['lostfound', 'lostfoundqr'] as const;

/** Approved web hosts */
const APPROVED_HOSTS = [
  'lostfound.app',
  'www.lostfound.app',
  'app.lostfound.vn',
  'www.app.lostfound.vn',
  // Production web deep-link host (see services/items/api.ts createGuardianItem)
  'findback.vn',
  'www.findback.vn',
] as const;

export interface NormalizeResultSuccess {
  success: true;
  itemId: string;
}

export interface NormalizeResultError {
  success: false;
  error: string;
}

export type NormalizeResult = NormalizeResultSuccess | NormalizeResultError;

/**
 * Normalizes and validates a QR scan payload.
 *
 * @param raw - The raw string from the QR scanner or manual input.
 * @returns NormalizeResult with the extracted itemId or an error message.
 */
export function normalizeScanPayload(raw: string): NormalizeResult {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { success: false, error: 'Vui lòng nhập mã QR hoặc liên kết.' };
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { success: false, error: 'Nội dung nhập quá dài.' };
  }

  // Reject dangerous schemes
  const dangerousSchemes = ['javascript:', 'data:', 'file:', 'blob:'];
  if (dangerousSchemes.some(scheme => trimmed.toLowerCase().startsWith(scheme))) {
    return { success: false, error: 'Liên kết không hợp lệ.' };
  }

  let extractedId = trimmed;

  try {
    const url = new URL(trimmed);
    const protocol = url.protocol.replace(':', '').toLowerCase();

    if (APPROVED_SCHEMES.includes(protocol as any)) {
      // Handle deep links like lostfound://item/123
      if (url.hostname === 'item') {
        const pathParts = url.pathname.split('/').filter(Boolean);
        extractedId = pathParts.length > 0 ? pathParts[0] : url.pathname.replace(/^\/+/, '');
      } else {
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts[0] === 'item' && pathParts.length > 1) {
          extractedId = pathParts[1];
        } else {
          return { success: false, error: 'Không tìm thấy mã vật phẩm trong liên kết.' };
        }
      }
    } else if (protocol === 'http' || protocol === 'https') {
      if (!APPROVED_HOSTS.includes(url.hostname as any)) {
        return { success: false, error: 'Liên kết không thuộc FindBack.' };
      }

      const pathParts = url.pathname.split('/').filter(Boolean);
      const itemIndex = pathParts.indexOf('item');
      if (itemIndex !== -1 && itemIndex + 1 < pathParts.length) {
        extractedId = pathParts[itemIndex + 1];
      } else {
        return { success: false, error: 'Không tìm thấy mã vật phẩm trong liên kết.' };
      }
    } else {
      return { success: false, error: 'Định dạng liên kết không được hỗ trợ.' };
    }
  } catch {
    // Not a valid URL, treat as raw item ID
    extractedId = trimmed;
  }

  // Strip query params and hash just in case
  extractedId = extractedId.split('?')[0].split('#')[0];

  if (!extractedId) {
    return { success: false, error: 'Mã QR không hợp lệ.' };
  }

  if (extractedId.length < 1 || extractedId.length > 128) {
    return { success: false, error: 'Mã QR không hợp lệ.' };
  }

  // Allowed ID chars: cuid (lowercase alphanumeric) and nanoid (adds - and _)
  if (!/^[a-zA-Z0-9_-]+$/.test(extractedId)) {
    return { success: false, error: 'Mã QR không hợp lệ.' };
  }

  return { success: true, itemId: extractedId };
}

/**
 * Extracts the item ID from a raw payload, returning null on failure.
 *
 * @param raw - The raw string to parse.
 * @returns The item ID or null.
 */
export function extractItemId(raw: string): string | null {
  const result = normalizeScanPayload(raw);
  return result.success ? result.itemId : null;
}
