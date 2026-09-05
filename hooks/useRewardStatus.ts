/**
 * useRewardStatus Hook
 * Quản lý trạng thái giải ngân tiền thưởng và polling cập nhật
 */

import { useState, useEffect, useCallback } from 'react';
import { useReturnStore } from '@/services/returns/store';

export const useRewardStatus = (sessionId?: string) => {
  const session = useReturnStore(state => state.session);
  const fetchRewardStatus = useReturnStore(state => state.fetchRewardStatus);
  const [loading, setLoading] = useState(false);

  const reward = session?.reward || null;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await fetchRewardStatus();
    } finally {
      setLoading(false);
    }
  }, [fetchRewardStatus]);

  // Polling while in REWARD_RELEASING or PROCESSING state
  useEffect(() => {
    if (session?.status === 'REWARD_RELEASING' || session?.reward?.status === 'PROCESSING') {
      const interval = setInterval(() => {
        fetchRewardStatus();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [session?.status, session?.reward?.status, fetchRewardStatus]);

  return {
    reward,
    status: session?.status,
    loading,
    refresh,
  };
};
