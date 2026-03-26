import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

type SlideDirection = 'from-left' | 'from-right' | 'none';

let pendingDirection: SlideDirection = 'none';

export function setPendingTabSlideDirection(direction: SlideDirection) {
  pendingDirection = direction;
}

function consumePendingDirection(): SlideDirection {
  const direction = pendingDirection;
  pendingDirection = 'none';
  return direction;
}

export function useTabSlideAnimation() {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      const direction = consumePendingDirection();
      const startX = direction === 'from-right' ? 40 : direction === 'from-left' ? -40 : 0;

      translateX.setValue(startX);
      opacity.setValue(startX === 0 ? 1 : 0.9);

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }, [opacity, translateX]),
  );

  return {
    opacity,
    transform: [{ translateX }],
  };
}
