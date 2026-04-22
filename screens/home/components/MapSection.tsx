import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { HomeLostFeedCard, HomeLostFeedPin } from '@/types/radar';

interface MapSectionProps {
  pins: HomeLostFeedPin[];
  cards: HomeLostFeedCard[];
  onUserLocationChange: (coords: { latitude: number; longitude: number }) => void;
}

interface MapMarkerPayload {
  itemId: string;
  latitude: number;
  longitude: number;
  isOwn: boolean;
  name?: string;
  lostMessage?: string | null;
  address?: string | null;
}

// Tọa độ fallback: trung tâm Hà Nội (Hoàn Kiếm)
const FALLBACK_REGION = {
  latitude: 21.027763,
  longitude: 105.83416,
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

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

      .leaflet-tooltip.lost-address-tooltip {
        background: rgba(14, 14, 22, 0.94);
        color: #f8f6ff;
        border: 1px solid rgba(199, 191, 255, 0.45);
        border-radius: 10px;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
        padding: 6px 10px;
      }

      .leaflet-tooltip-top.lost-address-tooltip:before {
        border-top-color: rgba(199, 191, 255, 0.45);
      }

      .lost-address-text {
        max-width: 190px;
        font-size: 11px;
        line-height: 1.35;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .lost-pin-wrapper {
        background: transparent;
        border: none;
      }

      .lost-pin {
        width: 16px;
        height: 16px;
        border-radius: 9999px;
        border: 2px solid rgba(255, 255, 255, 0.92);
        box-shadow:
          0 0 0 2px rgba(7, 9, 18, 0.55),
          0 4px 10px rgba(0, 0, 0, 0.38);
        position: relative;
      }

      .lost-pin::after {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.96);
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      .lost-pin-other {
        background: #f97316;
      }

      .lost-pin-own {
        background: #ef4444;
      }

      .user-location-wrapper {
        background: transparent;
        border: none;
      }

      .user-location-pulse {
        position: absolute;
        inset: 0;
        border-radius: 9999px;
        background: rgba(34, 211, 238, 0.16);
        box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.3);
        animation: user-location-pulse 1.8s ease-out infinite;
      }

      .user-location-dot {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 12px;
        height: 12px;
        border-radius: 9999px;
        transform: translate(-50%, -50%);
        background: #22d3ee;
        border: 2px solid rgba(255, 255, 255, 0.95);
        box-shadow:
          0 0 0 3px rgba(8, 15, 24, 0.65),
          0 8px 16px rgba(0, 0, 0, 0.35);
      }

      .leaflet-tooltip.user-location-tooltip {
        background: rgba(8, 15, 24, 0.94);
        color: #e6fffb;
        border: 1px solid rgba(34, 211, 238, 0.38);
        border-radius: 9999px;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
        padding: 4px 10px;
      }

      .leaflet-tooltip-top.user-location-tooltip:before {
        border-top-color: rgba(34, 211, 238, 0.38);
      }

      .user-location-text {
        font-size: 11px;
        line-height: 1.2;
        font-weight: 700;
        white-space: nowrap;
      }

      @keyframes user-location-pulse {
        0% {
          transform: scale(0.92);
          opacity: 0.95;
        }

        70% {
          transform: scale(1.6);
          opacity: 0;
        }

        100% {
          transform: scale(1.6);
          opacity: 0;
        }
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
        var hasFocusedOnRadar = false;
        var lastKnownUserLocation = null;

        var safeText = function (value) {
          if (!value) return '';
          return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        };

        var createLostMarkerIcon = function (isOwn) {
          var markerClassName = isOwn ? 'lost-pin-own' : 'lost-pin-other';

          return L.divIcon({
            className: 'lost-pin-wrapper',
            html: '<div class="lost-pin ' + markerClassName + '"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, -10],
          });
        };

        var focusRadarBounds = function (coordinates) {
          if (!Array.isArray(coordinates) || coordinates.length === 0) {
            return false;
          }

          var bounds = L.latLngBounds(coordinates);
          if (!bounds.isValid()) {
            return false;
          }

          map.fitBounds(bounds, {
            paddingTopLeft: [24, 110],
            paddingBottomRight: [24, 280],
            maxZoom: 14,
            animate: true,
          });

          hasFocusedOnRadar = true;
          return true;
        };

        window.__updateRadarMarkers = function (items) {
          radarLayer.clearLayers();
          if (!Array.isArray(items)) {
            return;
          }

          var radarCoordinates = [];

          items.forEach(function (item) {
            if (!item || typeof item.latitude !== 'number' || typeof item.longitude !== 'number') {
              return;
            }

            radarCoordinates.push([item.latitude, item.longitude]);

            var marker = L.marker([item.latitude, item.longitude], {
              icon: createLostMarkerIcon(Boolean(item.isOwn)),
            });

            var title = safeText(item.name || item.itemId || 'Lost item');
            var description = safeText(item.lostMessage || (item.isOwn ? 'Đồ thất lạc của bạn' : 'Đồ thất lạc nearby'));
            marker.bindPopup('<strong>' + title + '</strong><br />' + description);

            var addressTextRaw = typeof item.address === 'string' ? item.address.trim() : '';
            if (!addressTextRaw) {
              addressTextRaw = 'Lat ' + Number(item.latitude).toFixed(4) + ', Lng ' + Number(item.longitude).toFixed(4);
            }

            if (addressTextRaw) {
              var addressText = safeText(addressTextRaw);
              marker.bindTooltip(
                '<div class="lost-address-text">' + addressText + '</div>',
                {
                  permanent: true,
                  direction: 'top',
                  offset: [0, -12],
                  opacity: 1,
                  className: 'lost-address-tooltip',
                }
              );
              marker.openTooltip();
            }

            marker.addTo(radarLayer);
          });

          if (radarCoordinates.length > 0) {
            focusRadarBounds(radarCoordinates);
            return;
          }

          hasFocusedOnRadar = false;

          if (!hasCenteredOnUser && lastKnownUserLocation) {
            hasCenteredOnUser = true;
            map.setView(
              [lastKnownUserLocation.latitude, lastKnownUserLocation.longitude],
              Math.max(map.getZoom(), 14),
              {
                animate: true,
              }
            );
          }
        };

        window.__updateUserLocation = function (latitude, longitude, accuracy) {
          if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return;
          }

          lastKnownUserLocation = {
            latitude: latitude,
            longitude: longitude,
          };

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

          var userLocationIcon = L.divIcon({
            className: 'user-location-wrapper',
            html: '<div class="user-location-pulse"></div><div class="user-location-dot"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            tooltipAnchor: [0, -18],
          });

          var userMarker = L.marker([latitude, longitude], {
            icon: userLocationIcon,
            interactive: false,
            keyboard: false,
          }).addTo(userLayer);

          userMarker.bindTooltip('<div class="user-location-text">Vị trí của bạn</div>', {
            permanent: true,
            direction: 'top',
            offset: [0, -12],
            opacity: 1,
            className: 'user-location-tooltip',
          });
          userMarker.openTooltip();

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

          if (!hasCenteredOnUser && !hasFocusedOnRadar) {
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

export const MapSection: React.FC<MapSectionProps> = ({ pins, cards, onUserLocationChange }) => {
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

  const cardByItemId = useMemo(() => {
    const map = new Map<string, HomeLostFeedCard>();

    for (const card of cards) {
      map.set(card.itemId, card);
    }

    return map;
  }, [cards]);

  const markersPayload = useMemo<MapMarkerPayload[]>(() => {
    const markerMap = new Map<string, MapMarkerPayload>();

    for (const pin of pins) {
      if (!isFiniteNumber(pin.lat) || !isFiniteNumber(pin.lng)) {
        continue;
      }

      const card = cardByItemId.get(pin.itemId);
      markerMap.set(pin.itemId, {
        itemId: pin.itemId,
        latitude: pin.lat,
        longitude: pin.lng,
        isOwn: pin.isOwn,
        name: card?.name,
        lostMessage: card?.lostMessage,
        address: card?.address,
      });
    }

    return Array.from(markerMap.values());
  }, [cardByItemId, pins]);

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

    const markersJson = JSON.stringify(markersPayload).replace(/</g, '\\u003c');
    webViewRef.current?.injectJavaScript(`
      if (window.__updateRadarMarkers) {
        window.__updateRadarMarkers(${markersJson});
      }
      true;
    `);
  }, [isLeafletReady, markersPayload]);

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
