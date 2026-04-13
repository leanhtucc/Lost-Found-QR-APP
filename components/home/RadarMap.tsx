// components/home/RadarMap.tsx
import React, { useEffect } from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

// Load custom dark style JSON
import mapStyleDark from '../../assets/maps/mapStyleDark.json';

interface RadarMapProps {
  markers: { id: string; latitude: number; longitude: number; type: 'lost' | 'found' }[];
}

export const RadarMap: React.FC<RadarMapProps> = ({ markers }) => {
  // Remove unused Dimensions and unused variables
  // const { width, height } = Dimensions.get('window');

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.5, { duration: 1200 }), -1, true);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.7,
  }));

  const initialRegion = {
    latitude: markers[0]?.latitude ?? 10.762622,
    longitude: markers[0]?.longitude ?? 106.660172,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View className="h-1/2 rounded-3xl overflow-hidden">
      <MapView
        style={{ width: '100%', height: '100%' }}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        customMapStyle={mapStyleDark}
        showsUserLocation
      >
        {markers.map(m => (
          <Marker key={m.id} coordinate={{ latitude: m.latitude, longitude: m.longitude }}>
            <Animated.View style={animatedStyle} className="w-4 h-4 bg-purple-500 rounded-full" />
          </Marker>
        ))}
      </MapView>
    </View>
  );
};
