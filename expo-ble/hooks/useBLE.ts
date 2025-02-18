/* eslint-disable no-bitwise */
import { useCallback, useState } from "react"
import { Alert, Platform, PermissionsAndroid } from "react-native"
import { PERMISSIONS, requestMultiple, RESULTS } from "react-native-permissions"

import { BleManager, Characteristic, Device, ScanMode } from "react-native-ble-plx"
import { buildPrintMessage } from "@/utils/printer"
import { CUPOM } from "@/types"

const bleManager = new BleManager()

interface BLEPrinterHook {
  devices: Device[]
  scan: () => void
  stopScan: () => void
  connect: (device: Device) => Promise<boolean>
  disconnect: () => Promise<void>
  print: (data: CUPOM) => Promise<void>
  isConnected: boolean
  ConnectedDevice: Device | null
  requestPermissions: () => Promise<boolean>
}

function useBLE(): BLEPrinterHook {
  const [allDevices, setAllDevices] = useState<Device[]>([])
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)
  const [characteristic, setCharacteristic] = useState<Characteristic | null>(null)

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
            console.log(`mudou alguma coisag`, state)
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
        const connected = await bleManager.connectToDevice(device.id)
        await connected.discoverAllServicesAndCharacteristics()
        const services = await connected.services()

        for (const service of services) {
          const characteristics = await service.characteristics()

          for (const characteristic of characteristics) {
            if (characteristic.isWritableWithResponse || characteristic.isWritableWithoutResponse) {
              // Found a writable characteristic
              setCharacteristic(characteristic)
            }
          }
        }

        if (!characteristic) {
          Alert.alert("Erro", "O dispositivo conectado não é uma impressora")
          return false
        }
        setConnectedDevice(connected)
        return true
      } catch (error) {
        return false
      }
    },
    [bleManager]
  )

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1

  const stopScan = useCallback(() => {
    bleManager.stopDeviceScan()
  }, [bleManager])

  const scan = () => {
    bleManager.startDeviceScan(null, { allowDuplicates: false, legacyScan: true }, (error, device) => {
      if (error) {
        console.log(error)
      }

      if (device) {
        console.log(device.name ?? device.localName, device.isConnectable)
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            console.log(`adicionando`, device)
            return [...prevState, device]
          }
          console.log(`não adicionando`, device)
          return prevState
        })
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
    connect: connectToDevice,
    devices: allDevices,
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
