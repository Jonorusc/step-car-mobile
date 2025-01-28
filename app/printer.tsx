// @ts-nocheck
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { TouchableOpacity, View, StyleSheet, Text, FlatList } from "react-native"
import { BLEPrinter } from "react-native-thermal-receipt-printer"

const Printer = () => {
  const [printers, setPrinters] = useState([])
  const [currentPrinter, setCurrentPrinter] = useState()

  useEffect(() => {
    BLEPrinter.init().then(() => {
      BLEPrinter.getDeviceList().then(setPrinters)
    })
  }, [])

  const connectPrinter = (printer) => {
    BLEPrinter.connectPrinter(printer.inner_mac_address).then(setCurrentPrinter, (error) => console.warn(error))
  }

  printTextTest = () => {
    currentPrinter && BLEPrinter.printText("<C>Texto</C>\n")
  }

  printBillTest = () => {
    currentPrinter && BLEPrinter.printBill("<C>Nota fiscal</C>")
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.printerItem} onPress={() => connectPrinter(item)}>
      <Text>{`Nome do dispositivo: ${item.device_name}`}</Text>
      <Text>{`Endereço MAC: ${item.inner_mac_address}`}</Text>
    </TouchableOpacity>
  )
  return (
    <>
      {/* <StatusBar barStyle="light-content" backgroundColor="#0f172a" translucent={false} /> */}
      <View style={styles.container} >
        <Text style={styles.header}>Lista de Impressoras</Text>
        <FlatList
          data={printers}
          renderItem={renderItem}
          keyExtractor={(item) => item.inner_mac_address}
          contentContainerStyle={styles.list}
        />
        <TouchableOpacity style={styles.button} onPress={printTextTest}>
          <Text style={styles.buttonText}>Imprimir Texto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={printBillTest}>
          <Text style={styles.buttonText}>Imprimir Nota Fiscal</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default Printer

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  list: {
    flexGrow: 1,
  },
  printerItem: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 8,
  },
  button: {
    padding: 16,
    backgroundColor: "#0f172a",
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
})
