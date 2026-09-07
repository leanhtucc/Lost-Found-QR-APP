import type { StackNavigationProp } from '@react-navigation/stack';
import type { Region } from 'react-native-maps';
import type { RootStackParamList } from '@navigation/index';
import type { ItemCategory } from '@/types/item';
import type { MapAutocompletePrediction } from '@/services/map';

export type ManualFoundReportNav = StackNavigationProp<RootStackParamList, 'ManualFoundReport'>;

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface UseManualFoundReportReturn {
  navigation: ManualFoundReportNav;
  formScrollRef: React.RefObject<any>;

  // Form State
  imageUri: string | null;
  name: string;
  category: ItemCategory;
  description: string;
  locationText: string;
  selectedCoordinates: LocationCoordinates | null;
  imagePublicUrl: string | undefined;

  // Status flags
  isAnalyzing: boolean;
  isSubmitting: boolean;
  isResolvingCurrentLocation: boolean;
  isResolvingMapAddress: boolean;
  hasValidLocation: boolean;
  canSubmit: boolean;

  // Handlers for Form
  setName: (val: string) => void;
  setCategory: (val: ItemCategory) => void;
  setDescription: (val: string) => void;
  setLocationText: (val: string) => void;
  handleChooseImage: () => void;
  fetchCurrentLocation: (isSilent?: boolean) => Promise<void>;
  handleLocationTextBlur: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  revealFocusedInput: () => void;

  // Map Picker State & Handlers
  isMapPickerVisible: boolean;
  setIsMapPickerVisible: (visible: boolean) => void;
  mapRegion: Region;
  setMapRegion: React.Dispatch<React.SetStateAction<Region>>;
  mapSearchQuery: string;
  isSearchingAddress: boolean;
  searchResults: MapAutocompletePrediction[];
  handleOpenMapPicker: () => void;
  handleSearchAddress: (query: string) => void;
  handleSelectSearchResult: (item: MapAutocompletePrediction) => Promise<void>;
  handleConfirmMapLocation: () => Promise<void>;
  setMapSearchQuery: (query: string) => void;
  setSearchResults: (results: MapAutocompletePrediction[]) => void;
}
