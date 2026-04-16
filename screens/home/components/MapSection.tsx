import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { RadarLostItem } from '@/types/radar';
import { FIND_BACK } from '@constants/theme';

interface MapSectionProps {
  radarItems: RadarLostItem[];
  isRadarLoading: boolean;
  isRealtimeConnected: boolean;
  lastUpdatedAt: string | null;
  onUserLocationChange: (coords: { latitude: number; longitude: number }) => void;
}

const FALLBACK_REGION = {
  latitude: 10.762622,
  longitude: 106.660172,
};

const buildLeafletHtml = (initialLatitude: number, initialLongitude: number): string => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
    <style>
      html,
      body,
      #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        background: #0a0a0f;
      }

      .leaflet-container {
        background: #0a0a0f;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }

      .leaflet-control-attribution {
        display: none;
      }

      .leaflet-popup-content-wrapper {
        background: rgba(19, 19, 25, 0.92);
        color: #f9f5fd;
        border: 1px solid rgba(199, 191, 255, 0.25);
        border-radius: 12px;
      }

      .leaflet-popup-tip {
        background: rgba(19, 19, 25, 0.92);
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      crossorigin=""
    ></script>
    <script>
      (function () {
        var postToReactNative = function (payload) {
          if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        };

        var map = L.map('map', {
          zoomControl: false,
          preferCanvas: true,
        }).setView([${initialLatitude}, ${initialLongitude}], 14);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          subdomains: 'abcd',
        }).addTo(map);

        var radarLayer = L.layerGroup().addTo(map);
        var userLayer = L.layerGroup().addTo(map);
        var hasCenteredOnUser = false;

        var safeText = function (value) {
          if (!value) return '';
          return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        };

        window.__updateRadarMarkers = function (items) {
          radarLayer.clearLayers();
          if (!Array.isArray(items)) {
            return;
          }

          items.forEach(function (item) {
            if (!item || typeof item.latitude !== 'number' || typeof item.longitude !== 'number') {
              return;
            }

            var marker = L.circleMarker([item.latitude, item.longitude], {
              radius: 8,
              color: '#111827',
              weight: 2,
              fillColor: '#ef4444',
              fillOpacity: 1,
            });

            var title = safeText(item.name || 'Lost item');
            var description = safeText(item.lostMessage || item.description || 'Đồ thất lạc mới được báo mất');
            marker.bindPopup('<strong>' + title + '</strong><br />' + description);
            marker.addTo(radarLayer);
          });
        };

        window.__updateUserLocation = function (latitude, longitude, accuracy) {
          if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return;
          }

          userLayer.clearLayers();

          if (typeof accuracy === 'number' && accuracy > 0) {
            L.circle([latitude, longitude], {
              radius: accuracy,
              color: 'rgba(199,191,255,0.45)',
              fillColor: 'rgba(199,191,255,0.12)',
              weight: 1,
              fillOpacity: 0.5,
              interactive: false,
            }).addTo(userLayer);
          }

          L.circleMarker([latitude, longitude], {
            radius: 16,
            color: 'transparent',
            fillColor: 'rgba(199,191,255,0.25)',
            fillOpacity: 1,
            interactive: false,
          }).addTo(userLayer);

          L.circleMarker([latitude, longitude], {
            radius: 11,
            color: 'transparent',
            fillColor: 'rgba(199,191,255,0.45)',
            fillOpacity: 1,
            interactive: false,
          }).addTo(userLayer);

          L.circleMarker([latitude, longitude], {
            radius: 7,
            color: '#FFFFFF',
            weight: 2,
            fillColor: '#c7bfff',
            fillOpacity: 1,
            interactive: false,
          }).addTo(userLayer);

          if (!hasCenteredOnUser) {
            hasCenteredOnUser = true;
            map.setView([latitude, longitude], Math.max(map.getZoom(), 14), {
              animate: true,
            });
          }
        };

        postToReactNative({ type: 'map_ready' });
      })();
    </script>
  </body>
