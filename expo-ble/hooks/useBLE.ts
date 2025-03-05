/* eslint-disable no-bitwise */
import { Buffer } from "buffer"
import { CUPOM } from "@/types"
import { create } from "zustand"
import { useCallback } from "react"
import { buildPrintMessage } from "@/utils/printer"
import { Alert, Platform, PermissionsAndroid } from "react-native"
import { BleManager, Characteristic, Device } from "react-native-ble-plx"
import { PERMISSIONS, requestMultiple, RESULTS } from "react-native-permissions"

export const useBLEStore = create<{
  bleManager: BleManager
  devices: Device[]
  connectedDevice: Device | null
  characteristic: Characteristic | null
  setDevices: (devices: Device[]) => void
  setConnectedDevice: (connectedDevice: Device | null) => void
  setCharacteristic: (characteristic: Characteristic | null) => void
}>((set) => ({
  bleManager: new BleManager(),
  devices: [],
  connectedDevice: null,
  characteristic: null,
  setDevices: (devices: Device[]) => set({ devices }),
  setConnectedDevice: (connectedDevice: Device | null) => set({ connectedDevice }),
  setCharacteristic: (characteristic: Characteristic | null) => set({ characteristic }),
}))

interface BLEPrinterHook {
  devices: Device[]
  scan: () => void
  stopScan: () => void
  connectToDevice: (device: Device) => Promise<boolean>
  disconnect: () => Promise<void>
  print: (data: CUPOM) => Promise<void>
  isConnected: boolean
  ConnectedDevice: Device | null
  requestPermissions: () => Promise<boolean>
}

function useBLE(): BLEPrinterHook {
  const { devices, connectedDevice, characteristic, setDevices, setConnectedDevice, setCharacteristic, bleManager } =
    useBLEStore()

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

  const connectToDevice = useCallback(
    async (device: Device) => {
      try {
        console.log(`Attempting to connect to device: ${device.name} (${device.id})`)

        const connected = await bleManager.connectToDevice(device.id)
        await connected.discoverAllServicesAndCharacteristics()

        console.log(`Connected to ${device.name}, discovering services...`)

        const services = await connected.services()

        let writableCharacteristic: Characteristic | null = null

        for (const service of services) {
          const characteristics = await service.characteristics()

          for (const characteristic of characteristics) {
            console.log(`Found characteristic: ${characteristic.uuid}`)
            if (characteristic.isWritableWithResponse || characteristic.isWritableWithoutResponse) {
              writableCharacteristic = characteristic
            }
          }
        }

        if (!writableCharacteristic) {
          Alert.alert("Erro", "O dispositivo conectado não é uma impressora")
          return false
        }

        setCharacteristic(writableCharacteristic)
        setConnectedDevice(connected)

        console.log("Connected successfully!")

        return true
      } catch (error) {
        console.error("Failed to connect:", error)
        Alert.alert("Erro", "Não foi possível conectar ao dispositivo")
        return false
      }
    },
    [bleManager, setConnectedDevice, setCharacteristic]
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
        if (!isDuplicteDevice(_devices, device)) {
          setDevices([..._devices, device])
        }
      }
    })
  }

  const disconnect = useCallback(async () => {
    if (connectedDevice) {
      await bleManager.cancelDeviceConnection(connectedDevice.id)
      setConnectedDevice(null)
      setCharacteristic(null)
    }
  }, [bleManager, connectedDevice])

  const print = async (data: CUPOM) => {
    if (connectedDevice && characteristic) {
      await sendMessageToPrinter(characteristic, data)
    }
  }

  const sendMessageToPrinter = async (characteristic: Characteristic, data: any): Promise<boolean> => {
    try {
      const printCommand = await buildPrintMessage(data)

      // Convert the command string to base64
      const messageBuffer = Buffer.from(printCommand, "ascii")
      const base64Message = messageBuffer.toString("base64")

      if (characteristic.isWritableWithResponse) {
        await characteristic.writeWithResponse(base64Message)
      } else if (characteristic.isWritableWithoutResponse) {
        await characteristic.writeWithoutResponse(base64Message)
      }

      return true
    } catch (error) {
      Promise.reject(error)
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
  }
}

export default useBLE
