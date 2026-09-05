export interface MapAutocompletePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export interface MapPlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
}

export interface MapGeocodeResult {
  formatted_address: string;
  lat: number;
  lng: number;
}

export interface MapApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
