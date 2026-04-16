export interface RadarNearbyQuery {
  lat: number;
  lng: number;
  radius?: number;
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
  status: 'lost';
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
