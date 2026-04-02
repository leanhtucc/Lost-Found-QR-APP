import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

export default function Background({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={[
        'rgba(235,200,148,1)',
        'rgba(235,200,148,0)',
        'rgba(244,158,159,0)',
        'rgba(244,158,159,1)',
      ]}
      locations={[0, 0.5, 0.5, 1]}
      start={{ x: 0, y: 0 }} // top-left
      end={{ x: 1, y: 1 }} // bottom-right
      style={styles.bg}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
