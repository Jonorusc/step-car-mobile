import manager from "@/utils/BleManagerInstance"
import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from "react"
import { Platform, PermissionsAndroid } from "react-native"
import { Device, State, Subscription } from "react-native-ble-plx"

interface BLEDevicesContextType {
  devices: Device[]
  printer: Device | null
  isLoading: boolean
  hasConnected: boolean
  bleState: State
  scanForDevices: () => void
  stopScanning: () => void
}

const BLEDevicesContext = createContext<BLEDevicesContextType | undefined>(undefined)

const BLEDevicesProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [bleState, setBleState] = useState<State>(State.Unknown)
  const [isLoading, setIsLoading] = useState(true)
  const [devices, setDevices] = useState<Device[]>([])
  const hasConnected = devices.some((device) => device.isConnected)
  const connectedDevices = devices.filter((device) => device.isConnected)
  const printer = connectedDevices?.[0] || null

  const scanForDevices = () => {
    setIsLoading(true)
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Error in scanning:", error)
        setIsLoading(false)
        return
      }

      console.log(device)

      if (device?.name) {
        setDevices((prevDevices) => {
          if (!prevDevices.some((d) => d.id === device.id)) {
            const isLeopardo = device.name?.startsWith("Leopardo")
            const isThermalPrinter = device.name?.startsWith("Thermal")
            const newDevices = isLeopardo || isThermalPrinter ? [device, ...prevDevices] : [...prevDevices, device]
            return newDevices
          }
          return prevDevices
        })
      }
    })
  }

  const stopScanning = () => {
    manager.stopDeviceScan()
    setIsLoading(false)
  }

  const handleStateChange = (state: State) => {
    setBleState(state)
    if (state === State.PoweredOn) {
      scanForDevices()
    } else if (state === State.PoweredOff) {
      stopScanning()
      setDevices([])
    }
  }

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === "ios") {
      return true
    }

    if (Platform.OS === "android") {
      const apiLevel = parseInt(Platform.Version.toString(), 10)
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } else {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ])

        return (
          granted["android.permission.BLUETOOTH_CONNECT"] === PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.BLUETOOTH_SCAN"] === PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.ACCESS_FINE_LOCATION"] === PermissionsAndroid.RESULTS.GRANTED
        )
      }
    }

    return false
  }

  useEffect(() => {
    let subscription: Subscription | null = null

    requestPermissions().then((granted) => {
      if (granted) {
        subscription = manager.onStateChange(handleStateChange, true)
      } else {
        console.log("Permissions not granted")
      }
    })

    return () => {
      if (subscription) {
        subscription.remove()
      }
      stopScanning()
    }
  }, [])

  const contextValue: BLEDevicesContextType = {
    devices,
    isLoading,
    hasConnected,
    bleState,
    scanForDevices,
    stopScanning,
    printer,
  }

  return <BLEDevicesContext.Provider value={contextValue}>{children}</BLEDevicesContext.Provider>
}

const useBLEDevices = () => {
  const context = useContext(BLEDevicesContext)
  if (context === undefined) {
    throw new Error("useBLEDevices must be used within a BLEDevicesProvider")
  }
  return context
}

export { BLEDevicesProvider, useBLEDevices }
