/* eslint-disable no-bitwise */
import { Buffer } from "buffer"
import { CUPOM } from "@/types"
import { create } from "zustand"
import { useCallback, useEffect } from "react"
import { buildPrintMessage } from "@/utils/printer"
import { Alert, Platform, PermissionsAndroid } from "react-native"
import { BleManager, Characteristic, Device } from "react-native-ble-plx"
import { PERMISSIONS, requestMultiple, RESULTS } from "react-native-permissions"

export type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting"

export const useBLEStore = create<{
  bleManager: BleManager
  devices: Device[]
  connectedDevice: Device | null
  characteristic: Characteristic | null
  isConnecting: boolean
  bluetoothState: string
  connectionState: ConnectionState
  setConnectionState: (state: "disconnected" | "connecting" | "connected" | "reconnecting") => void
  setIsConnecting: (isConnecting: boolean) => void
  setBluetoothState: (bluetoothState: string) => void
  setDevices: (devices: Device[]) => void
  setConnectedDevice: (connectedDevice: Device | null) => void
  setCharacteristic: (characteristic: Characteristic | null) => void
}>((set) => ({
  bleManager: new BleManager(),
  devices: [],
  connectedDevice: null,
  characteristic: null,
  isConnecting: false,
  connectionState: "disconnected",
  bluetoothState: "Unknown",
  setConnectionState: (connectionState) => set({ connectionState }),
  setIsConnecting: (isConnecting: boolean) => set({ isConnecting }),
  setBluetoothState: (bluetoothState: string) => set({ bluetoothState }),
  setDevices: (devices: Device[]) => set({ devices }),
  setConnectedDevice: (connectedDevice: Device | null) => set({ connectedDevice }),
  setCharacteristic: (characteristic: Characteristic | null) => set({ characteristic }),
}))

interface BLEPrinterHook {
  devices: Device[]
  scan: () => void
  stopScan: () => void
  connectToDevice: (device: Device) => Promise<{ success: boolean; cleanup?: () => void }>
  disconnect: () => Promise<void>
  print: (data: CUPOM) => Promise<void>
  isConnected: boolean
  ConnectedDevice: Device | null
  requestPermissions: () => Promise<boolean>
  connectionState: ConnectionState
}

