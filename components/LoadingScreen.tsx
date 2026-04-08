import { CustomText as Text } from '@/components/ui/CustomText';
import colors from '@/constants/colors';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { IconLogoLoadingApp } from './icons';

interface LoadingScreenProps {
  textDisplay: string;
}

export default function LoadingScreen({ textDisplay }: LoadingScreenProps) {
  return (
    <View style={styles.loadingContainer}>
      <IconLogoLoadingApp width={100} height={100} style={{ marginBottom: 16 }} />
      <ActivityIndicator size="large" color={colors.orange} />
      <Text style={styles.loadingText}>{textDisplay}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray500,
  },
});
