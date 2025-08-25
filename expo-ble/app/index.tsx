import { WebView, WebViewMessageEvent } from "react-native-webview"
import { ActivityIndicator, Alert, StyleSheet, Text, View, TouchableOpacity, Animated } from "react-native"
import { useEffect, useState, useRef } from "react"
import useBLE, { useBLEStore } from "@/hooks/useBLE"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import { SafeAreaView } from "react-native-safe-area-context"
import DeviceModal from "@/components/devices-modal"
import type { CUPOM } from "../types"
import NetInfo from "@react-native-community/netinfo"
import AntDesign from "@expo/vector-icons/AntDesign"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"

function Index() {
  const [cupomData, setCupomData] = useState<CUPOM | null>(null)
  const { scan, requestPermissions, print, connectToDevice, disconnect } = useBLE()
  const { connectedDevice, devices, connectionState } = useBLEStore()
  const [isConnected, setIsConnected] = useState<boolean | null>(null)

  // Animation value for the floating button
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Show/hide the floating button with animation
  useEffect(() => {
    if (connectedDevice) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [connectedDevice, fadeAnim])

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

    if (connectionState === "connected") {
      print(cupomData)
      return
    }
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

  // Handle disconnect from floating button
  const handleDisconnect = async () => {
    try {
      await disconnect()
      Alert.alert("Desconectado", "Impressora desconectada com sucesso.")
    } catch (error) {
      console.error("Failed to disconnect:", error)
      Alert.alert("Erro", "Não foi possível desconectar da impressora.")
    }
  }

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state?.isConnected)
    })

    NetInfo.fetch().then((state) => {
      setIsConnected(state?.isConnected)
    })

    return () => unsubscribe()
  }, [])

  if (isConnected === null) {
    return <ActivityIndicator size="large" />
  }

  if (!isConnected) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <AntDesign name="disconnect" size={80} color="#0072a3" />
        <Text style={{ fontSize: 15 }}>Sem conexão com a internet</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: "https://stepcar.com.br" }}
        onMessage={handleOnMessage}
        javaScriptEnabled
        domStorageEnabled
      />

      {/* Floating Disconnect Button */}
      <Animated.View style={[styles.floatingButton, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.floatingButtonContent} onPress={handleDisconnect} activeOpacity={0.7}>
          <Text style={{ color: "white" }}>Desconectar</Text>
          <MaterialIcons name="print" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

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
    position: "relative",
  },
  floatingButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#ff3b30", // Red color for disconnect action
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
})

export default Index
