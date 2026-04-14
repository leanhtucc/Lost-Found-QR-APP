/**
 * Scanner View Component
 * Camera view với QR code scanner
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, useCodeScanner } from 'react-native-vision-camera';
import { FIND_BACK } from '@constants/theme';

interface ScannerViewProps {
  device: any;
  isActive: boolean;
  onCodeScanned: (codes: any[]) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ device, isActive, onCodeScanned }) => {
  // Code scanner configuration
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes && codes.length > 0) {
        onCodeScanned(codes);
      }
    },
  });

  if (!device) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
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
