import { WebView, WebViewMessageEvent } from "react-native-webview"
import { Alert, StyleSheet } from "react-native"
import { useState } from "react"
import useBLE, { useBLEStore } from "@/hooks/useBLE"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { SafeAreaView } from "react-native-safe-area-context"
import DeviceModal from "@/components/devices-modal"
import type { CUPOM } from "../types"

function Index() {
  const [cupomData, setCupomData] = useState<CUPOM | null>(null)
  const { scan, requestPermissions, print, connectToDevice, disconnect } = useBLE()
  const { connectedDevice, devices } = useBLEStore()

  const handleDownloadPDF = async (data: string, fileName: string) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`

      await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.Base64 })

      Alert.alert("Sucesso", "Relatório baixado com sucesso!")

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: "Compartilhar PDF",
          UTI: "com.adobe.pdf",
        })
      }
    } catch (error) {
      console.error("Error downloading PDF,", error)
      Alert.alert("Erro", "Ocorreu um erro ao baixar o PDF.")
    }
  }

  const handleOnMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data as any
    if (!data) return

    const msg = JSON.parse(data)
    if (msg.type === "DOWNLOAD_PDF") {
      const { data, fileName } = msg
      handleDownloadPDF(data, fileName)
      return
    }

    const cupomData = JSON.parse(data) as CUPOM
    setCupomData(cupomData)
    openModal()
  }

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions()
    if (isPermissionsEnabled) {
      scan()
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
      <WebView
        source={{ uri: "https://stepcar.com.br" }}
        onMessage={handleOnMessage}
        javaScriptEnabled
        domStorageEnabled
      />
      <DeviceModal
        cupomData={cupomData}
        closeModal={hideModal}
        visible={isModalVisible}
        connectedDevice={connectedDevice}
        connectToDevice={connectToDevice}
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
