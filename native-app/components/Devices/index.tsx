import useBLE, { useBLEStore } from "@/hooks/useBLE";
import { CUPOM } from "@/types";
import { FC, useCallback, useEffect } from "react";
import { Button, FlatList, ListRenderItemInfo, Modal, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Device } from "react-native-ble-plx";
import { SafeAreaView } from "react-native-safe-area-context";
import DeviceItem from "./DeviceItem/Index";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type DeviceProps = {
  cupomData: CUPOM | null
  visible: boolean
  closeModal: () => void
  disconnect: () => Promise<void>
  devices: Device[]
  connectToDevice: (device: Device) => Promise<{ success: boolean; cleanup?: () => void }>
  connectedDevice: Device | null
  print: (data: CUPOM) => void
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
    /** Hooks */
    const { devices, setDevices } = useBLEStore();

    const {
        scan,
        stopScan,
        bluetoothState
    } = useBLE();

    /** Functions */
    const renderDeviceItens = useCallback((
        item: ListRenderItemInfo<Device>
    ) => {
        return (
            <DeviceItem
                disconnect={disconnect}
                item={item}
                connectToDevice={connectToDevice}
                closeModal={closeModal}
                connectedDevice={connectedDevice}
            />
        );
    }, [
        closeModal,
        connectToDevice
    ]);

    const handlePrint = useCallback(() => {
        if (cupomData) {
            print(cupomData)
            closeModal()
        }
    }, [cupomData, connectedDevice]);

    useEffect(() => {
        if (visible && bluetoothState == 'PoweredOn') {
            scan();
        } else {
            stopScan();
            setDevices([]);
        }
    }, [visible, bluetoothState]);

    useEffect(() => {
        console.log("LOOOOGG DO STATUS DO BTH");
        console.log(bluetoothState);
        if (bluetoothState == 'PoweredOff') {
            stopScan();
            setDevices([]);
        }
    }, [bluetoothState]);

    return(
        <Modal style={styles.modalContainer} animationType="slide" transparent={true} visible={visible}>
            <SafeAreaView style={styles.modalTitle}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitleText}>
                        Toque em um dispositivo para conectar!
                    </Text>

                    {visible && bluetoothState === 'PoweredOn' ? (
                        <ActivityIndicator size="small" color="#0000ff" />
                    ) : ''}

                    {bluetoothState === 'PoweredOff' && (
                        <View style={{ 
                            flexDirection: "row", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            marginVertical: 5 
                        }}>
                            <MaterialIcons name="bluetooth-disabled" size={15} color="#6d0808ff" />
                            <Text style={{ marginLeft: 5, color: "#6d0808ff" }}>
                                Bluetooth desligado!
                            </Text>
                        </View>
                    )}

                    {bluetoothState === 'PoweredOn' && devices.length !== 0 && (
                        <View style={{ 
                            flexDirection: "row", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            marginVertical: 5 
                        }}>
                            <MaterialIcons name="bluetooth-searching" size={15} color="#086d10ff" />
                            <Text style={{ marginLeft: 5, color: "#086d10ff" }}>
                                Buscando dispositivos...
                            </Text>
                        </View>
                    )}

                    <FlatList
                        style={{ flex: 1, borderWidth: 2, margin: 5 }}
                        contentContainerStyle={styles.modalFlatlistContiner}
                        data={devices}
                        renderItem={renderDeviceItens}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={true}
                    />
                    {connectedDevice?.isConnected ? (
                        <TouchableOpacity style={styles.ctaButton} onPress={handlePrint}>
                            <Text style={styles.ctaButtonText}>Imprimir Cupom</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text
                            style={{
                                textAlign: "center",
                                marginTop: 20,
                                fontSize: 18,
                                fontWeight: "400",
                                marginBottom: 20,
                            }}
                        >
                            Conecte-se a uma impressora
                        </Text>
                    )}
                    <TouchableOpacity style={styles.ctaButtonOutlined} onPress={closeModal}>
                        <Text style={styles.ctaButtonTextOutlined}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  modalFlatlistContiner: {
    paddingVertical: 20,
  },
  modalCellOutline: {
    borderWidth: 1,
    borderColor: "black",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  modalTitle: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingBottom: 20,
  },
  modalTitleText: {
    marginTop: 40,
    fontSize: 26,
    fontWeight: "bold",
    marginHorizontal: 20,
    textAlign: "center",
  },
  ctaButton: {
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonOutlined: {
    borderColor: "#020617",
    justifyContent: "center",
    borderWidth: 1,
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonTextOutlined: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#020617",
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  notConnected: {
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
})

export default Devices