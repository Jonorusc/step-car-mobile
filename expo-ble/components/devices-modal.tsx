import { useBLEStore } from "@/hooks/useBLE"
import { CUPOM } from "@/types"
import React, { FC, useCallback, useState } from "react"
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Device } from "react-native-ble-plx"

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>
  connectToDevice: (device: Device) => Promise<boolean>
  closeModal: () => void
  connectedDevice: Device | null
  disconnect: () => Promise<void>
}

type DeviceModalProps = {
  cupomData: CUPOM | null
  visible: boolean
  closeModal: () => void
  disconnect: () => Promise<void>
  devices: Device[]
  connectToDevice: (device: Device) => Promise<boolean>
  connectedDevice: Device | null
  print: (data: CUPOM) => void
}

const DeviceModalListItem: FC<DeviceModalListItemProps> = ({ item, connectToDevice, closeModal, disconnect }) => {
  const [connecting, setConnecting] = useState(false)
  const { connectedDevice } = useBLEStore()

  const isDeviceConnected = useCallback(() => {
    return connectedDevice?.id === item.item.id
  }, [connectedDevice])

  const connectAndCloseModal = useCallback(async () => {
    try {
      setConnecting(true)
      const connected = await connectToDevice(item.item)
      if (!connected) {
        const identifier = item.item.name ?? item.item.id
        Alert.alert("Stepcar", "Não foi possível conectar ao dispositivo " + identifier)
      }
    } catch {
      Alert.alert("Stepcar", "Não foi possível conectar ao dispositivo")
    } finally {
      setConnecting(false)
    }
    // closeModal()
  }, [closeModal, connectToDevice, item.item])

  return (
    <TouchableOpacity
      style={{
        backgroundColor: isDeviceConnected() ? "#38a10f" : "#020617",
        borderRadius: 8,
        marginHorizontal: 20,
        marginBottom: 5,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onPress={connectAndCloseModal}
    >
      <TouchableOpacity style={modalStyle.itemButton} onPress={connectAndCloseModal}>
        {connecting ? (
          <>
            <Text style={modalStyle.itemText}>Conectando </Text>
            <ActivityIndicator size="small" color="#fff" />
          </>
        ) : (
          <Text style={modalStyle.itemText}>{item.item.name ?? item.item.id}</Text>
        )}
      </TouchableOpacity>
      {isDeviceConnected() && (
        <TouchableOpacity
          style={modalStyle.disconnectButton}
          onPress={(event) => {
            event.preventDefault()
            disconnect()
          }}
        >
          <Text style={modalStyle.disconnectButtonText}>Desconectar</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

const DeviceModal: FC<DeviceModalProps> = ({
  visible,
  closeModal,
  connectToDevice,
  connectedDevice,
  print,
  disconnect,
  cupomData,
}) => {
  const { devices } = useBLEStore()
  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceModalListItem
          disconnect={disconnect}
          item={item}
          connectToDevice={connectToDevice}
          closeModal={closeModal}
          connectedDevice={connectedDevice}
        />
      )
    },
    [closeModal, connectToDevice]
  )

  const handlePrint = useCallback(() => {
    if (cupomData) print(cupomData)
  }, [cupomData])

  return (
    <Modal style={modalStyle.modalContainer} animationType="slide" transparent={true} visible={visible}>
      <SafeAreaView style={modalStyle.modalTitle}>
        <Text style={modalStyle.modalTitleText}>Toque em um dispositivo para conectar</Text>
        {devices.length === 0 && (
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 18,
              fontWeight: "400",
            }}
          >
            Nenhum dispositivo encontrado
          </Text>
        )}
        <FlatList
          style={{ flex: 1 }} // Add this line
          contentContainerStyle={modalStyle.modalFlatlistContiner}
          data={devices}
          renderItem={renderDeviceModalListItem}
          keyExtractor={(item) => item.id.toString()}
        />
        {connectedDevice?.isConnected ? (
          <TouchableOpacity style={modalStyle.ctaButton} onPress={handlePrint}>
            <Text style={modalStyle.ctaButtonText}>Imprimir Cupom</Text>
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
        <TouchableOpacity style={modalStyle.ctaButtonOutlined} onPress={closeModal}>
          <Text style={modalStyle.ctaButtonTextOutlined}>Cancelar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  )
}

const modalStyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  modalFlatlistContiner: {
    flex: 1,
    justifyContent: "center",
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
  itemText: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    color: "#fff",
  },
  itemButton: {
    backgroundColor: "transparent",
    flexDirection: "row",
    height: 50,
    justifyContent: "center",
    gap: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 5,
    paddingVertical: 15,
    borderRadius: 8,
  },
  disconnectButton: {
    backgroundColor: "#ee6565",
    justifyContent: "center",
    alignItems: "center",
    height: 30,
    marginHorizontal: 20,
    padding: 5,
    marginBottom: 5,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: "#fff",
  },
})

export default DeviceModal
