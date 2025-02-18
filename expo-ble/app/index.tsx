import { WebView, WebViewMessageEvent } from "react-native-webview"
import { Alert, StyleSheet, Text, View } from "react-native"
import { useState } from "react"
import useBLE from "@/hooks/useBLE"
import { SafeAreaView } from "react-native-safe-area-context"
import DeviceModal from "@/components/devices-modal"
import type { CUPOM } from "../types"

function Index() {
  const [cupomData, setCupomData] = useState<CUPOM | null>(null)
  const { scan, requestPermissions, print, devices, connect, ConnectedDevice, disconnect } = useBLE()
  const handleOnMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data
    if (!data) return

    const cupomData = JSON.parse(data) as CUPOM
    setCupomData(cupomData)
    openModal()
  }

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions()
    if (isPermissionsEnabled) {
      scan()

      setTimeout(() => {
        console.log(devices)
        // stopScan()
      }, 10000)
    } else {
      Alert.alert("Permissão negada", "Você precisa permitir o acesso ao Bluetooth para continuar")
    }
  }

  const hideModal = () => {
    setIsModalVisible(false)
  }

  const openModal = async () => {
    scanForDevices()
    setIsModalVisible(true)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text onPress={openModal}>Testar</Text>
      <WebView source={{ uri: "https://stepcar.com.br" }} onMessage={handleOnMessage} />
      <DeviceModal
        cupomData={cupomData}
        closeModal={hideModal}
        visible={isModalVisible}
        connectedDevice={ConnectedDevice}
        connectToDevice={connect}
        devices={devices}
        print={print}
        disconnect={disconnect}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: Constants.statusBarHeight,
  },
})

export default Index
