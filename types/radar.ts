export interface RadarNearbyQuery {
  lat: number;
  lng: number;
  radius?: number;
}

export interface HomeLostFeedQuery {
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface HomeLostFeedPin {
  itemId: string;
  lat: number;
  lng: number;
  isOwn: boolean;
}

export interface HomeLostFeedCard {
  itemId: string;
  name: string;
  category: RadarCategory | string;
  imagePublicUrl: string | null;
  lostMessage: string | null;
  address: string | null;
  distanceMeters: number | null;
  distanceLabel: string | null;
  lostLat: number | null;
  lostLng: number | null;
  isOwn: boolean;
  ownerDisplayName: string;
  ownerPhotoURL: string | null;
  reportedAt: string;
}

export interface HomeLostFeedData {
  myLostCount: number;
  nearbyCount: number;
  pins: HomeLostFeedPin[];
  cards: HomeLostFeedCard[];
}

export type RadarCategory =
  | 'electronics'
  | 'accessories'
  | 'bags'
  | 'documents'
  | 'clothing'
  | 'keys'
  | 'wallet'
  | 'other';

export interface RadarSubscribePayload {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface RadarHeartbeatPayload {
  latitude: number;
  longitude: number;
}

export interface RadarNearbyApiItem {
  itemId: string;
  name: string;
  category: RadarCategory | string;
  status: string;
  lostMessage?: string;
  imagePublicUrl?: string;
  distanceMetres?: number;
  lostLat?: number;
  lostLng?: number;
  ownerDisplayName?: string;
  ownerPhotoURL?: string;
}

export interface RadarRealtimeLostItemPayload {
  itemId: string;
  name: string;
  category: RadarCategory | string;
  lostMessage?: string;
  imagePublicUrl?: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
  reportedAt?: string;
}

export interface RadarLostItem {
  itemId: string;
  name: string;
  category: RadarCategory | string;
  status: 'LOST';
  description?: string;
  lostMessage?: string;
  imagePublicUrl?: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
  reportedAt?: string;
  ownerDisplayName?: string;
  ownerPhotoURL?: string;
}

export interface RadarApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface RadarSubscribeAck {
  success: boolean;
  message?: string;
  data?: {
    joinedRooms?: number;
  };
}

export interface RadarHeartbeatAck {
  success: boolean;
  message?: string;
}

export interface RadarUnsubscribeAck {
  success: boolean;
  message?: string;
}
