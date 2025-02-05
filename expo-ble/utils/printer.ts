import { Buffer } from "buffer"

const ESC = "\x1B"
const GS = "\x1D"

const setBold = (enabled: boolean) => `${ESC}E${enabled ? "\x01" : "\x00"}`
const setUnderline = (enabled: boolean) => `${ESC}-${enabled ? "\x01" : "\x00"}`
const setAlignment = (align: "left" | "center" | "right") => {
  const alignCode = align === "left" ? "\x00" : align === "center" ? "\x01" : "\x02"
  return `${ESC}a${alignCode}`
}
const setTextSize = (widthMultiplier: number, heightMultiplier: number) => {
  const size = (widthMultiplier - 1) * 16 + (heightMultiplier - 1)
  return `${GS}!${String.fromCharCode(size)}`
}

const setQRModel = (model: number = 2) => {
  // Model should be 1 or 2
  return `${GS}(k\x04\x00\x31\x41${String.fromCharCode(model)}\x00`
}

const setQRSize = (size: number = 6) => {
  // Size should be between 1 and 16
  return `${GS}(k\x03\x00\x31\x43${String.fromCharCode(size)}`
}

const breakLine = (lines: number = 1) => "\n".repeat(lines)
export const printDividerLine = (width: number = 32) => {
  return "".padStart(width, "-") // Creates a line with '-' spanning the specified width
}

const setQRErrorCorrection = (level: number = 48) => {
  // Level: 48 (L), 49 (M), 50 (Q), 51 (H)
  return `${GS}(k\x03\x00\x31\x45${String.fromCharCode(level)}`
}
const storeQRData = (data: string) => {
  const dataBytes = Buffer.from(data, "utf-8")
  const length = dataBytes.length + 3
  const pL = length % 256
  const pH = Math.floor(length / 256)
  return `${GS}(k${String.fromCharCode(pL)}${String.fromCharCode(pH)}\x31\x50\x30${dataBytes.toString("latin1")}`
}

const printStoredQR = () => {
  return `${GS}(k\x03\x00\x31\x51\x30`
}

const buildQRCodeCommandFromObject = (data: { username: string; password: string }): string => {
  // Serialize the data object to a JSON string
  const jsonData = JSON.stringify(data)

  let cmd = ""

  // Center alignment for QR code
  cmd += setAlignment("center")

  // Set QR code model, size, and error correction level
  cmd += setQRModel(2) // Model 2
  cmd += setQRSize(6) // Module size (adjust as needed)
  cmd += setQRErrorCorrection(49) // Error correction level M

  // Store QR code data
  cmd += storeQRData(jsonData)

  // Print the QR code
  cmd += printStoredQR()

  cmd += breakLine()

  return cmd
}

const initializePrinter = () => `${ESC}@`

export const buildPrintMessage = async (data: any): Promise<string> => {
  let cmd = ""
  // Initialize printer
  cmd += initializePrinter()
  cmd += breakLine(2)

  cmd += setAlignment("center")
  cmd += setUnderline(true)
  cmd += "TESTE DE IMPRESSÃO"
  cmd += breakLine(1)
  cmd += setUnderline(false)
  cmd += setAlignment("left")

  cmd += breakLine(3)

  return cmd
}
