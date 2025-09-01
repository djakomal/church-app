import { ReactNode } from 'react';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft 
} from 'react-native-reanimated';

interface ScreenTransitionProps {
  children: ReactNode;
}

export const ScreenTransition = ({ children }: ScreenTransitionProps) => (
  <Animated.View
    entering={SlideInRight.springify().damping(15)}
    exiting={SlideOutLeft.springify().damping(15)}
    style={{ flex: 1 }}
  >
    {children}
  </Animated.View>
);