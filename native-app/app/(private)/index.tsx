import Devices from "@/components/Devices";
import useBLE, { useBLEStore } from "@/hooks/useBLE";
import { CUPOM } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, SafeAreaView, Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import WebView from "react-native-webview";

const Main = () => {
    /** useStates */
    const [cupomData, setCupomData] = useState<CUPOM | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

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

        // if (msg.type === "DOWNLOAD_PDF") {
        //     const { data, fileName } = msg
        //     handleDownloadPDF(data, fileName)
        //     return
        // }

        const cupomData = JSON.parse(data) as CUPOM
        setCupomData(cupomData)

        if (connectionState === "connected" && connectedDevice !== null) {
            if (!processingPrint) {
                print(cupomData)
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
        console.log('Solicitando permissões!!!');
        requestPermissions();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={{ color: "black", fontSize: 24 }}>Main page</Text>
        </SafeAreaView>
    );
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
