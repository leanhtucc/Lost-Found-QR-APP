import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Crosshair, MapPin } from 'lucide-react-native';
import { REPORT_COLORS, REPORT_LAYOUT } from '../constants/theme';
import { ReportLocation } from '../types';

interface LocationStepProps {
  location: ReportLocation;
  manualAddress: string;
  onChangeManualAddress: (value: string) => void;
  useCurrentLocation: boolean;
  onToggleUseCurrentLocation: () => void;
  isResolvingCurrentLocation?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
}

// ─── Leaflet HTML builder (same dark-map style as MapSection) ────────────────

const buildLeafletHtml = (lat: number, lng: number): string => `
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
      html, body, #map {
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

      .leaflet-control-attribution { display: none; }

      /* Fixed center pin */
      .center-pin-wrapper {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 1000;
        pointer-events: none;
        transform: translate(-50%, -100%);
      }

      .center-pin-shadow {
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 12px;
        height: 4px;
        border-radius: 50%;
        background: rgba(0,0,0,0.35);
      }

      .center-pin-body {
        width: 36px;
        height: 44px;
        position: relative;
      }

      .center-pin-head {
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        background: linear-gradient(135deg, #8b5cf6, #a78bfa);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
          0 0 0 3px rgba(139, 92, 246, 0.3),
          0 4px 12px rgba(0,0,0,0.4);
      }

      .center-pin-inner {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #fff;
        transform: rotate(45deg);
      }

      /* Pulse ring around pin */
      .center-pin-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: rgba(139, 92, 246, 0.12);
        animation: pin-pulse 2s ease-out infinite;
        pointer-events: none;
        z-index: 999;
      }

      @keyframes pin-pulse {
        0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.8; }
        70% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
      }

      /* Label tag below pin */
      .center-pin-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, 16px);
        z-index: 1000;
        pointer-events: none;
        background: rgba(8,8,15,0.92);
        border: 1px solid rgba(167,139,250,0.35);
        border-radius: 999px;
        padding: 4px 12px;
        white-space: nowrap;
      }

      .center-pin-label-text {
        color: #a78bfa;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      /* User location dot */
      .user-location-wrapper { background: transparent; border: none; }

      .user-location-pulse {
        position: absolute;
        inset: 0;
        border-radius: 9999px;
        background: rgba(34, 211, 238, 0.16);
        animation: user-loc-pulse 1.8s ease-out infinite;
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
        border: 2px solid rgba(255,255,255,0.95);
        box-shadow:
          0 0 0 3px rgba(8,15,24,0.65),
          0 8px 16px rgba(0,0,0,0.35);
      }

      .leaflet-tooltip.user-location-tooltip {
        background: rgba(8,15,24,0.94);
        color: #e6fffb;
        border: 1px solid rgba(34,211,238,0.38);
        border-radius: 9999px;
        box-shadow: 0 8px 18px rgba(0,0,0,0.35);
        padding: 4px 10px;
      }

      .leaflet-tooltip-top.user-location-tooltip:before {
        border-top-color: rgba(34,211,238,0.38);
      }

      .user-location-text {
        font-size: 11px;
        line-height: 1.2;
        font-weight: 700;
        white-space: nowrap;
      }

      @keyframes user-loc-pulse {
        0% { transform: scale(0.92); opacity: 0.95; }
        70% { transform: scale(1.6); opacity: 0; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <!-- Fixed center pin overlay -->
    <div class="center-pin-pulse"></div>
    <div class="center-pin-wrapper">
      <div class="center-pin-body">
        <div class="center-pin-head">
          <div class="center-pin-inner"></div>
        </div>
      </div>
      <div class="center-pin-shadow"></div>
    </div>
    <div class="center-pin-label">
      <span class="center-pin-label-text">GHIM VỊ TRÍ</span>
    </div>

    <script
      src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      crossorigin=""
    ></script>
    <script>
      (function () {
        var postToRN = function (payload) {
          if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        };

        var map = L.map('map', {
          zoomControl: false,
          preferCanvas: true,
        }).setView([${lat}, ${lng}], 16);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
          subdomains: 'abcd',
        }).addTo(map);

        var userLayer = L.layerGroup().addTo(map);

        // When map stops moving, send center coordinates to RN
        var debounceTimer = null;
        map.on('moveend', function () {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(function () {
            var center = map.getCenter();
            postToRN({
              type: 'center_changed',
              latitude: Number(center.lat.toFixed(6)),
              longitude: Number(center.lng.toFixed(6)),
            });
          }, 300);
        });

        window.__setCenter = function (lat, lng) {
          map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true });
        };

        window.__updateUserLocation = function (latitude, longitude) {
          if (typeof latitude !== 'number' || typeof longitude !== 'number') return;

          userLayer.clearLayers();

          var icon = L.divIcon({
            className: 'user-location-wrapper',
            html: '<div class="user-location-pulse"></div><div class="user-location-dot"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            tooltipAnchor: [0, -18],
          });

          var marker = L.marker([latitude, longitude], {
            icon: icon,
            interactive: false,
            keyboard: false,
          }).addTo(userLayer);

          marker.bindTooltip('<div class="user-location-text">Vị trí của bạn</div>', {
            permanent: true,
            direction: 'top',
            offset: [0, -12],
            opacity: 1,
            className: 'user-location-tooltip',
          });
          marker.openTooltip();
        };

        postToRN({ type: 'map_ready' });
      })();
    </script>
  </body>
</html>
`;

