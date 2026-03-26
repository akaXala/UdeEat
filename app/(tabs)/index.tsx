import { useAuth } from '@clerk/expo';
import React from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';

// Componentes
import { ThemedText } from '@/components/themed-text';
import Header from '@/components/ui/Header'; // <-- Importamos tu nuevo componente
import RestaurantCard from '@/components/ui/RestaurantCard';

// Colores
import { Colors } from '@/constants/Colors';
import { useTabSlideAnimation } from '@/hooks/use-tab-slide-animation';

export default function HomeScreen() {
  const { signOut } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const slideStyle = useTabSlideAnimation();

  const onSignOutPress = async () => {
    await signOut();
  };

  return (
    <Animated.View style={[styles.mainContainer, { backgroundColor: colors.background }, slideStyle]}>
      
      {/* Usamos el componente Header */}
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Pressable style={styles.signOutButton} onPress={onSignOutPress}>
          <ThemedText style={styles.signOutButtonText}>Cerrar sesión</ThemedText>
        </Pressable>

        <View style={styles.cardsContainer}>
          <RestaurantCard />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#d9534f',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cardsContainer: {
    alignItems: 'center',
  },
});