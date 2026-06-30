/* eslint-disable no-bitwise */
import { Buffer } from 'buffer';
import { CUPOM } from '@/types';
import { create } from 'zustand';
import { useCallback, useEffect, useState } from 'react';
import { buildPrintMessage } from '@/utils/printer';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Characteristic, Device } from 'react-native-ble-plx';
import { PERMISSIONS, requestMultiple, RESULTS } from 'react-native-permissions';
import logger from '@/utils/logger';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

let bleManagerInstance: BleManager | null = null;
try {
    bleManagerInstance = new BleManager();
} catch (error) {
    logger.warn('[useBLE] BleManager failed to initialize (usually because Bluetooth is unsupported in this simulator/environment):', error);
}

export const useBLEStore = create<{
    bleManager: BleManager | null;
    devices: Device[];
    connectedDevice: Device | null;
    characteristic: Characteristic | null;
    isConnecting: boolean;
    bluetoothState: string;
    connectionState: ConnectionState;
    setConnectionState: (state: ConnectionState) => void;
    setIsConnecting: (isConnecting: boolean) => void;
    setBluetoothState: (bluetoothState: string) => void;
    setDevices: (devices: Device[]) => void;
    setConnectedDevice: (connectedDevice: Device | null) => void;
    setCharacteristic: (characteristic: Characteristic | null) => void;
}>((set) => ({
    bleManager: bleManagerInstance,
    devices: [],
    connectedDevice: null,
    characteristic: null,
    isConnecting: false,
    connectionState: 'disconnected',
    bluetoothState: 'Unknown',
    setConnectionState: (connectionState) => set({ connectionState }),
    setIsConnecting: (isConnecting) => set({ isConnecting }),
    setBluetoothState: (bluetoothState) => set({ bluetoothState }),
    setDevices: (devices) => set({ devices }),
    setConnectedDevice: (connectedDevice) => set({ connectedDevice }),
    setCharacteristic: (characteristic) => set({ characteristic }),
}));

interface BLEPrinterHook {
    devices: Device[];
    scan: () => void;
    stopScan: () => void;
    connectToDevice: (device: Device, silent?: boolean) => Promise<{ success: boolean; cleanup?: () => void }>;
    disconnect: () => Promise<void>;
    print: (data: CUPOM) => Promise<void>;
    isConnected: boolean;
    ConnectedDevice: Device | null;
    requestPermissions: () => Promise<boolean>;
    connectionState: ConnectionState;
    bluetoothState: any;
    processingPrint: boolean;
}

const printerKeywords = [
    'printer',
    'bt-printer',
    'bt_spp',
    'zebra',
    'epson',
    'mpt',
    'pos',
    'rpp',
    'xp',
    'srp',
    'rongta',
    'goojprt',
    'peripage',
    'xprinter',
    'hoin',
    'prt',
    'impressora',
];

