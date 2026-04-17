import React from 'react';
import { Animated, ScrollView, StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Header from '@/components/ui/Header';
import { Colors } from '@/constants/Colors';
import { useTabSlideAnimation } from '@/hooks/use-tab-slide-animation';

export default function OrdenesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const slideStyle = useTabSlideAnimation();

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <Animated.View style={[styles.animatedContent, slideStyle]}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">Mis pedidos</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Aqui veras el historial y estado de tus ordenes.
          </ThemedText>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContent: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    gap: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
});