</html>
`;

const getTimeSinceUpdate = (timestamp: string | null): string => {
  if (!timestamp) {
    return 'Đang chờ định vị để quét radar';
  }

  const updatedAt = new Date(timestamp).getTime();
  if (Number.isNaN(updatedAt)) {
    return 'Vừa cập nhật';
  }

  const seconds = Math.max(0, Math.floor((Date.now() - updatedAt) / 1000));

  if (seconds < 60) {
    return `Cập nhật ${seconds} giây trước`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `Cập nhật ${minutes} phút trước`;
  }

  const hours = Math.floor(minutes / 60);
  return `Cập nhật ${hours} giờ trước`;
};

export const MapSection: React.FC<MapSectionProps> = ({
  radarItems,
  isRadarLoading,
  isRealtimeConnected,
  lastUpdatedAt,
  onUserLocationChange,
}) => {
  const webViewRef = useRef<WebView>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const latestLocationRef = useRef<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  const leafletHtml = useMemo(
    () => buildLeafletHtml(FALLBACK_REGION.latitude, FALLBACK_REGION.longitude),
    []
  );

  const statusText = useMemo(() => {
    if (isRadarLoading && radarItems.length === 0) {
      return 'Đang tải dữ liệu Live Radar...';
    }

    if (radarItems.length === 0) {
      return getTimeSinceUpdate(lastUpdatedAt);
    }

    return `${getTimeSinceUpdate(lastUpdatedAt)} - ${radarItems.length} đồ thất lạc quanh bạn`;
  }, [isRadarLoading, lastUpdatedAt, radarItems.length]);

  const pillAccentColor = isRealtimeConnected ? '#22C55E' : FIND_BACK.mutedText;

  const pushUserLocation = useCallback(
    (coords: Location.LocationObjectCoords) => {
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
        return;
      }

      const normalized = {
        latitude: Number(coords.latitude.toFixed(6)),
        longitude: Number(coords.longitude.toFixed(6)),
        accuracy: Number((coords.accuracy || 0).toFixed(1)),
      };

      latestLocationRef.current = normalized;
      onUserLocationChange({ latitude: normalized.latitude, longitude: normalized.longitude });

      if (!isLeafletReady) {
        return;
      }

      webViewRef.current?.injectJavaScript(`
        if (window.__updateUserLocation) {
          window.__updateUserLocation(${normalized.latitude}, ${normalized.longitude}, ${normalized.accuracy});
        }
        true;
      `);
    },
    [isLeafletReady, onUserLocationChange]
  );

  useEffect(() => {
    let isMounted = true;

    const watchLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted' || !isMounted) {
          return;
        }

        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!isMounted) {
          return;
        }

        pushUserLocation(initialLocation.coords);

        locationSubscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 15000,
            distanceInterval: 25,
          },
          location => {
            pushUserLocation(location.coords);
          }
        );
      } catch (error) {
        console.warn('[Leaflet] Failed to watch location:', error);
      }
    };

    void watchLocation();

    return () => {
      isMounted = false;
      locationSubscriptionRef.current?.remove();
      locationSubscriptionRef.current = null;
    };
  }, [pushUserLocation]);

  useEffect(() => {
    if (!isLeafletReady) {
      return;
    }

    const markersPayload = radarItems.map(item => ({
      id: item.itemId,
      latitude: item.latitude,
      longitude: item.longitude,
      name: item.name,
      description: item.description,
      lostMessage: item.lostMessage,
    }));

    const markersJson = JSON.stringify(markersPayload).replace(/</g, '\\u003c');
    webViewRef.current?.injectJavaScript(`
      if (window.__updateRadarMarkers) {
        window.__updateRadarMarkers(${markersJson});
      }
      true;
    `);
  }, [isLeafletReady, radarItems]);

  useEffect(() => {
    if (!isLeafletReady || !latestLocationRef.current) {
      return;
    }

    const { latitude, longitude, accuracy } = latestLocationRef.current;
    webViewRef.current?.injectJavaScript(`
      if (window.__updateUserLocation) {
        window.__updateUserLocation(${latitude}, ${longitude}, ${accuracy});
      }
      true;
    `);
  }, [isLeafletReady]);

  const handleWebMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as { type?: string };
      if (payload?.type === 'map_ready') {
        setIsLeafletReady(true);
      }
    } catch {
      // ignore non-json messages
    }
  }, []);

  return (
    <View className="h-full w-full">
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletHtml }}
        onMessage={handleWebMessage}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        setSupportMultipleWindows={false}
        style={StyleSheet.absoluteFillObject}
      />

      <View className="pointer-events-none absolute inset-0 bg-[#0a0a0f]/55" />
    </View>
  );
};
