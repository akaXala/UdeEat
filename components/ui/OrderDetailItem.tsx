import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Image, StyleSheet, View, useColorScheme } from 'react-native';

type Props = {
  image?: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  ingredients?: string[];
  extras?: string[];
};

function formatCop(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
}

export default function OrderDetailItem({ image, name, category, quantity, unitPrice, ingredients, extras }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const total = unitPrice * quantity;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }] }>
      {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={styles.imagePlaceholder} />}

      <View style={styles.body}>
        <ThemedText type="subtitle" style={[styles.name, { color: colors.text }]}>{name}</ThemedText>
        {category ? <ThemedText style={[styles.small, { color: colors.textSecondary }]}>{category}</ThemedText> : null}

        <ThemedText style={[styles.small, { color: colors.textSecondary }]}>Cantidad: {quantity}</ThemedText>
        <ThemedText style={[styles.small, { color: colors.textSecondary }]}>Precio unitario: {formatCop(unitPrice)}</ThemedText>

        {ingredients?.length ? (
          <ThemedText style={[styles.small, { color: colors.textSecondary }]}>Ingredientes: {ingredients.join(', ')}</ThemedText>
        ) : null}

        {extras?.length ? (
          <ThemedText style={[styles.small, { color: colors.textSecondary }]}>Extras: {extras.join(', ')}</ThemedText>
        ) : null}
      </View>

      <View style={styles.amountWrap}>
        <ThemedText style={[styles.total, { color: colors.primary }]}>{formatCop(total)}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: 8,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  amountWrap: {
    marginLeft: 8,
    alignItems: 'flex-end',
  },
  name: {
    marginBottom: 2,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
  },
});
