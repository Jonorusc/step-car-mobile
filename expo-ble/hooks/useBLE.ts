/* eslint-disable no-bitwise */
import { useCallback, useState } from "react"
import { Alert, PermissionsAndroid, Platform } from "react-native"

import * as ExpoDevice from "expo-device"

import { BleError, BleManager, Characteristic, Device } from "react-native-ble-plx"
import { buildPrintMessage } from "@/utils/printer"

const bleManager = new BleManager()

interface BLEPrinterHook {
  devices: Device[]
  scan: () => void
  stopScan: () => void
  connect: (device: Device) => Promise<void>
  disconnect: () => Promise<void>
  sendMessageToPrinter: (characteristic: Characteristic, data: any) => Promise<boolean>
  isConnected: boolean,
  requestPermissions: () => Promise<boolean>
}

function useBLE(): BLEPrinterHook {
  const [allDevices, setAllDevices] = useState<Device[]>([])
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)
  const [characteristic, setCharacteristic] = useState<Characteristic | null>(null)
  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
      title: "Permissão de Localização",
      message: "StepCar requesita permissão de localização para funcionar corretamente",
      buttonPositive: "Aceitar",
    })
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Permissão de Localização",
        message: "StepCar requesita permissão de localização para funcionar corretamente",
        buttonPositive: "Aceitar",
      }
    )
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Permissão de Localização",
        message: "StepCar requesita permissão de localização para funcionar corretamente",
        buttonPositive: "Aceitar",
      }
    )

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    )
  }

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: "Permissão de Localização",
          message: "StepCar requesita permissão de localização para funcionar corretamente",
          buttonPositive: "Aceitar",
        })
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } else {
        const isAndroid31PermissionsGranted = await requestAndroid31Permissions()

        return isAndroid31PermissionsGranted
      }
    } else {
      return true
    }
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
        }
        setConnectedDevice(connected)
      } catch (error) {
        console.error("Connection error:", error)
      }
    },
    [bleManager]
  )

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1

  const stopScan = useCallback(() => {
    bleManager.stopDeviceScan()
  }, [bleManager])

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error)
      }

      if (device) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device]
          }
          return prevState
        })
      }
    })
  const disconnect = useCallback(async () => {
    if (connectedDevice) {
      await bleManager.cancelDeviceConnection(connectedDevice.id)
      setConnectedDevice(null)
      setCharacteristic(null)
    }
  }, [bleManager, connectedDevice])

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
    scan: scanForPeripherals,
    stopScan,
    disconnect,
    isConnected: !!connectedDevice,
    sendMessageToPrinter,
    requestPermissions
  }
}

export default useBLE
