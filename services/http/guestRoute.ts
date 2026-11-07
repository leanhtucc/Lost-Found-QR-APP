const trimApiPrefix = (pathname: string): string =>
  pathname.replace(/^\/(?:api\/)?v1(?=\/)/, '').replace(/^\/api(?=\/)/, '');
export interface GuestRouteMatch {
  allowed: boolean;
  returnSessionId?: string;
}
export const matchGuestRoute = (input: string, method = 'GET'): GuestRouteMatch => {
  let pathname: string;
  try {
    pathname = new URL(input, 'https://api.local').pathname;
  } catch {
    return { allowed: false };
  }
  const path = trimApiPrefix(pathname).replace(/\/+$/, '') || '/';
  const verb = method.toUpperCase();
  if (verb === 'POST' && /^\/guest\/(?:refresh|stream-token)$/.test(path)) {
    return { allowed: true };
  }
  const segments = path.split('/').filter(Boolean);
  if (segments[0] !== 'returns' || !segments[1]) return { allowed: false };
  const sessionId = segments[1];
  const rest = segments.slice(2);
  if (verb === 'GET' && (rest.length === 0 || (rest.length === 1 && rest[0] === 'reward'))) {
    return { allowed: true, returnSessionId: sessionId };
  }
  if (verb !== 'POST') return { allowed: false };
  const allowedActions =
    (rest.length === 2 &&
      ((rest[0] === 'meetup' && ['propose', 'accept', 'reject'].includes(rest[1])) ||
        (rest[0] === 'tracking' && ['start', 'stop'].includes(rest[1])) ||
        (rest[0] === 'handover' && rest[1] === 'init'))) ||
    (rest.length === 1 && ['arrival', 'cancel'].includes(rest[0]));
  return allowedActions ? { allowed: true, returnSessionId: sessionId } : { allowed: false };
};
export const isGuestRouteAllowed = (
  input: string,
  method: string,
  returnSessionId?: string
): boolean => {
  const match = matchGuestRoute(input, method);
  if (!match.allowed) return false;
  if (!match.returnSessionId) return true;
  return match.returnSessionId === returnSessionId;
};
