import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type RestaurantCardProps = {
  nombre?: string;
  categoria?: string;
  rating?: number;
  tiempo?: string;
  imagen?: string;
};

const RestaurantCard = ({
  nombre = 'La Parrilla de ESCOM',
  categoria = 'Comida Mexicana',
  rating = 4.8,
  tiempo = '15-25 min',
  imagen = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
}: RestaurantCardProps) => {
    const theme = useTheme();

    return (
        <Pressable
            style={[
                styles.card,
                {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderWidth: 0.5
                }
            ]}
        >
            <View style={styles.imageContainer}>
              <Image source={{ uri: imagen }} style={styles.image} />
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={theme.star} />
                <Text style={styles.ratingText}>{rating}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                {nombre}
                </Text>

                <View style={styles.infoRow}>
                    <Text style={[styles.subtext, { color: theme.textSecondary }]}>
                  {categoria}
                    </Text>
                    <Text style={[styles.dot, { color: theme.textSecondary }]}>•</Text>
                    <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.subtext, { color: theme.textSecondary }]}>
                  {tiempo}
                    </Text>
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 20,
    margin: 10,
    overflow: 'hidden',
    // Sombra para dar profundidad
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtext: {
    fontSize: 14,
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 8,
    fontSize: 14,
  },
});

export default RestaurantCard;