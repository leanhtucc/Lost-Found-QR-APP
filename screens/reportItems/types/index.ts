export type ReportStep = 1 | 2 | 3 | 4;

export interface ReportItemDetails {
  color: string;
  storage: string;
  serial: string;
}

export interface ReportItemOption {
  id: string;
  itemId: string;
  name: string;
  category: string;
  subtitle: string;
  imageUrl: string | null;
  details: ReportItemDetails;
  hasInsurance: boolean;
  status: 'SAFE' | 'PENDING_PAYMENT' | 'LOST' | 'FOUND' | 'RESOLVED';
  isEligible: boolean;
}

export interface ReportLocation {
  title: string;
  subtitle: string;
  cityLine: string;
  lat: number;
  lng: number;
  address: string;
}

export interface RewardOption {
  id: string;
  label: string;
  amount: number;
  recommended?: boolean;
  isCustom?: boolean;
}

export interface RadarSimulationState {
  activeUsersCount: number;
  recommendedRadius: number;
  estimatedDurationHours: number;
  simulatedLat: number;
  simulatedLng: number;
}
