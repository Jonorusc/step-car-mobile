import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import useUser from '@/hooks/useUser';
import { useSession } from '@/hooks/useSession';
import { useAuthStore } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78; // 78% of screen width

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export default function WebStyleDrawer({ isOpen, onClose, activeRoute, onNavigate }: DrawerProps) {
  const router = useRouter();
  const user = useUser();
  const { activeEstablishment, setActiveEstablishment } = useSession();
  const { logout } = useAuthStore();
  
  // Animated value ranging from 0 (closed) to 1 (open)
  const animation = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Sync animation and layout lifecycle
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [isOpen]);

  const handleNavigation = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigate(route);
    onClose();
  };

  const handleEstablishmentsRedirect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    await setActiveEstablishment(null);
    router.replace('/(private)/establishments');
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    await logout();
    router.replace('/login');
  };

  const menuItems = [
    { label: 'Registro', route: 'index', icon: 'edit' },
    { label: 'Financeiro', route: 'financeiro', icon: 'assessment' },
    { label: 'Categorias', route: 'categories', icon: 'view-module' },
    { label: 'Serviços', route: 'services', icon: 'build' },
    { label: 'Empresas', route: 'companies', icon: 'business' },
    { label: 'Veículos', route: 'vehicles', icon: 'directions-car' },
  ];

  if (!shouldRender) return null;

  // System primary color from centralized theme constants
  const themeColor = Theme.colors.primary;

  // Compute initials for the custom avatar badge
  const userName = user?.name || 'Operador';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'OP';

  // Interpolated translation X and backdrop opacity
  const slideX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.overlay}>
      {/* Background click listener with smooth fade */}
      <Pressable style={styles.backdropPressable} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>

      {/* Floating sliding drawer card */}
      <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideX }] }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topSection}>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <View style={[styles.avatar, { backgroundColor: `${themeColor}15` }]}>
                  <Text style={[styles.avatarText, { color: themeColor }]}>
                    {userInitials}
                  </Text>
                </View>
                <View style={styles.profileTextContainer}>
                  <Text style={styles.profileGreeting}>Olá,</Text>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {userName}
                  </Text>
                </View>
              </View>

              {activeEstablishment && (
                <View style={[
                  styles.establishmentBadge, 
                  { backgroundColor: Theme.colors.borderLight, borderColor: Theme.colors.border }
                ]}>
                  <MaterialIcons name="storefront" size={14} color={Theme.colors.textSecondary} style={styles.badgeIcon} />
                  <Text style={[styles.establishmentName, { color: Theme.colors.textSecondary }]} numberOfLines={1}>
                    {activeEstablishment.name_by_company}
                  </Text>
                </View>
              )}
            </View>

            {/* Section label */}
            <Text style={styles.sectionHeader}>Módulos</Text>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
              {menuItems.map((item) => {
                const isActive = activeRoute === item.route;
                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[
                      styles.menuItem,
                      isActive ? { backgroundColor: themeColor } : null
                    ]}
                    onPress={() => handleNavigation(item.route)}
                    activeOpacity={isActive ? 1 : 0.6}
                  >
                    <MaterialIcons
                      name={item.icon as any}
                      size={20}
                      color={isActive ? '#ffffff' : '#64748b'}
                      style={styles.menuIcon}
                    />
                    <Text style={[
                      styles.menuLabel,
                      isActive ? styles.menuLabelActive : null
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={styles.footerItem}
              onPress={handleEstablishmentsRedirect}
              activeOpacity={0.7}
            >
              <MaterialIcons name="swap-horiz" size={20} color="#475569" style={styles.menuIcon} />
              <Text style={styles.footerLabel}>Trocar Estabelecimento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <MaterialIcons name="logout" size={20} color="#ef4444" style={styles.menuIcon} />
              <Text style={[styles.footerLabel, { color: '#ef4444' }]}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    flexDirection: 'row',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#ffffff',
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#0f172a',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileTextContainer: {
    flex: 1,
  },
  profileGreeting: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  establishmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeIcon: {
    marginRight: 6,
  },
  establishmentName: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 28,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  menuLabelActive: {
    color: '#ffffff',
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  logoutItem: {
    backgroundColor: '#fef2f2',
    marginTop: 6,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