function useBLE(): BLEPrinterHook {
    const {
        devices,
        connectedDevice,
        characteristic,
        setDevices,
        setConnectedDevice,
        setCharacteristic,
        bleManager,
        isConnecting,
        setIsConnecting,
        connectionState,
        bluetoothState,
        setBluetoothState,
        setConnectionState,
    } = useBLEStore();
    const [processingPrint, setProcessingPrint] = useState(false);

    // Monitor Bluetooth state changes
    useEffect(() => {
        if (!bleManager) return;
        const subscription = bleManager.onStateChange((state) => {
            logger.log('Bluetooth state:', state);
            setBluetoothState(state);

            if (state === 'PoweredOff' && connectedDevice) {
                logger.log('Bluetooth desligado, limpando conexão');
                setConnectedDevice(null);
                setCharacteristic(null);
                Alert.alert(
                    'Bluetooth Desligado',
                    'A conexão com a impressora foi perdida porque o Bluetooth foi desligado.',
                );
            }
        }, true);

        return () => subscription.remove();
    }, [bleManager, connectedDevice, setBluetoothState, setConnectedDevice, setCharacteristic]);

    useEffect(() => {
        if (!connectedDevice || !bleManager) return;

        const subscription = bleManager.onDeviceDisconnected(connectedDevice.id, async (error, device) => {
            if (keepAliveCleanup) {
                keepAliveCleanup();
                keepAliveCleanup = null;
            }
            logger.log('Device disconnected', error, device);
            if (error) {
                logger.error('Disconnection error:', error);
            }

            // 🚨 Só tenta reconectar se o Bluetooth estiver ligado
            const { bluetoothState, isConnecting: currentIsConnecting } = useBLEStore.getState();
            if (bluetoothState === 'PoweredOn' && !currentIsConnecting && device) {
                setIsConnecting(true);
                await reconnectToDevice(device).finally(() => setIsConnecting(false));
            } else {
                logger.log('Reconexão ignorada (Bluetooth desligado ou desconexão manual).');
                setConnectedDevice(null);
                setCharacteristic(null);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [connectedDevice, bleManager, setIsConnecting, setConnectedDevice, setCharacteristic]);

    const requestPermissions = async () => {
        if (Platform.OS === 'ios') return true;

        if (Platform.OS === 'android') {
            const apiLevel = Number(Platform.Version);
            if (apiLevel < 31) {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }

            const granted = await requestMultiple([
                PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
                PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
                PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            ]);

            const hasAllPermissions =
                granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                granted['android.permission.ACCESS_FINE_LOCATION'] === RESULTS.GRANTED;

            if (hasAllPermissions) {
                if (bleManager) {
                    bleManager.onStateChange((state) => {
                        if (state === 'PoweredOn') scan();
                        if (state === 'PoweredOff') stopScan();
                    });
                }
                return true;
            }
        }
        return false;
    };

    // const startKeepAlive = useCallback((characteristic: Characteristic) => {
    //   if (Platform.OS === "ios") return () => {}

    //   const interval = setInterval(async () => {
    //     try {
    //       const keepAliveCommand = Buffer.from([0x1b, 0x40]).toString("base64")
    //       if (characteristic.isWritableWithoutResponse) {
    //         await characteristic.writeWithoutResponse(keepAliveCommand)
    //       }
    //     } catch (error) {
    //       console.error("Keep-alive failed:", error)
    //     }
    //   }, 15000)

    //   return () => clearInterval(interval)
    // }, [])

    let keepAliveCleanup: (() => void) | null = null;

    const connectToDevice = useCallback(
        async (device: Device, silent = false) => {
            if (!bleManager) {
                if (!silent) Alert.alert('Erro', 'Bluetooth não está disponível neste dispositivo.');
                return { success: false };
            }
            try {
                setConnectionState('connecting');
                setIsConnecting(true);

                const connected = await bleManager.connectToDevice(device.id);
                await connected.discoverAllServicesAndCharacteristics();
                const services = await connected.services();

                let writableCharacteristic: Characteristic | null = null;
                for (const service of services) {
                    const characteristics = await service.characteristics();
                    writableCharacteristic =
                        characteristics.find((c) => c.isWritableWithResponse || c.isWritableWithoutResponse) ?? null;
                    if (writableCharacteristic) break;
                }

                if (!writableCharacteristic) {
                    if (!silent) Alert.alert('Erro', 'O dispositivo conectado não é uma impressora');
                    return { success: false };
                }

                // 🟢 guarda cleanup do keepAlive
                // keepAliveCleanup = startKeepAlive(writableCharacteristic)

                setCharacteristic(writableCharacteristic);
                setConnectedDevice(connected);
                setConnectionState('connected');

                return { success: true };
            } catch (error) {
                logger.error('Failed to connect:', error);
                setConnectionState('disconnected');
                if (!silent) Alert.alert('Erro', 'Não foi possível conectar ao dispositivo');
                return { success: false };
            } finally {
                setIsConnecting(false);
            }
        },
        [bleManager, setConnectedDevice, setCharacteristic, setIsConnecting, setConnectionState],
    );

    const reconnectToDevice = useCallback(
        async (device: Device) => {
            logger.log('Attempting to reconnect...');
            const maxAttempts = 3;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const { success } = await connectToDevice(device, true);
                    if (success) {
                        logger.log('Reconnected successfully!');
                        return;
                    }
                } catch (error) {
                    logger.error(`Reconnection attempt ${attempt} failed:`, error);
                }
                await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
            }

            Alert.alert('Desconectado', 'A conexão com a impressora foi perdida.');
            setConnectedDevice(null);
            setCharacteristic(null);
        },
        [connectToDevice, setConnectedDevice, setCharacteristic],
    );

    const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
        devices.some((device) => nextDevice.id === device.id);

    const stopScan = useCallback(() => {
        if (bleManager) {
            bleManager.stopDeviceScan();
        }
        logger.log('Scan stopped');
    }, [bleManager]);

    const scan = useCallback(async () => {
        if (!bleManager) {
            logger.warn('[useBLE] Scanner not available: Bluetooth is not supported');
            return;
        }
        const state = await bleManager.state();
        logger.log('Bluetooth state:', state);

        if (state !== 'PoweredOn') {
            Alert.alert('Bluetooth Desligado', 'Ative o Bluetooth para escanear dispositivos.');
            return;
        }
        scanDevice();
    }, [bleManager]);

    const scanDevice = useCallback(() => {
        if (!bleManager) return;
        logger.log('Scanning for devices...');
        bleManager.startDeviceScan(null, { allowDuplicates: false, legacyScan: true }, (error, device) => {
            if (error) {
                stopScan();
                logger.error('Scan error:', error);
                Alert.alert('Erro', 'Não foi possível escanear dispositivos. Verifique se o Bluetooth está ligado.');
                return;
            }

            if (device) {
                const currentDevices = useBLEStore.getState().devices;
                const deviceName = `${device.name ?? ''}`.toLowerCase();
                const localName = `${device.localName ?? ''}`.toLowerCase();

                const isPrinter = printerKeywords.some(
                    (keyword) => deviceName.includes(keyword) || localName.includes(keyword),
                );

                if (isPrinter && !isDuplicateDevice(currentDevices, device)) {
                    setDevices([...currentDevices, device]);
                }
            }
        });
    }, [bleManager, setDevices, stopScan]);

    const disconnect = useCallback(async () => {
        if (connectedDevice && bleManager) {
            try {
                setIsConnecting(true);
                await bleManager.cancelDeviceConnection(connectedDevice.id);
            } catch (error) {
                logger.error('Error during disconnect:', error);
            } finally {
                // 🔑 limpa intervalo do keepAlive
                if (keepAliveCleanup) {
                    keepAliveCleanup();
                    keepAliveCleanup = null;
                }

                setConnectedDevice(null);
                setCharacteristic(null);
                setIsConnecting(false);
            }
        }
    }, [bleManager, connectedDevice, setIsConnecting, setConnectedDevice, setCharacteristic]);

    const print = async (data: CUPOM) => {
        if (connectedDevice && characteristic) {
            await sendMessageToPrinter(characteristic, data);
        }
    };

    const sendLargeMessageToPrinter = async (
        characteristic: Characteristic,
        buffer: Buffer,
        chunkSize = 100,
    ): Promise<void> => {
        const totalChunks = Math.ceil(buffer.length / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const chunk = buffer.slice(i * chunkSize, (i + 1) * chunkSize);
            const base64Chunk = chunk.toString('base64');

            if (characteristic.isWritableWithResponse) {
                await characteristic.writeWithResponse(base64Chunk);
            } else if (characteristic.isWritableWithoutResponse) {
                await characteristic.writeWithoutResponse(base64Chunk);
            }

            await new Promise((res) => setTimeout(res, 1));
        }
    };

    const sendMessageToPrinter = async (characteristic: Characteristic, data: CUPOM): Promise<boolean> => {
        try {
            setProcessingPrint(true);
            const printCommandBuffer = await buildPrintMessage(data);
            await sendLargeMessageToPrinter(characteristic, printCommandBuffer, 100);
            setProcessingPrint(false);
            return true;
        } catch (error) {
            logger.error('Erro ao imprimir:', error);
            return false;
        }
    };

    return {
        connectToDevice,
        devices,
        scan,
        stopScan,
        disconnect,
        isConnected: !!connectedDevice,
        ConnectedDevice: connectedDevice,
        print,
        requestPermissions,
        connectionState,
        bluetoothState,
        processingPrint,
    };
}

export default useBLE;
