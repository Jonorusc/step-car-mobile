import React, { useState } from 'react';
import { Slot, useRouter, useSegments, Href } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import WebStyleDrawer from '@/components/WebStyleDrawer';
import Devices from '@/components/Devices';
import useBLE from '@/hooks/useBLE';

export default function DashboardLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [devicesVisible, setDevicesVisible] = useState(false);

  const {
    connectToDevice,
    ConnectedDevice,
    print,
    disconnect,
    devices,
    requestPermissions,
  } = useBLE();

  React.useEffect(() => {
    requestPermissions();
  }, []);

  // Derive active route from segment
  // segments: ["(private)", "dashboard", "categories"] -> "categories"
  // segments: ["(private)", "dashboard"] -> "index"
  const activeRoute = segments[2] || 'index';

  const routeTitles: Record<string, string> = {
    index: 'Página Principal',
    dashboard: 'Dashboard',
    employees: 'Funcionários',
    categories: 'Categorias',
    services: 'Serviços',
    companies: 'Empresas',
    vehicles: 'Veículos',
    financeiro: 'Financeiro',
    settings: 'Configurações',
  };

  const handleOpenDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrawerOpen(true);
  };

  const handleNavigate = (route: string) => {
    if (route === 'index') {
      router.push('/(private)/dashboard');
    } else {
      router.push(`/(private)/dashboard/${route}` as Href);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Panel */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleOpenDrawer}
            style={styles.menuBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="menu" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{routeTitles[activeRoute] || 'StepCar'}</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.printerHeaderBtn, ConnectedDevice ? styles.printerHeaderBtnConnected : null]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDevicesVisible(true);
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="print"
              size={20}
              color={ConnectedDevice ? '#10b981' : '#64748b'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Primary Module slot */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Drawer Overlay Menu */}
      <WebStyleDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
      />

      {/* Printer Scan/Connection Modal */}
      <Devices
        visible={devicesVisible}
        closeModal={() => setDevicesVisible(false)}
        connectToDevice={connectToDevice}
        connectedDevice={ConnectedDevice}
        print={print}
        disconnect={disconnect}
        devices={devices}
        cupomData={null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Web-style pure white background
  },
  header: {
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    ...Platform.select({
      android: {
        marginTop: 30, // Account for Android status bar space if needed
      },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuBtn: {
    padding: 6,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxWidth: '45%',
  },
  estColorIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  estName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc', // Dash panel background: very light slate
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  printerHeaderBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  printerHeaderBtnConnected: {
    backgroundColor: '#e8f5e9',
  },
});
