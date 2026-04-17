import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import {
    type FoodDetail,
    type IngredientGroup,
    type IngredientOption,
    type SizeOption,
    getFoodDetail,
} from '@/services/menu-catalog';

function formatCop(value: number) {
  return `$${value.toLocaleString('es-CO')} COP`;
}

export default function FoodCustomizationScreen() {
  const { id, foodId } = useLocalSearchParams<{ id: string; foodId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [food, setFood] = useState<FoodDetail | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [selectedOptional, setSelectedOptional] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      if (!id || !foodId) {
        return;
      }

      const detail = await getFoodDetail(id, foodId);
      if (!isMounted || !detail) {
        return;
      }

      setFood(detail);
      setSelectedSizeId(detail.sizeOptions[1]?.id ?? detail.sizeOptions[0]?.id ?? '');

      const initialOptional: Record<string, string[]> = {};
      detail.ingredientGroups
        .filter((group) => !group.required)
        .forEach((group) => {
          initialOptional[group.id] = [];
        });
      setSelectedOptional(initialOptional);
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [foodId, id]);

  const selectedSize = useMemo(() => {
    if (!food) {
      return null;
    }
    return food.sizeOptions.find((size) => size.id === selectedSizeId) ?? food.sizeOptions[0] ?? null;
  }, [food, selectedSizeId]);

  const extrasTotal = useMemo(() => {
    if (!food) {
      return 0;
    }

    return food.ingredientGroups
      .filter((group) => !group.required)
      .flatMap((group) => {
        const selectedIds = selectedOptional[group.id] ?? [];
        return group.options.filter((option) => selectedIds.includes(option.id));
      })
      .reduce((sum, option) => sum + option.extraCop, 0);
  }, [food, selectedOptional]);

  const total = useMemo(() => {
    if (!food || !selectedSize) {
      return 0;
    }
    return Math.round(food.precioCop * selectedSize.multiplier) + extrasTotal;
  }, [extrasTotal, food, selectedSize]);

  if (!food) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}> 
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}> 
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroBlock}>
          <View style={[styles.foodImageWrap, { backgroundColor: colors.primaryDark }]}> 
            <Image source={{ uri: food.imagen }} style={styles.foodImage} />
          </View>
          <Text style={[styles.foodTitle, { color: colors.text }]}>{food.nombre}</Text>
          <Text style={[styles.foodMeta, { color: colors.textSecondary }]}>
            {formatCop(food.precioCop)} • {food.calorias} KCAL
          </Text>
          <Text style={[styles.foodDesc, { color: colors.textSecondary }]}>{food.descripcion}</Text>
        </View>

        <SectionTitle title="Opciones de tamano" color={colors.text} />
        <View style={styles.sizeRow}>
          {food.sizeOptions.map((size) => (
            <SizeChip
              key={size.id}
              size={size}
              selected={selectedSizeId === size.id}
              onPress={() => setSelectedSizeId(size.id)}
              colors={{
                text: colors.text,
                border: colors.border,
                active: colors.primary,
                card: colors.card,
              }}
            />
          ))}
        </View>

        {food.ingredientGroups.map((group) => (
          <IngredientSection
            key={group.id}
            group={group}
            selectedOptionalIds={selectedOptional[group.id] ?? []}
            onToggle={(optionId) => {
              if (group.required) {
                return;
              }

              setSelectedOptional((prev) => {
                const current = prev[group.id] ?? [];
                const exists = current.includes(optionId);

                if (exists) {
                  return { ...prev, [group.id]: current.filter((idItem) => idItem !== optionId) };
                }

                if (current.length >= group.maxSelect) {
                  return prev;
                }

                return { ...prev, [group.id]: [...current, optionId] };
              });
            }}
            colors={{
              text: colors.text,
              textSecondary: colors.textSecondary,
              border: colors.border,
              primary: colors.primary,
              card: colors.card,
            }}
          />
        ))}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}> 
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} activeOpacity={0.88}>
          <Ionicons name="cart-outline" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Anadir producto • {formatCop(total)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type Palette = {
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  card: string;
};

type IngredientSectionProps = {
  group: IngredientGroup;
  selectedOptionalIds: string[];
  onToggle: (optionId: string) => void;
  colors: Palette;
};

function IngredientSection({ group, selectedOptionalIds, onToggle, colors }: IngredientSectionProps) {
  return (
    <View style={[styles.section, { borderTopColor: colors.border }]}> 
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{group.title}</Text>
      <View style={styles.optionList}>
        {group.options.map((option) => {
          const checked = group.required || selectedOptionalIds.includes(option.id);
          return (
            <IngredientOptionRow
              key={option.id}
              option={option}
              checked={checked}
              required={group.required}
              onPress={() => onToggle(option.id)}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}

type IngredientOptionRowProps = {
  option: IngredientOption;
  checked: boolean;
  required: boolean;
  onPress: () => void;
  colors: Palette;
};

function IngredientOptionRow({ option, checked, required, onPress, colors }: IngredientOptionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={required}
      style={[styles.optionRow, { borderColor: colors.border, backgroundColor: colors.card }]}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? colors.primary : colors.textSecondary,
            backgroundColor: checked ? colors.primary : 'transparent',
          },
        ]}
      >
        {checked ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
      </View>

      <Text style={[styles.optionLabel, { color: checked ? colors.text : colors.textSecondary }]}>{option.label}</Text>

      {option.extraCop > 0 ? (
        <Text style={[styles.optionExtra, { color: colors.textSecondary }]}>+ {formatCop(option.extraCop)}</Text>
      ) : null}
    </Pressable>
  );
}

type SizeChipProps = {
  size: SizeOption;
  selected: boolean;
  onPress: () => void;
  colors: {
    text: string;
    border: string;
    active: string;
    card: string;
  };
};

function SizeChip({ size, selected, onPress, colors }: SizeChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.sizeChip,
        {
          borderColor: selected ? colors.active : colors.border,
          backgroundColor: selected ? colors.active : colors.card,
        },
      ]}
    >
      <Text style={[styles.sizeChipTitle, { color: selected ? '#fff' : colors.text }]}>{size.label}</Text>
      <Text style={[styles.sizeChipSub, { color: selected ? '#fff' : colors.text }]}>
        x{size.multiplier.toFixed(2)}
      </Text>
    </Pressable>
  );
}

function SectionTitle({ title, color }: { title: string; color: string }) {
  return <Text style={[styles.sectionBigTitle, { color }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingTop: 44,
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  iconButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  heroBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  foodImageWrap: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  foodTitle: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    textAlign: 'center',
  },
  foodMeta: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '700',
  },
  foodDesc: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 26,
  },
  sectionBigTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  sizeChip: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sizeChipTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sizeChipSub: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 12,
  },
  optionList: {
    gap: 10,
  },
  optionRow: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 17,
    marginLeft: 12,
    flex: 1,
  },
  optionExtra: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  addButton: {
    height: 54,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
});
