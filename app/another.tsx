import { BleItem } from "@/components/ui/BleItem"
import { useBLEDevices } from "@/hooks/context/useBLE"
import useThermalPrinter from "@/hooks/useThermalPrinter"
import { FlatList, ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Device, State } from "react-native-ble-plx"

const Another = () => {
  const { hasConnected, printer, devices, bleState } = useBLEDevices()
  const { printRecipe } = useThermalPrinter(printer)

  const printerExample = () => {
    printRecipe({
      title: "Receita de Bolo",
    })
  }

  const renderItem: ListRenderItem<Device> = ({ item }) => <BleItem item={item} />
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lista de Impressoras</Text>
      {bleState !== State.PoweredOn && <Text style={styles.text}>Bluetooth está desligado</Text>}
      {devices.length === 0 && <Text style={styles.text}>Nenhum dispositivo encontrado</Text>}
      {!hasConnected && <Text style={styles.text}>Nenhum dispositivo conectado</Text>}
      {!printer && <Text style={styles.text}>Nenhuma impressora conectada</Text>}
      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.button} onPress={printerExample}>
        <Text style={styles.buttonText}>Imprimir Texto</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Another

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
  text: {
    fontSize: 16,
    color: "#c4c4c4",
  },
})
