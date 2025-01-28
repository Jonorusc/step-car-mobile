import React, { useEffect, useState } from "react"
import { View, Text, Button, StyleSheet } from "react-native"
import { Device } from "react-native-ble-plx"

const BleItem = ({ item }: { item: Device }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    const subscription = item.onDisconnected(() => {
      setIsConnected(false)
    })

    return () => {
      subscription.remove()
    }
  }, [item])

  const handleConnection = async () => {
    setIsConnecting(true)
    try {
      await item.connect()
      setIsConnected(true)
    } catch (error) {
      console.log("Error connecting:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.alignColumn}>
        <Text style={styles.text}>{item.name ? item.name : "Unknown"}</Text>
        <Text style={styles.text}>ID: {item.id}</Text>
      </View>
      <Button
        title={isConnected ? "Conectado" : "Conectar"}
        onPress={isConnected ? undefined : handleConnection}
        disabled={isConnecting}
      />
    </View>
  )
}

export { BleItem }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderColor: "#c4c4c4",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  alignColumn: {
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-start",
  },
  text: {
    fontSize: 16,
    fontWeight: "semibold",
    marginBottom: 8,
  },
  button: {
    padding: 16,
    backgroundColor: "#0f172a",
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
    color: "#fff",
  },
})
