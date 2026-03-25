import { ThemedText } from '@/components/themed-text';
import RestaurantCard from '@/components/ui/RestaurantCard';
import { useAuth } from '@clerk/expo';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { signOut } = useAuth();

  const onSignOutPress = async () => {
    await signOut();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.signOutButton} onPress={onSignOutPress}>
        <ThemedText style={styles.signOutButtonText}>Cerrar sesion</ThemedText>
      </Pressable>

      <View style={styles.cardsContainer}>
        <RestaurantCard />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#d9534f',
    borderRadius: 8,
    marginBottom: 16,
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
