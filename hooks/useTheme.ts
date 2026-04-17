import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

export function useTheme() {
  const colorScheme = useColorScheme();
  return Colors[colorScheme ?? 'light'];
}