function useBLE(): BLEPrinterHook {
  const {
    devices,
    connectedDevice,
    characteristic,
    setDevices,
    setConnectedDevice,
    setCharacteristic,
    bleManager,
    isConnecting,
    setIsConnecting,
    connectionState,
    bluetoothState,
    setBluetoothState,
    setConnectionState,
  } = useBLEStore()

  // Monitor Bluetooth state changes
  useEffect(() => {
    const subscription = bleManager.onStateChange((state) => {
      console.log("Bluetooth state changed:", state)
      setBluetoothState(state)

      // Handle Bluetooth being turned off
      if (state === "PoweredOff" && connectedDevice) {
        console.log("Bluetooth turned off, disconnecting...")
        setConnectedDevice(null)
        setCharacteristic(null)
        Alert.alert("Bluetooth Desligado", "A conexão com a impressora foi perdida porque o Bluetooth foi desligado.")
      }

      // Handle Bluetooth being turned on
      if (state === "PoweredOn") {
        console.log("Bluetooth turned on")
      }
    }, true)

    return () => {
      subscription.remove()
    }
  }, [bleManager, connectedDevice, setBluetoothState, setConnectedDevice, setCharacteristic])

  useEffect(() => {
    if (!connectedDevice) return

    const subscription = bleManager.onDeviceDisconnected(connectedDevice.id, (error, device) => {
      console.log("Device disconnected", error, device)
      if (error) {
        console.error("Disconnection error:", error)
      }

      // Attempt to reconnect if this wasn't a user-initiated disconnect
      if (!isConnecting && device) {
        setIsConnecting(true)
        reconnectToDevice(device).finally(() => setIsConnecting(false))
      }

      // // Only handle this if we're not currently trying to disconnect
      // if (!isConnecting) {
      //   setConnectedDevice(null)
      //   setCharacteristic(null)

      //   if (error) {
      //     console.error("Disconnection error:", error)
      //     Alert.alert("Conexão Perdida", `A conexão com ${device?.name || "a impressora"} foi perdida.`)
      //   }
      // }
    })

    return () => {
      subscription.remove()
    }
  }, [connectedDevice, isConnecting])

  const reconnectToDevice = async (device: Device) => {
    try {
      console.log("Attempting to reconnect...")
      const maxAttempts = 3
      let attempts = 0

      while (attempts < maxAttempts) {
        attempts++
        try {
          const { success } = await connectToDevice(device)
          if (success) {
            console.log("Reconnected successfully!")
            return
          }
        } catch (error) {
          console.error(`Reconnection attempt ${attempts} failed:`, error)
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempts))
      }

      // If we get here, all attempts failed
      Alert.alert("Erro", "Não foi possível reconectar à impressora")
      setConnectedDevice(null)
      setCharacteristic(null)
    } catch (error) {
      console.error("Reconnection error:", error)
      setConnectedDevice(null)
      setCharacteristic(null)
    }
  }

  const requestPermissions = async () => {
    if (Platform.OS === "ios") {
      return true
    }

    if (Platform.OS === "android") {
      const apiLevel = parseInt(Platform.Version.toString(), 10)
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } else {
        const granted = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ])

        if (
          granted["android.permission.BLUETOOTH_CONNECT"] === PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.BLUETOOTH_SCAN"] === PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.ACCESS_FINE_LOCATION"] === RESULTS.GRANTED &&
          granted["android.permission.ACCESS_FINE_LOCATION"] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          bleManager.onStateChange((state) => {
            if (state === "PoweredOn") {
              scan()
            } else if (state === "PoweredOff") {
              stopScan()
            }
          })

          return true
        }
      }
    }

    return false
  }

  const startKeepAlive = useCallback((characteristic: Characteristic) => {
    if (Platform.OS === "ios") {
      // iOS typically manages connection persistence well (so we dont need to do anything)
      return () => {}
    }

    const interval = setInterval(async () => {
      try {
        const keepAliveCommand = Buffer.from([0x1b, 0x40]).toString("base64")
        if (characteristic.isWritableWithoutResponse) {
          await characteristic.writeWithoutResponse(keepAliveCommand)
        }
      } catch (error) {
        console.error("Keep-alive failed:", error)
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const connectToDevice = useCallback(
    async (device: Device) => {
      try {
        setConnectionState("connecting")
        setIsConnecting(true)

        console.log(`Attempting to connect to device: ${device.name} (${device.id})`)
        const connected = await bleManager.connectToDevice(device.id)
        await connected.discoverAllServicesAndCharacteristics()

        console.log(`Connected to ${device.name}, discovering services...`)
        const services = await connected.services()

        let writableCharacteristic: Characteristic | null = null
        for (const service of services) {
          const characteristics = await service.characteristics()
          for (const characteristic of characteristics) {
            if (characteristic.isWritableWithResponse || characteristic.isWritableWithoutResponse) {
              writableCharacteristic = characteristic
              break
            }
          }
          if (writableCharacteristic) break
        }

        if (!writableCharacteristic) {
          Alert.alert("Erro", "O dispositivo conectado não é uma impressora")
          return { success: false }
        }

        const cleanup = startKeepAlive(writableCharacteristic)
        setCharacteristic(writableCharacteristic)
        setConnectedDevice(connected)
        setConnectionState("connected")

        console.log("Connected successfully!")
        return { success: true, cleanup }
      } catch (error) {
        console.error("Failed to connect:", error)
        setConnectionState("disconnected")
        Alert.alert("Erro", "Não foi possível conectar ao dispositivo")
        return { success: false }
      } finally {
        setIsConnecting(false)
      }
    },
    [bleManager, setConnectedDevice, setCharacteristic, startKeepAlive, setIsConnecting, setConnectionState]
  )

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1

  const stopScan = useCallback(() => {
    bleManager.stopDeviceScan()
  }, [bleManager])

  const scan = async () => {
    const state = await bleManager.state()
    console.log("Bluetooth state:", state)

    if (state !== "PoweredOn") {
      Alert.alert("Erro", "Ative o Bluetooth para escanear dispositivos.")
      return
    }

    bleManager.startDeviceScan(null, { allowDuplicates: false, legacyScan: true }, (error, device) => {
      if (error) {
        console.log("Scan error:", error)
        Alert.alert("Erro", "Não foi possível escanear dispositivos. Verifique se o Bluetooth está ligado.")
        return
      }

      if (device) {
        const _devices = useBLEStore.getState().devices

        const printerKeywords = [
          "printer",
          "bt-printer",
          "bt_spp",
          "zebra",
          "epson",
          "mpt",
          "pos",
          "rpp",
          "xp",
          "srp",
          "rongta",
          "goojprt",
          "peripage",
          "xprinter",
          "hoin",
          "prt",
          "impressora",
        ]

        const deviceName = `${device.name ?? ""}`.toLowerCase()
        const localName = `${device.localName ?? ""}`.toLowerCase()

        const isPrinter = printerKeywords.some((keyword) => deviceName.includes(keyword) || localName.includes(keyword))

        if (isPrinter && !isDuplicteDevice(_devices, device)) {
          setDevices([..._devices, device])
        }
      }
    })
  }

  const disconnect = useCallback(async () => {
    if (connectedDevice) {
      try {
        setIsConnecting(true)
        await bleManager.cancelDeviceConnection(connectedDevice.id)
      } catch (error) {
        console.error("Error during disconnect:", error)
      } finally {
        setConnectedDevice(null)
        setCharacteristic(null)
        setIsConnecting(false)
      }
    }
  }, [bleManager, connectedDevice, setIsConnecting])

  const print = async (data: CUPOM) => {
    if (connectedDevice && characteristic) {
      await sendMessageToPrinter(characteristic, data)
    }
  }

  const sendLargeMessageToPrinter = async (
    characteristic: Characteristic,
    buffer: Buffer,
    chunkSize: number = 100
  ): Promise<void> => {
    const totalChunks = Math.ceil(buffer.length / chunkSize)

    for (let i = 0; i < totalChunks; i++) {
      const chunk = buffer.slice(i * chunkSize, (i + 1) * chunkSize)
      const base64Chunk = chunk.toString("base64")

      if (characteristic.isWritableWithResponse) {
        await characteristic.writeWithResponse(base64Chunk)
      } else if (characteristic.isWritableWithoutResponse) {
        await characteristic.writeWithoutResponse(base64Chunk)
      }

      // Aguarde um pequeno tempo entre os envios (essencial para BLE)
      await new Promise((res) => setTimeout(res, 1))
    }
  }

  const sendMessageToPrinter = async (characteristic: Characteristic, data: any): Promise<boolean> => {
    try {
      const printCommandBuffer = await buildPrintMessage(data)

      // Envia em blocos de 100 bytes
      await sendLargeMessageToPrinter(characteristic, printCommandBuffer, 100)

      return true
    } catch (error) {
      console.error("Erro ao imprimir:", error)
      return false
    }
  }

  return {
    connectToDevice,
    devices,
    scan,
    stopScan,
    disconnect,
    isConnected: !!connectedDevice,
    ConnectedDevice: connectedDevice,
    print,
    requestPermissions,
    connectionState,
  }
}

export default useBLE
