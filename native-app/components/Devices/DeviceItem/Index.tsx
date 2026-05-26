import { useBLEStore } from '@/hooks/useBLE';
import { FC, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Alert, ListRenderItemInfo, Text, TouchableOpacity } from 'react-native';
import { Device } from 'react-native-ble-plx';

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
    }, [connectedDevice]);

    const connectAndCloseModal = useCallback(async () => {
        try {
            setConnecting(true);
            const connected = await connectToDevice(item.item);
            if (!connected.success) {
                const identifier = item.item.name ?? item.item.id;
                Alert.alert('Stepcar', 'Não foi possível conectar ao dispositivo ' + identifier);
            }
        } catch {
            Alert.alert('Stepcar', 'Não foi possível conectar ao dispositivo #ERRO - 1');
        } finally {
            setConnecting(false);
        }
    }, [closeModal, connectToDevice, item.item]);

    return (
        <TouchableOpacity
            style={{
                backgroundColor: isDeviceConnected() ? '#38a10f' : '#020617',
                borderRadius: 8,
                marginHorizontal: 20,
                marginBottom: 5,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
            onPress={connectAndCloseModal}
        >
            <TouchableOpacity style={styles.itemButton} onPress={connectAndCloseModal}>
                {connecting ? (
                    <>
                        <Text style={styles.itemText}>Conectando</Text>
                        <ActivityIndicator size="small" color="#fff" />
                    </>
                ) : (
                    <Text style={styles.itemText}>{item.item.name ?? item.item.id}</Text>
                )}
            </TouchableOpacity>
            {isDeviceConnected() && (
                <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={(event) => {
                        event.preventDefault();
                        disconnect();
                    }}
                >
                    <Text style={styles.disconnectButtonText}>Desconectar</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    itemText: {
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
        color: '#fff',
    },
    disconnectButton: {
        backgroundColor: '#d92929',
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
        marginHorizontal: 20,
        padding: 5,
        marginBottom: 5,
        borderRadius: 8,
    },
    disconnectButtonText: {
        color: '#fff',
    },
    itemButton: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        gap: 10,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 5,
        paddingVertical: 15,
        borderRadius: 8,
    },
});

export default DeviceItem;
