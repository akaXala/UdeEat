import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

type Props = {
  id: string;
  number: number;
  status: string;
  subtitle?: string;
  date?: string;
  onPress?: () => void;
};

export default function OrderListCard({ number, status, subtitle, date, onPress }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const iconName =
    status === 'delivered' ? 'checkmark-done' : status === 'preparing' ? 'restaurant' : status === 'ready' ? 'checkmark-circle' : status === 'draft' ? 'create' : 'time';

  const statusLabel: Record<string, string> = {
    draft: 'Borrador',
    placed: 'Recibida',
    waiting: 'En espera',
    preparing: 'Preparando',
    ready: 'Listo para recoger',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  return (
    <Pressable style={[styles.row, { backgroundColor: colors.card }]} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}> 
        <Ionicons name={iconName as any} size={20} color="white" />
      </View>

      <View style={styles.meta}>
        <ThemedText type="subtitle" style={{ color: colors.text }}>Orden #{number}</ThemedText>
        <ThemedText style={[styles.small, { color: colors.textSecondary }]}>{subtitle ?? statusLabel[status] ?? status}</ThemedText>
      </View>

      <View style={styles.dateWrap}>
        <ThemedText style={[styles.small, { color: colors.textSecondary }]}>{date}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  meta: {
    flex: 1,
  },
  dateWrap: {
    marginLeft: 8,
  },
  small: {
    fontSize: 14,
    color: '#666',
  },
});
