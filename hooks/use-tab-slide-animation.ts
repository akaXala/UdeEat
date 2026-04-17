import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';

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

  useFocusEffect(
    useCallback(() => {
      const direction = consumePendingDirection();
      const startX = direction === 'from-right' ? 14 : direction === 'from-left' ? -14 : 0;

      translateX.setValue(startX);

      if (startX === 0) {
        return;
      }

      Animated.timing(translateX, {
        toValue: 0,
        duration: 440,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start();
    }, [translateX]),
  );

  return {
    transform: [{ translateX }],
  };
}
