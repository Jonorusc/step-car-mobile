import useBLE, { useBLEStore } from '@/hooks/useBLE';
import { CUPOM } from '@/types';
import { FC, useCallback, useEffect } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Device } from 'react-native-ble-plx';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceItem from './DeviceItem/Index';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type DeviceProps = {
  cupomData: CUPOM | null;
  visible: boolean;
  closeModal: () => void;
  disconnect: () => Promise<void>;
  devices: Device[];
  connectToDevice: (device: Device) => Promise<{ success: boolean; cleanup?: () => void }>;
  connectedDevice: Device | null;
  print: (data: CUPOM) => void;
};

const Devices: FC<DeviceProps> = ({
  visible,
  closeModal,
  connectToDevice,
  connectedDevice,
  print,
  disconnect,
  cupomData,
}) => {
  const { devices, setDevices } = useBLEStore();
  const { scan, stopScan, bluetoothState } = useBLE();

  const renderDeviceItems = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceItem
          disconnect={disconnect}
          item={item}
          connectToDevice={connectToDevice}
          closeModal={closeModal}
          connectedDevice={connectedDevice}
        />
      );
    },
    [closeModal, connectToDevice, connectedDevice, disconnect],
  );

  const handlePrint = useCallback(() => {
    if (cupomData) {
      print(cupomData);
      closeModal();
    }
  }, [cupomData, print, closeModal]);

  useEffect(() => {
    if (visible && bluetoothState === 'PoweredOn') {
      scan();
    } else {
      stopScan();
      setDevices([]);
    }
  }, [visible, bluetoothState, scan, stopScan, setDevices]);

  useEffect(() => {
    if (bluetoothState === 'PoweredOff') {
      stopScan();
      setDevices([]);
    }
  }, [bluetoothState, stopScan, setDevices]);

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Dispositivos BLE</Text>
              <Text style={styles.sheetSub}>Conecte sua impressora térmica</Text>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Status Display Area */}
          <View style={styles.statusBanner}>
            {bluetoothState === 'PoweredOff' && (
              <View style={[styles.statusItem, styles.statusDisabled]}>
                <MaterialIcons name="bluetooth-disabled" size={20} color="#ef4444" />
                <Text style={styles.statusDisabledText}>Bluetooth desligado no dispositivo!</Text>
              </View>
            )}

            {bluetoothState === 'PoweredOn' && (
              <View style={[styles.statusItem, styles.statusScanning]}>
                <ActivityIndicator size="small" color="#0f172a" style={{ marginRight: 8 }} />
                <Text style={styles.statusScanningText}>Buscando impressoras térmicas...</Text>
              </View>
            )}
          </View>

          {/* Devices List */}
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={devices}
            renderItem={renderDeviceItems}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => (
              bluetoothState === 'PoweredOn' ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="bluetooth-searching" size={44} color="#94a3b8" />
                  <Text style={styles.emptyTitle}>Buscando...</Text>
                  <Text style={styles.emptyDesc}>
                    Certifique-se de que a impressora térmica esteja ligada e pareada no sistema.
                  </Text>
                </View>
              ) : null
            )}
          />

          {/* Connection Footer Controls */}
          <View style={styles.footer}>
            {connectedDevice ? (
              <View style={styles.connectedWidget}>
                <View style={styles.connectedInfo}>
                  <MaterialIcons name="print" size={20} color="#10b981" />
                  <Text style={styles.connectedText} numberOfLines={1}>
                    Conectado: {connectedDevice.name || connectedDevice.id}
                  </Text>
                </View>
                {cupomData && (
                  <TouchableOpacity style={styles.printBtn} onPress={handlePrint} activeOpacity={0.8}>
                    <Text style={styles.printBtnText}>Imprimir Cupom</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.notConnectedWidget}>
                <MaterialIcons name="info-outline" size={16} color="#64748b" style={{ marginRight: 6 }} />
                <Text style={styles.notConnectedText}>Nenhuma impressora ativa selecionada.</Text>
              </View>
            )}

            <TouchableOpacity style={styles.closeActionBtn} onPress={closeModal} activeOpacity={0.7}>
              <Text style={styles.closeActionBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  sheetSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  statusBanner: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  statusDisabled: {
    backgroundColor: '#fef2f2',
  },
  statusDisabledText: {
    marginLeft: 8,
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  statusScanning: {
    backgroundColor: '#f1f5f9',
  },
  statusScanningText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: '80%',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  connectedWidget: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 12,
    marginBottom: 12,
  },
  connectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  connectedText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  printBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  notConnectedWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    marginBottom: 12,
  },
  notConnectedText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  closeActionBtn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});

export default Devices;
