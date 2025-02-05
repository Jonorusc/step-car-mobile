import useBLE from "@/hooks/useBLE"
import React, { FC, useCallback } from "react"
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { Device } from "react-native-ble-plx"

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>
  connectToDevice: (device: Device) => void
  closeModal: () => void
}

type DeviceModalProps = {
  visible: boolean
  closeModal: () => void
}

const DeviceModalListItem: FC<DeviceModalListItemProps> = (props) => {
  const { item, connectToDevice, closeModal } = props

  const connectAndCloseModal = useCallback(() => {
    connectToDevice(item.item)
    closeModal()
  }, [closeModal, connectToDevice, item.item])

  return (
    <TouchableOpacity onPress={connectAndCloseModal} style={modalStyle.ctaButton}>
      <Text style={modalStyle.ctaButtonText}>{item.item.name}</Text>
    </TouchableOpacity>
  )
}

const DeviceModal: FC<DeviceModalProps> = (props) => {
  const { connect: connectToDevice, devices, isConnected, print } = useBLE()
  const { visible, closeModal } = props

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
              marginBottom: 20
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
})

export default DeviceModal
