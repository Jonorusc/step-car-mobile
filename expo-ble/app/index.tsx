import { WebView, WebViewMessageEvent } from "react-native-webview"
import { StyleSheet, Text, View } from "react-native"
import { useState } from "react"
import useBLE from "@/hooks/useBLE"
import { SafeAreaView } from "react-native-safe-area-context"
import DeviceModal from "@/components/devices-modal"

function Index() {
  const { scan, requestPermissions } = useBLE()
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
      scan()
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
      <View>
        <WebView style={styles.container} source={{ uri: "https://stepcar.com.br" }} onMessage={handleOnMessage} />
        <Text onPress={openModal} >Testar</Text>
        <DeviceModal closeModal={hideModal} visible={isModalVisible} />
      </View>
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
