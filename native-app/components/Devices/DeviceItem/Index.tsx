import { useBLEStore } from '@/hooks/useBLE';
import { FC, useCallback, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, ListRenderItemInfo, Text, TouchableOpacity } from 'react-native';
import { Device } from 'react-native-ble-plx';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

type DeviceItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToDevice: (device: Device) => Promise<{ success: boolean; cleanup?: () => void }>;
  closeModal: () => void;
  connectedDevice: Device | null;
  disconnect: () => Promise<void>;
};

const DeviceItem: FC<DeviceItemProps> = ({ item, connectToDevice, closeModal, disconnect }) => {
  const [connecting, setConnecting] = useState(false);
  const { connectedDevice } = useBLEStore();

  const isDeviceConnected = useCallback(() => {
    return connectedDevice?.id === item.item.id;
  }, [connectedDevice, item.item.id]);

  const connectAndCloseModal = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setConnecting(true);
      const connected = await connectToDevice(item.item);
      if (!connected.success) {
        const identifier = item.item.name ?? item.item.id;
        Alert.alert('Impressora', 'Não foi possível conectar ao dispositivo ' + identifier);
      }
    } catch {
      Alert.alert('Impressora', 'Não foi possível conectar ao dispositivo #ERRO - 1');
    } finally {
      setConnecting(false);
    }
  }, [connectToDevice, item.item]);

  const handleDisconnect = async (event: any) => {
    event.stopPropagation(); // Stop press event propagation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await disconnect();
  };

  const isConnected = isDeviceConnected();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isConnected ? styles.containerConnected : styles.containerDisconnected,
      ]}
      onPress={isConnected ? undefined : connectAndCloseModal}
      activeOpacity={isConnected ? 1 : 0.7}
      disabled={connecting}
    >
      <View style={styles.leftGroup}>
        <View style={[styles.iconCircle, isConnected ? styles.iconCircleConnected : styles.iconCircleDisconnected]}>
          <MaterialIcons name="print" size={18} color={isConnected ? '#10b981' : '#64748b'} />
        </View>
        <View style={styles.textGroup}>
          {connecting ? (
            <View style={styles.connectingRow}>
              <Text style={styles.connectingText}>Conectando...</Text>
              <ActivityIndicator size="small" color="#0f172a" style={{ marginLeft: 8 }} />
            </View>
          ) : (
            <>
              <Text style={[styles.deviceNameText, isConnected ? styles.deviceNameTextConnected : null]}>
                {item.item.name || 'Impressora Bluetooth'}
              </Text>
              <Text style={styles.deviceIdText}>{item.item.id}</Text>
            </>
          )}
        </View>
      </View>

      {isConnected && (
        <TouchableOpacity style={styles.disconnectBtn} onPress={handleDisconnect} activeOpacity={0.7}>
          <MaterialIcons name="link-off" size={16} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.disconnectBtnText}>Desconectar</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerConnected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  containerDisconnected: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconCircleConnected: {
    backgroundColor: '#dcfce7',
  },
  iconCircleDisconnected: {
    backgroundColor: '#f1f5f9',
  },
  textGroup: {
    flex: 1,
  },
  connectingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectingText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  deviceNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  deviceNameTextConnected: {
    color: '#166534',
  },
  deviceIdText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  disconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  disconnectBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default DeviceItem;
