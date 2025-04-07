import { useTheme } from '@/hooks/useTheme';
import ChallengesScreen from '@/screens/community/ChallengesScreen';
import { StyleSheet, View } from 'react-native';

export default function CommunityScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ChallengesScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 