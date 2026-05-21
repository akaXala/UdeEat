import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

type FoodCardProps = {
  nombre: string;
  precioCop: number;
  calorias: number;
  rating: number;
  imagen: string;
  onPress?: () => void;
};

function formatCop(value: number) {
  return `$${value.toLocaleString('es-CO')} COP`;
}

export default function FoodCard({ nombre, precioCop, calorias, rating, imagen, onPress }: FoodCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <Image source={{ uri: imagen }} style={styles.image} />

      <View style={[styles.ratingBadge, { backgroundColor: 'rgba(0,0,0,0.72)' }]}>
        <Ionicons name="star" size={12} color={colors.star} />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {nombre}
        </Text>

        <View style={styles.row}>
          <Text style={[styles.price, { color: colors.primary }]}>{formatCop(precioCop)}</Text>
          <Text style={[styles.dot, { color: colors.textSecondary }]}>•</Text>
          <Ionicons name="flame-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{calorias} kcal</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 4,
    fontSize: 12,
  },
  content: {
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
  dot: {
    marginHorizontal: 8,
  },
  meta: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});
