type GuestSessionListener = () => void;
const listeners = new Set<GuestSessionListener>();
export const guestSessionEvents = {
  emitChanged(): void {
    listeners.forEach(listener => listener());
  },
  subscribe(listener: GuestSessionListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
