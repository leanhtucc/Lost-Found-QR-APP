import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { DashboardData } from '@/types/item';

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#121214',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#8b8b8b',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#121214',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#0d0d0f',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#1e1e24',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#212a37',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9ca5b3',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#2e2d3b',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#1f2835',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#f3d19c',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#515c6d',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
];

interface MapSectionProps {
  dashboardData: DashboardData | null;
}

export const MapSection: React.FC<MapSectionProps> = ({ dashboardData }) => {
  // initial region
  const initialRegion = {
    latitude: 10.762622,
    longitude: 106.660172,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        customMapStyle={darkMapStyle}
        showsUserLocation
      >
        {/* Render markers for items if needed or just mockup */}
        <Marker coordinate={{ latitude: 10.763, longitude: 106.661 }}>
          <View className="w-8 h-8 rounded-full bg-purple-500 justify-center items-center border-2 border-gray-900 border-solid shadow-[0_0_8px_rgba(108,99,255,0.6)]">
            <View className="w-3 h-3 rounded-full bg-white" />
          </View>
        </Marker>
        <Marker coordinate={{ latitude: 10.769, longitude: 106.665 }}>
          <View className="w-8 h-8 rounded-full bg-orange-500 justify-center items-center border-2 border-gray-900 border-solid shadow-[0_0_8px_rgba(249,115,22,0.6)]">
            <Text className="text-white text-xs font-bold">?</Text>
          </View>
        </Marker>
      </MapView>

      {/* Pill Notification */}
      <View className="absolute top-28 left-0 right-0 items-center justify-center pointer-events-none">
        <View className="bg-green-500/20 px-4 py-1.5 rounded-full border border-green-500/30 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
          <Text className="text-green-500 text-xs font-medium">Cập nhật 12 giây trước</Text>
        </View>
      </View>
    </View>
  );
};
