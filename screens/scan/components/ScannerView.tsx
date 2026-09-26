/**
 * Scanner View Component
 * Camera view với QR code scanner, exposes layout for coordinate mapping.
 */

import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, useCodeScanner } from 'react-native-vision-camera';
import type { Code, CodeScannerFrame } from 'react-native-vision-camera';
import { FIND_BACK } from '@constants/theme';
import type { PreviewLayout } from '../utils/mapCodeBoundsToPreview';

interface ScannerViewProps {
  device: any;
  isActive: boolean;
  onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => void;
  onLayoutChange: (layout: PreviewLayout) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  device,
  isActive,
  onCodeScanned,
  onLayoutChange,
}) => {
  // Code scanner configuration
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => {
      if (codes && codes.length > 0) {
        onCodeScanned(codes, frame);
      }
    },
  });

  // Capture camera preview layout for coordinate mapping
  const handleLayout = useCallback(
    (event: {
      nativeEvent: { layout: { x: number; y: number; width: number; height: number } };
    }) => {
      const { x, y, width, height } = event.nativeEvent.layout;
      onLayoutChange({ x, y, width, height });
    },
    [onLayoutChange]
  );

  if (!device) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
        enableZoomGesture
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FIND_BACK.neutral,
  },
});
