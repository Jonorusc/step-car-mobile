import Devices from "@/components/Devices";
import useBLE, { useBLEStore } from "@/hooks/useBLE";
import { Company, Coupon, CUPOM, Establishment, Services, Vehicle } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Platform, Text, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from "react-native";
import WebView from "react-native-webview";
import SuccessModal from "@/components/SuccessModal";

const Main = () => {
    /** useStates */
    const [cupomData, setCupomData] = useState<CUPOM | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [dataShared, setDataShared] = useState<any>(null);
    
    /** Hooks */
    const {
        requestPermissions,
        print,
        connectToDevice,
        disconnect,
        processingPrint
    } = useBLE();

    const {
        connectedDevice,
        devices,
        connectionState
    } = useBLEStore();

    /** Functions */

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

    const handleMessage = (event: any) => {
        const data = event.nativeEvent.data as any

        if (!data) {
            return;
        }

        const response = JSON.parse(data);

        if (response.type === "DOWNLOAD_PDF") {
            const base64 = response.data;
            const fileName = response.fileName;
            setDataShared({
                base64: base64,
                fileName: fileName
            });
            setModalVisible(true);
            return;
        }

        const cupom = {
            vehicle: response.vehicle as Vehicle,
            services: response.services as Services[],
            establishment: response.establishment as Establishment,
            company: response.company as Company,
            coupon: (response.coupon[0] ?? null) as Coupon,
        } as CUPOM

        setCupomData(cupom)

        if (connectionState === "connected" && connectedDevice !== null) {
            if (! processingPrint) {
                print(cupom)
            }

            return
        }

        handleOpenModal()
    }

    const handleOpenModal = () => {
        setIsModalVisible(true);
    }

    const handleCloseModal = () => {
        setIsModalVisible(false)
    }

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
        requestPermissions();
    }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <WebView
                    source={{ uri: "https://stepcar.com.br" }}
                    // source={{ uri: "https://stepcarhomolog.com.br" }}
                    onMessage={handleMessage}
                    style={styles.webview}
                    javaScriptEnabled
                    domStorageEnabled
                />

                <Animated.View style={[styles.floatingButton, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.floatingButtonContent} onPress={handleDisconnect} activeOpacity={0.7}>
                        <Text style={{ color: "white", fontSize: 6 }}>Desconectar</Text>
                        <MaterialIcons name="print-disabled" size={24} color="white" />
                    </TouchableOpacity>
                </Animated.View>

                <Devices
                    cupomData={cupomData}
                    closeModal={handleCloseModal}
                    visible={isModalVisible}
                    connectedDevice={connectedDevice}
                    connectToDevice={connectToDevice}
                    devices={devices}
                    print={print}
                    disconnect={disconnect}
                />

                <SuccessModal 
                    data={dataShared}
                    visible={modalVisible} 
                    onClose={() => setModalVisible(false)} />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  webview:{
    flex: 1,
  },
  floatingButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#0f1729", // Red color for disconnect action
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

export default Main;