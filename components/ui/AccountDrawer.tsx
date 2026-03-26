import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/Colors';
import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';

type AccountDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

const DRAWER_WIDTH = 320;

export default function AccountDrawer({ visible, onClose }: AccountDrawerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { signOut } = useAuth();
  const { user } = useUser();

  const [rendered, setRendered] = useState(visible);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;

  const fullName = useMemo(() => {
    const first = user?.firstName ?? '';
    const last = user?.lastName ?? '';
    const name = `${first} ${last}`.trim();
    if (name.length > 0) {
      return name;
    }
    return user?.username ?? 'Cuenta';
  }, [user?.firstName, user?.lastName, user?.username]);

  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? '';

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setRendered(false);
      }
    });
  }, [overlayOpacity, translateX, visible]);

  if (!rendered) {
    return null;
  }

  return (
    <Modal transparent animationType="none" visible={rendered} onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: colors.card,
              borderLeftColor: colors.border,
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <ThemedText style={styles.headerTitle}>Tu Cuenta</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.userBlock, { borderBottomColor: colors.border }]}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.border }]}>
                <Ionicons name="person" size={24} color={colors.textSecondary} />
              </View>
            )}
            <ThemedText style={styles.name}>{fullName}</ThemedText>
            {primaryEmail.length > 0 ? (
              <ThemedText style={[styles.email, { color: colors.textSecondary }]}>{primaryEmail}</ThemedText>
            ) : null}
          </View>

          <View style={styles.menuList}>
            <MenuItem icon="person-circle-outline" label="Cuenta" color={colors.text} />
            <MenuItem icon="bag-handle-outline" label="Mis pedidos" color={colors.text} />
            <MenuItem icon="headset-outline" label="Soporte" color={colors.text} />
          </View>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={async () => {
                await signOut();
              }}
            >
              <Ionicons name="log-out-outline" size={18} color="#fff" />
              <ThemedText style={styles.signOutText}>CERRAR SESION</ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
};

function MenuItem({ icon, label, color }: MenuItemProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.menuItem}>
      <Ionicons name={icon} size={22} color={color} />
      <ThemedText style={styles.menuLabel}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    maxWidth: '88%',
    height: '100%',
    borderLeftWidth: 1,
  },
  header: {
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  userBlock: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 6,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  email: {
    fontSize: 14,
  },
  menuList: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    padding: 16,
  },
  signOutButton: {
    backgroundColor: '#D9363E',
    borderRadius: 8,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
