import { WebView, WebViewMessageEvent } from "react-native-webview"
import { StyleSheet, Text, View } from "react-native"
import { useState } from "react"
import useBLE from "@/hooks/useBLE"
import { SafeAreaView } from "react-native-safe-area-context"
import DeviceModal from "@/components/devices-modal"

function Index() {
  const { scan, requestPermissions, print, devices, connect, ConnectedDevice, stopScan } = useBLE()
  const handleOnMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data
    if (!data) return
    openModal()
    // router.push({ pathname: "/printer", params: { print_data: data } })
  }

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions()
    if (isPermissionsEnabled) {
      console.log("Scanning for devices")
      scan()

      setTimeout(() => {
        console.log(devices)
        // stopScan()
      }, 10000)
    } else console.log(`not allowed`)
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
        closeModal={hideModal}
        visible={isModalVisible}
        isConnected={ConnectedDevice !== null}
        connectToDevice={connect}
        devices={devices}
        print={print}
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
