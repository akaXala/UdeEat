import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Header from '@/components/ui/Header';
import { Colors } from '@/constants/Colors';
import { ThemeMode, useAppPreferences } from '@/services/app-preferences';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const {
    preferences,
    setThemeMode,
    setNotificationsEnabled,
    setSoundEnabled,
    setVibrationEnabled,
    setDataSaverEnabled,
    setAutoImageLoading,
    resetPreferences,
  } = useAppPreferences();

  const themeOptions: Array<{ key: ThemeMode; label: string; description: string }> = [
    { key: 'light', label: 'Claro', description: 'Siempre claro' },
    { key: 'dark', label: 'Oscuro', description: 'Siempre oscuro' },
    { key: 'system', label: 'Sistema', description: 'Usa el modo del dispositivo' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
          <ThemedText style={[styles.backText, { color: colors.primary }]}>Volver</ThemedText>
        </Pressable>

        <ThemedText style={[styles.title, { color: colors.text }]}>Configuración</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>Ajusta cómo se ve y cómo se comporta UdeEat en tu Android.</ThemedText>

        <Section title="Apariencia" colors={colors}>
          {themeOptions.map((option) => {
            const selected = preferences.themeMode === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setThemeMode(option.key)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.themeTextWrap}>
                  <Text style={[styles.themeLabel, { color: selected ? '#fff' : colors.text }]}>{option.label}</Text>
                  <Text style={[styles.themeDescription, { color: selected ? '#fff' : colors.textSecondary }]}>{option.description}</Text>
                </View>
                {selected ? <Ionicons name="checkmark-circle" size={22} color="#fff" /> : null}
              </Pressable>
            );
          })}
        </Section>

        <Section title="Notificaciones" colors={colors}>
          <SettingRow
            icon="notifications-outline"
            title="Notificaciones"
            description="Recibe avisos de cambios en tus pedidos y promociones."
            value={preferences.notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            colors={colors}
          />
          <SettingRow
            icon="volume-high-outline"
            title="Sonido"
            description="Reproduce sonidos en alertas y acciones."
            value={preferences.soundEnabled}
            onValueChange={setSoundEnabled}
            colors={colors}
          />
          <SettingRow
            icon="phone-portrait-outline"
            title="Vibración"
            description="Vibra cuando tu pedido cambie de estado."
            value={preferences.vibrationEnabled}
            onValueChange={setVibrationEnabled}
            colors={colors}
          />
        </Section>

        <Section title="Experiencia" colors={colors}>
          <SettingRow
            icon="speedometer-outline"
            title="Ahorro de datos"
            description="Reduce carga visual y optimiza el consumo de datos."
            value={preferences.dataSaverEnabled}
            onValueChange={setDataSaverEnabled}
            colors={colors}
          />
          <SettingRow
            icon="image-outline"
            title="Cargar imágenes automáticamente"
            description="Permite mostrar imágenes de productos de forma inmediata."
            value={preferences.autoImageLoading}
            onValueChange={setAutoImageLoading}
            colors={colors}
          />
        </Section>

        <Pressable style={[styles.resetButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={resetPreferences}>
          <Text style={[styles.resetButtonText, { color: colors.error }]}>Restablecer ajustes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Section({ title, colors, children }: React.PropsWithChildren<{ title: string; colors: { text: string; textSecondary: string; border: string } }>) {
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{title}</ThemedText>
      <View style={[styles.sectionCard, { borderColor: colors.border }]}>{children}</View>
    </View>
  );
}

type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: { text: string; textSecondary: string; border: string; card: string; primary: string };
};

function SettingRow({ icon, title, description, value, onValueChange, colors }: SettingRowProps) {
  return (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingIconWrap}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.settingTextWrap}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  backRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginBottom: 14 },
  backText: { fontSize: 16, fontWeight: '700' },
  title: { fontSize: 30, fontWeight: '800' },
  subtitle: { fontSize: 16, lineHeight: 22, marginTop: 6, marginBottom: 18 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  sectionCard: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  themeOption: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  themeTextWrap: { flex: 1 },
  themeLabel: { fontSize: 17, fontWeight: '800' },
  themeDescription: { fontSize: 13, marginTop: 2 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextWrap: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '700' },
  settingDescription: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  resetButton: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetButtonText: { fontSize: 15, fontWeight: '800' },
});
