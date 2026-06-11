import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getRestaurants, getMenuByRestaurant } from '@/services/menu-catalog';

type FloatingSearchBarProps = {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
};

function formatCop(value: number) {
  return `$${value.toLocaleString('es-CO')} COP`;
}

type SearchResultCardProps = {
  dish: any;
  onPress: () => void;
  colors: any;
};

function SearchResultCard({ dish, onPress, colors }: SearchResultCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.resultCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Image source={{ uri: dish.imagen }} style={styles.resultImage} />
      
      <View style={styles.resultContent}>
        <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={1}>
          {dish.nombre}
        </Text>
        
        <Text style={[styles.resultRestaurant, { color: colors.primary }]} numberOfLines={1}>
          📍 {dish.restaurantName}
        </Text>
        
        <View style={styles.resultMetaRow}>
          <Text style={[styles.resultPrice, { color: colors.text }]}>
            {formatCop(dish.precioCop)}
          </Text>
          <Text style={[styles.resultDot, { color: colors.textSecondary }]}>•</Text>
          <Ionicons name="flame-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.resultCalories, { color: colors.textSecondary }]}>
            {dish.calorias} kcal
          </Text>
        </View>
      </View>
      
      <View style={[styles.arrowButton, { backgroundColor: colors.border }]}>
        <Ionicons name="chevron-forward" size={14} color={colors.text} />
      </View>
    </Pressable>
  );
}

export default function FloatingSearchBar({
  visible,
  value,
  onChangeText,
  onClose,
}: FloatingSearchBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const inputRef = useRef<TextInput>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = React.useState(visible);

  const router = useRouter();
  const [allDishes, setAllDishes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const screenHeight = Dimensions.get('window').height;
  const fromY = Math.max(120, screenHeight - 150);
  const blurTint = colorScheme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    if (visible) {
      let isMounted = true;
      async function loadAllDishes() {
        setLoading(true);
        try {
          const rests = await getRestaurants();
          const menusPromises = rests.map(async (r) => {
            const menu = await getMenuByRestaurant(r.id);
            return menu.map((dish) => ({
              ...dish,
              restaurantId: r.id,
              restaurantName: r.nombre,
            }));
          });
          const menus = await Promise.all(menusPromises);
          if (isMounted) {
            setAllDishes(menus.flat());
          }
        } catch (error) {
          console.error('Error loading search data:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
      loadAllDishes();
      return () => {
        isMounted = false;
      };
    }
  }, [visible]);

  const filteredDishes = React.useMemo(() => {
    if (value.trim() === '') return [];
    const lowerQuery = value.toLowerCase();
    return allDishes.filter((dish) =>
      dish.nombre.toLowerCase().includes(lowerQuery)
    );
  }, [allDishes, value]);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(timer);
    }

    Keyboard.dismiss();
    Animated.timing(progress, {
      toValue: 0,
      duration: 230,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setRendered(false);
      }
    });
  }, [progress, visible]);

  if (!rendered) {
    return null;
  }

  return (
    <Modal transparent visible={rendered} animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: progress,
            },
          ]}
        >
          <BlurView
            intensity={95}
            tint={blurTint}
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: colors.background,
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.45],
                }),
              },
            ]}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [fromY, 0],
                  }),
                },
                {
                  scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>Buscar</Text>
            <TouchableOpacity style={styles.iconButton} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.container, { borderColor: colors.primary, marginBottom: 14 }]}> 
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              placeholder="Buscar en UdeEat..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text }]}
              returnKeyType="search"
            />
            {value.length > 0 ? (
              <TouchableOpacity onPress={() => onChangeText('')} activeOpacity={0.8}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.resultsArea}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.textSecondary, marginTop: 10 }]}>
                  Cargando productos...
                </Text>
              </View>
            ) : value.trim() === '' ? (
              <View style={styles.centerContainer}>
                <Ionicons name="search-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary, marginTop: 8 }]}>
                  Escribe el nombre de un platillo para comenzar la búsqueda.
                </Text>
              </View>
            ) : filteredDishes.length === 0 ? (
              <View style={styles.centerContainer}>
                <Ionicons name="sad-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.infoText, { color: colors.textSecondary, marginTop: 8 }]}>
                  No encontramos platillos para "{value}".
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredDishes}
                keyExtractor={(item) => `${item.restaurantId}-${item.id}`}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <SearchResultCard
                    dish={item}
                    colors={colors}
                    onPress={() => {
                      onClose();
                      router.push(`/restaurant/${item.restaurantId}/food/${item.id}`);
                    }}
                  />
                )}
                style={styles.resultsList}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    marginTop: 44,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 33,
    fontWeight: '600',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  resultsArea: {
    marginTop: 12,
    minHeight: 120,
    maxHeight: 400,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultsList: {
    flexGrow: 0,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  resultContent: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '700',
  },
  resultRestaurant: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultDot: {
    marginHorizontal: 6,
    fontSize: 12,
  },
  resultCalories: {
    fontSize: 12,
    marginLeft: 3,
  },
  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
