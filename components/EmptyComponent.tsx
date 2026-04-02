import { useEffect } from 'react';

export default function EmptyComponent({ navigation }: { navigation: any }) {
  useEffect(() => {
    navigation.navigate('Pronunciation', {
      screen: 'PronunciationStart',
    });
  }, [navigation]);

  return null;
}
