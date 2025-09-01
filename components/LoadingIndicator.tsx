import { ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const LoadingIndicator = () => (
  <Animated.View
    entering={FadeIn}
    exiting={FadeOut}
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <ActivityIndicator size="large" color="#007AFF" />
  </Animated.View>
);