// ─── Component ───────────────────────────────────────────────────────────────

export const LocationStep: React.FC<LocationStepProps> = ({
  location,
  manualAddress,
  onChangeManualAddress,
  useCurrentLocation,
  onToggleUseCurrentLocation,
  isResolvingCurrentLocation = false,
  onLocationChange,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const leafletHtml = useMemo(
    () => buildLeafletHtml(location.lat, location.lng),
    // Only compute once on initial mount – we pan the map via injected JS afterwards
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // When useCurrentLocation toggles on and resolves, pan map to the new location
  useEffect(() => {
    if (!isMapReady) return;

    webViewRef.current?.injectJavaScript(`
      if (window.__setCenter) {
        window.__setCenter(${location.lat}, ${location.lng});
      }
      true;
    `);
  }, [isMapReady, location.lat, location.lng]);

  const handleWebMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          latitude?: number;
          longitude?: number;
        };

        if (payload?.type === 'map_ready') {
          setIsMapReady(true);
          return;
        }

        if (
          payload?.type === 'center_changed' &&
          typeof payload.latitude === 'number' &&
          typeof payload.longitude === 'number'
        ) {
          onLocationChange?.(payload.latitude, payload.longitude);
        }
      } catch {
        // ignore non-json messages
      }
    },
    [onLocationChange]
  );

  return (
    <View>
      <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 22, fontWeight: '800' }}>
        Bạn mất ở đâu?
      </Text>
      <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 14, marginTop: 8 }}>
        Kéo bản đồ để ghim vị trí chính xác vật dụng bị thất lạc.
      </Text>

      {/* ── Interactive Leaflet map ── */}
      <View
        style={{
          marginTop: 24,
          borderRadius: REPORT_LAYOUT.cardRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: REPORT_COLORS.border,
          backgroundColor: '#0a0a0f',
          height: 320,
        }}
      >
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
          scrollEnabled={false}
        />
      </View>

      {/* ── Location info card ── */}
      <View
        style={{
          marginTop: 16,
          borderRadius: 20,
          backgroundColor: REPORT_COLORS.surfaceSoft,
          padding: 18,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: REPORT_COLORS.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MapPin size={18} color={REPORT_COLORS.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: REPORT_COLORS.textMuted,
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              fontWeight: '700',
            }}
          >
            {location.subtitle}
          </Text>
          <Text
            style={{
              color: REPORT_COLORS.textPrimary,
              fontSize: 16,
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            {location.title}
          </Text>
          <Text style={{ color: REPORT_COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>
            {location.cityLine}
          </Text>
        </View>
      </View>

      {/* ── Manual address input ── */}
      <View
        style={{
          marginTop: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: REPORT_COLORS.border,
          backgroundColor: 'rgba(36,36,54,0.55)',
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: REPORT_COLORS.textMuted, fontSize: 12, fontWeight: '700' }}>
          VỊ TRÍ ĐÁNH RƠI (FALLBACK)
        </Text>
        <TextInput
          value={manualAddress}
          onChangeText={onChangeManualAddress}
          placeholder="Nhập địa chỉ nếu không lấy được tự động"
          placeholderTextColor={REPORT_COLORS.textMuted}
          multiline
          style={{
            marginTop: 8,
            color: REPORT_COLORS.textPrimary,
            fontSize: 14,
            minHeight: 52,
            textAlignVertical: 'top',
          }}
        />
      </View>

      {/* ── Use current location toggle ── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggleUseCurrentLocation}
        style={{
          marginTop: 16,
          height: 56,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: useCurrentLocation ? REPORT_COLORS.accent : REPORT_COLORS.border,
          backgroundColor: useCurrentLocation ? REPORT_COLORS.accentSoft : 'rgba(36,36,54,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        }}
      >
        <Crosshair size={18} color={REPORT_COLORS.textPrimary} />
        <Text style={{ color: REPORT_COLORS.textPrimary, fontSize: 14, fontWeight: '600' }}>
          {isResolvingCurrentLocation ? 'Đang lấy vị trí...' : 'Dùng vị trí hiện tại'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
