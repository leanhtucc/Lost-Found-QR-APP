/**
 * Return Session Zustand Store
 * Quản lý state đồng bộ client-server cho luồng hoàn trả đồ thất lạc.
 * Tuân thủ quy tắc Zustand: subscribeWithSelector, tách State & Actions,
 * Server là nguồn dữ liệu chuẩn.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  ReturnSession,
  ReturnUserRole,
  LiveLocation,
  ProposeMeetupRequest,
  HandoverDetails,
  RewardPayout,
  SubmitRatingRequest,
} from '@/types/return-flow';
import { returnApi } from './api';
import { User } from '@/services/auth/types';

export interface ReturnState {
  session: ReturnSession | null;
  currentRole: ReturnUserRole | null;
  currentUserId: string | null;
  myLocation: LiveLocation | null;
  partnerLocation: LiveLocation | null;
  isPartnerLocationStale: boolean;
  connectionState: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
  gpsState: 'idle' | 'acquiring' | 'ready' | 'permission_denied' | 'weak';
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  errorCode: string | null;
}

export interface ReturnActions {
  // Session initialization & refresh
  initSession: (
    channelId: string,
    currentUser: User | null,
    initialData?: Partial<ReturnSession>
  ) => Promise<ReturnSession>;
  refreshSession: (sessionId?: string, currentUser?: User | null) => Promise<ReturnSession | null>;
  setSession: (session: ReturnSession) => void;

  // Location & Network States
  setMyLocation: (location: LiveLocation) => void;
  setPartnerLocation: (location: LiveLocation) => void;
  setPartnerLocationStale: (stale: boolean) => void;
  setConnectionState: (state: ReturnState['connectionState']) => void;
  setGpsState: (state: ReturnState['gpsState']) => void;

  // Domain Actions
  proposeMeetup: (request: ProposeMeetupRequest) => Promise<boolean>;
  acceptMeetup: () => Promise<boolean>;
  rejectMeetup: () => Promise<boolean>;
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<void>;
  notifyArrival: () => Promise<boolean>;
  initHandover: () => Promise<HandoverDetails | null>;
  confirmHandover: (code?: string) => Promise<boolean>;
  disputeHandover: (reason: string) => Promise<boolean>;
  fetchRewardStatus: () => Promise<RewardPayout | null>;
  submitRating: (request: SubmitRatingRequest) => Promise<boolean>;

  // Clear
  clearError: () => void;
  reset: () => void;
}

export type ReturnStore = ReturnState & ReturnActions;

const initialState: ReturnState = {
  session: null,
  currentRole: null,
  currentUserId: null,
  myLocation: null,
  partnerLocation: null,
  isPartnerLocationStale: false,
  connectionState: 'idle',
  gpsState: 'idle',
  isLoading: false,
  isSubmitting: false,
  error: null,
  errorCode: null,
};

export const useReturnStore = create<ReturnStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    initSession: async (channelId, currentUser, initialData) => {
      set({ isLoading: true, error: null, errorCode: null });
      try {
        const session = await returnApi.createOrGetSession(
          channelId,
          initialData?.itemId,
          initialData
        );

        // Determine role based on current authenticated user
        const uid = currentUser?.id || currentUser?.memberId || currentUser?.uid || '';
        let role: ReturnUserRole = 'FINDER';

        if (uid) {
          if (session.owner.id === uid) {
            role = 'OWNER';
          } else if (session.finder.id === uid) {
            role = 'FINDER';
          } else if (initialData?.owner?.id === uid) {
            role = 'OWNER';
          }
        }

        set({
          session,
          currentRole: role,
          currentUserId: uid,
          isLoading: false,
          error: null,
          errorCode: null,
        });

        return session;
      } catch (err: any) {
        const errorMsg = err?.message || 'Không thể khởi tạo phiên hoàn trả';
        set({ error: errorMsg, errorCode: err?.code || null, isLoading: false });
        throw err;
      }
    },

    refreshSession: async (targetSessionId, currentUser) => {
      const sessionId = targetSessionId || get().session?.id;
      if (!sessionId) return null;

      try {
        const session = await returnApi.getSession(sessionId);

        // Re-evaluate role if user provided or exists
        const uid =
          currentUser?.id || currentUser?.memberId || currentUser?.uid || get().currentUserId;
        let role = get().currentRole;

        if (uid) {
          if (session.owner.id === uid) {
            role = 'OWNER';
          } else if (session.finder.id === uid) {
            role = 'FINDER';
          }
        }

        set({ session, currentRole: role, error: null, errorCode: null });
        return session;
      } catch (err: any) {
        console.warn('[ReturnStore] Refresh session failed:', err);
        return null;
      }
    },

    setSession: session => {
      set({ session });
    },

    setMyLocation: location => {
      set({ myLocation: location });
    },

    setPartnerLocation: location => {
      const isStale = Date.now() - new Date(location.capturedAt).getTime() > 60 * 1000;
      set({ partnerLocation: location, isPartnerLocationStale: isStale });
    },

    setPartnerLocationStale: stale => {
      set({ isPartnerLocationStale: stale });
    },

    setConnectionState: connectionState => {
      set({ connectionState });
    },

    setGpsState: gpsState => {
      set({ gpsState });
    },

    proposeMeetup: async request => {
      const { session } = get();
      if (!session) return false;

      set({ isSubmitting: true, error: null, errorCode: null });
      try {
        const updated = await returnApi.proposeMeetup(session.id, request, session.serverRevision);
        set({ session: updated, isSubmitting: false, error: null, errorCode: null });
        return true;
      } catch (err: any) {
        set({
          error: err?.message || 'Lỗi gửi đề xuất điểm gặp',
          errorCode: err?.code || null,
          isSubmitting: false,
        });
        return false;
      }
    },

    acceptMeetup: async () => {
      const { session } = get();
      if (!session) return false;

      set({ isSubmitting: true, error: null, errorCode: null });
      try {
        const updated = await returnApi.acceptMeetup(session.id, session.serverRevision);
        set({ session: updated, isSubmitting: false, error: null, errorCode: null });
        return true;
      } catch (err: any) {
        set({
          error: err?.message || 'Lỗi chấp nhận điểm gặp',
          errorCode: err?.code || null,
          isSubmitting: false,
        });
        return false;
      }
    },

    rejectMeetup: async () => {
      const { session } = get();
      if (!session) return false;

      set({ isSubmitting: true, error: null, errorCode: null });
      try {
        const updated = await returnApi.rejectMeetup(session.id, session.serverRevision);
        set({ session: updated, isSubmitting: false, error: null, errorCode: null });
        return true;
      } catch (err: any) {
        set({
          error: err?.message || 'Lỗi từ chối điểm gặp',
          errorCode: err?.code || null,
          isSubmitting: false,
        });
        return false;
      }
    },

    startTracking: async () => {
      const { session } = get();
      if (!session) return false;

      set({ isSubmitting: true, error: null, errorCode: null });
      try {
        const updated = await returnApi.startTracking(session.id);
        set({ session: updated, isSubmitting: false, error: null, errorCode: null });
        return true;
      } catch (err: any) {
        set({
          error: err?.message || 'Lỗi bắt đầu tracking',
          errorCode: err?.code || null,
          isSubmitting: false,
        });
        return false;
      }
    },

    stopTracking: async () => {
      const { session } = get();
      if (!session) return;
      await returnApi.stopTracking(session.id);
    },

    notifyArrival: async () => {
      const { session } = get();
      if (!session) return false;

      set({ isSubmitting: true, error: null, errorCode: null });
      try {
        const updated = await returnApi.notifyArrival(session.id);
        set({ session: updated, isSubmitting: false, error: null, errorCode: null });
        return true;
      } catch (err: any) {
        set({
          error: err?.message || 'Lỗi thông báo đến điểm hẹn',
          errorCode: err?.code || null,
          isSubmitting: false,
        });
        return false;
      }
    },

    initHandover: async () => {
      const { session } = get();
      if (!session) return null;

      try {
        const details = await returnApi.initHandover(session.id);
        set(state => ({
          session: state.session
            ? { ...state.session, handover: details, status: 'HANDOVER_PENDING' }
            : null,
          error: null,
          errorCode: null,
        }));
        return details;
      } catch (err: any) {
        set({
          error: err?.message || 'Lỗi khởi tạo bàn giao',
          errorCode: err?.code || null,
        });
        return null;
      }
    },

    confirmHandover: async code => {
      const { session } = get();
      if (!session) return false;

      set({ isSubmitting: true, error: null, errorCode: null });
      try {
        const idempotencyKey = `confirm_${session.id}_${Date.now()}`;
        const updated = await returnApi.confirmHandover(
          session.id,
          {
            code,
            idempotencyKey,
          },
          session.serverRevision
        );
        set({ session: updated, isSubmitting: false, error: null, errorCode: null });
        return true;
      } catch (err: any) {
        set({
          error: err?.message || 'Xác nhận bàn giao không thành công',
          errorCode: err?.code || null,
          isSubmitting: false,
        });
        return false;
      }
    },

    disputeHandover: async reason => {
      const { session } = get();
      if (!session) return false;

      set({ isSubmitting: true, error: null, errorCode: null });
      try {
        const updated = await returnApi.disputeHandover(session.id, { reason });
        set({ session: updated, isSubmitting: false, error: null, errorCode: null });
        return true;
      } catch (err: any) {
        set({
          error: err?.message || 'Lỗi báo cáo tranh chấp',
          errorCode: err?.code || null,
          isSubmitting: false,
        });
        return false;
      }
    },

    fetchRewardStatus: async () => {
      const { session } = get();
      if (!session) return null;

      try {
        const reward = await returnApi.getRewardStatus(session.id);
        set(state => ({
          session: state.session ? { ...state.session, reward } : null,
          error: null,
          errorCode: null,
        }));
        return reward;
      } catch (err: any) {
        console.warn('[ReturnStore] Fetch reward status failed:', err);
        return null;
      }
    },

    submitRating: async request => {
      const { session } = get();
      if (!session) return false;

      set({ isSubmitting: true, error: null, errorCode: null });
      try {
        const updated = await returnApi.submitRating(session.id, request);
        set({ session: updated, isSubmitting: false, error: null, errorCode: null });
        return true;
      } catch (err: any) {
        set({
          error: err?.message || 'Lỗi gửi đánh giá',
          errorCode: err?.code || null,
          isSubmitting: false,
        });
        return false;
      }
    },

    clearError: () => set({ error: null, errorCode: null }),

    reset: () => set(initialState),
  }))
);
