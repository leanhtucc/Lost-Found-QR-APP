export type ReportStep = 1 | 2 | 3;

export interface ReportItemOption {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  imageUrl: string;
  serialNumber: string;
  insured: boolean;
}

export interface ReportLocation {
  title: string;
  subtitle: string;
  cityLine: string;
  lat?: number;
  lng?: number;
  address?: string;
}

export interface RewardOption {
  id: string;
  label: string;
  amount: number;
  recommended?: boolean;
}
