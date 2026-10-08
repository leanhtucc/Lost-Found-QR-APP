export type ApiErrorKind =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limit'
  | 'network'
  | 'timeout'
  | 'server'
  | 'unknown';

export interface BackendErrorShape {
  code?: string;
  details?: unknown;
  fields?: Record<string, string>;
}

const kindFromStatus = (status: number, code: string): ApiErrorKind => {
  if (code === 'VALIDATION_ERROR' || status === 400 || status === 422) return 'validation';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate_limit';
  if (status >= 500) return 'server';
  return 'unknown';
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details?: unknown,
    options?: { cause?: unknown; kind?: ApiErrorKind }
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = options?.kind || kindFromStatus(status, code);
    if (options?.cause !== undefined) this.cause = options.cause;
  }

  static network(cause: unknown): ApiError {
    return new ApiError('Không thể kết nối đến máy chủ.', 0, 'NETWORK_ERROR', undefined, {
      cause,
      kind: 'network',
    });
  }

  static timeout(): ApiError {
    return new ApiError('Yêu cầu đã hết thời gian chờ.', 0, 'TIMEOUT', undefined, {
      kind: 'timeout',
    });
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
