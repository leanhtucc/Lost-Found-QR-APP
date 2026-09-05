import { MapStyleElement } from 'react-native-maps';

export const DARK_GOOGLE_MAP_STYLE: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#17171f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b8b5c8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#17171f' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#363342' }],
  },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1c1c25' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#20202a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8e8a9d' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#30303b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#17171f' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#aaa6ba' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#474354' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#292934' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1822' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#718493' }] },
];
