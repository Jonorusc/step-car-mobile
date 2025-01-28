import { useState } from "react"
import { Characteristic, Device } from "react-native-ble-plx"
import { Buffer } from "buffer"
import { buildPrintMessage } from "@/utils/printer.utils"

const useThermalPrinter = (printer: Device | null) => {
  const [isPrinting, setIsPrinting] = useState(false)

  const connectToPrinter = async (device: Device): Promise<Device | null> => {
    try {
      const connectedDevice = await device.connect()
      console.log("Connected to device:", connectedDevice.name)

      await connectedDevice.discoverAllServicesAndCharacteristics()
      console.log("Discovered services and characteristics")

      return connectedDevice
    } catch (error) {
      console.error("Failed to connect to device:", error)
      return null
    }
  }

  const findWritableCharacteristic = async (device: Device): Promise<Characteristic | null> => {
    try {
      const services = await device.services()

      for (const service of services) {
        console.log("Service UUID:", service.uuid)

        const characteristics = await service.characteristics()

        for (const characteristic of characteristics) {
          console.log("Characteristic UUID:", characteristic.uuid)
          console.log(" - isWritableWithResponse:", characteristic.isWritableWithResponse)
          console.log(" - isWritableWithoutResponse:", characteristic.isWritableWithoutResponse)

          if (characteristic.isWritableWithResponse || characteristic.isWritableWithoutResponse) {
            // Found a writable characteristic
            return characteristic
          }
        }
      }

      console.log("No writable characteristic found")
      return null
    } catch (error) {
      console.error("Error discovering characteristics:", error)
      return null
    }
  }

  // Send the message to the printer
  const sendMessageToPrinter = async (characteristic: Characteristic, cupom: any) => {
    try {
      const printCommand = await buildPrintMessage(cupom)

      // Convert the command string to base64
      const messageBuffer = Buffer.from(printCommand, "ascii")
      const base64Message = messageBuffer.toString("base64")

      if (characteristic.isWritableWithResponse) {
        await characteristic.writeWithResponse(base64Message)
      } else if (characteristic.isWritableWithoutResponse) {
        await characteristic.writeWithoutResponse(base64Message)
      }

      console.log("Formatted message sent to printer")
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const printRecipe = async (cupom: any) => {
    try {
      if (!printer) {
        return Promise.reject("Nenhuma impressora conectada")
      }

      setIsPrinting(true)
      const connectedDevice = await connectToPrinter(printer)
      if (!connectedDevice) {
        console.error("Device connection failed")
        return
      }

      const writableCharacteristic = await findWritableCharacteristic(connectedDevice)
      if (!writableCharacteristic) {
        console.error("No writable characteristic found on device")
        return Promise.reject("Dispositivo conectado não é uma impressora")
      }

      await sendMessageToPrinter(writableCharacteristic, cupom)
    } catch (error) {
      return Promise.reject(error)
    } finally {
      setIsPrinting(false)
    }
  }

  return { printRecipe, isPrinting }
}

export default useThermalPrinter
