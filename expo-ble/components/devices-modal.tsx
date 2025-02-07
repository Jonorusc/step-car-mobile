import useBLE from "@/hooks/useBLE"
import React, { FC, useCallback, useState } from "react"
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native"
import { Device } from "react-native-ble-plx"

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>
  connectToDevice: (device: Device) => Promise<boolean>
  closeModal: () => void
}

type DeviceModalProps = {
  visible: boolean
  closeModal: () => void
  devices: Device[]
  connectToDevice: (device: Device) => Promise<boolean>
  isConnected: boolean
  print: (data: any) => void
}

const DeviceModalListItem: FC<DeviceModalListItemProps> = (props) => {
  const { item, connectToDevice, closeModal } = props
  const [error, setError] = useState("")
  const [connecting, setConnecting] = useState(false)
  const connectAndCloseModal = useCallback(async () => {
    try {
      setConnecting(true)
      setError("")
      const connected = await connectToDevice(item.item)
      console.log(connected)
      if (!connected) {
        const identifier = item.item.name ?? item.item.id
        setError("Não foi possível conectar ao dispositivo " + identifier)
      }
    } catch {
      // send the error message
    } finally {
      setConnecting(false)
    }
    // closeModal()
  }, [closeModal, connectToDevice, item.item])

  return (
    <TouchableOpacity onPress={connectAndCloseModal} style={modalStyle.itemButton}>
      {connecting ? (
        <>
        <Text style={modalStyle.itemText}>Conectando </Text>
        <ActivityIndicator size="small" color="#fff" />
        </>
      ) : error.includes(item.item.id ?? item.item.name) ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : (
        <Text style={modalStyle.itemText}>{item.item.name ?? item.item.id}</Text>
      )}
    </TouchableOpacity>
  )
}

const DeviceModal: FC<DeviceModalProps> = (props) => {
  const { visible, closeModal, devices, connectToDevice, isConnected, print } = props

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return <DeviceModalListItem item={item} connectToDevice={connectToDevice} closeModal={closeModal} />
    },
    [closeModal, connectToDevice]
  )

  return (
    <Modal style={modalStyle.modalContainer} animationType="slide" transparent={false} visible={visible}>
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
          contentContainerStyle={modalStyle.modalFlatlistContiner}
          data={devices}
          renderItem={renderDeviceModalListItem}
          keyExtractor={(item) => item.id.toString()}
        />
        {isConnected ? (
          <TouchableOpacity style={modalStyle.ctaButton} onPress={() => print({ message: "Teste de impressão" })}>
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
    backgroundColor: "#020617",
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
})

export default DeviceModal
