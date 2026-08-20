type SessionEventListener = () => void;
const listeners = new Set<SessionEventListener>();

export const sessionEvents = {
  onSessionExpired: (listener: SessionEventListener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emitSessionExpired: () => {
    listeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error('Error in sessionExpired listener:', err);
      }
    });
  },
};
