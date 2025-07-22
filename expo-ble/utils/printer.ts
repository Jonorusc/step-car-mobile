import { CUPOM } from "@/types"
import { Buffer } from "buffer"
import { useCoinsFormatted } from "./currency"

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

const feedPaper = (lines = 5) => `${ESC}d${String.fromCharCode(lines)}`

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

const formatCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/\D/g, "")

  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
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

const encodeText = (text: string) => Buffer.from(text, "utf-8")

const formatServiceLine = (name: string, price: string, lineWidth = 32) => {
  const maxNameLength = lineWidth - price.length - 1
  if (name.length > maxNameLength) {
    name = name.slice(0, maxNameLength - 1) + "…"
  }
  const spaces = " ".repeat(lineWidth - name.length - price.length)
  return `${name}${spaces}${price}\n`
}

export const buildPrintMessage = async (data: CUPOM): Promise<string> => {
  let total_price = 0
  let cmd = ""

  const setCodePageUTF8 = () => `${ESC}t\x10`

  // Inicializa a impressora
  cmd += initializePrinter() + setCodePageUTF8()
  cmd += breakLine(2)

  // Nome da empresa (centralizado)
  cmd += setAlignment("center")
  cmd += setBold(true)
  cmd += encodeText(data?.establishment.nameByCompany ?? "") + "\n"
  cmd += setBold(false)
  cmd += printDividerLine()
  cmd += breakLine(1)

  // Seção Registro
  cmd += setBold(true)
  cmd += "Registro\n"
  cmd += setBold(false)
  cmd += breakLine(1)
  cmd += setAlignment("left")
  cmd += `Modelo: ${setBold(true)}${encodeText(data.vehicleToCupom.model)}${setBold(false)}\n`
  cmd += `Placa: ${setBold(true)}${data.vehicleToCupom.plate}${setBold(false)}\n`
  cmd += `Cor: ${setBold(true)}${data.vehicleToCupom.color}${setBold(false)}\n`
  cmd += breakLine(1)
  cmd += printDividerLine()
  cmd += breakLine(1)

  if (data.collectCategoriesToModal.length > 0) {
    // Seção Serviços
    cmd += setAlignment("center")
    cmd += setBold(true)
    cmd += "Serviços\n"
    cmd += setBold(false)
    cmd += breakLine(1)

    // Lista de serviços
    cmd += setAlignment("left")
    data.collectCategoriesToModal.forEach((category: any, key: number) => {
      // Tipo de serviço
      cmd += setBold(true)
      cmd += category.label + "\n"
      cmd += setBold(false)

      // exibe cada serviço
      data.collectFormattedServicesToModal
        .filter((service: any) => service.category_id === category.value)
        .forEach((service: any) => {
          total_price += parseFloat(service.price)
          cmd += formatServiceLine(service.name, useCoinsFormatted(service.price))
        })
    })
    cmd += breakLine(1)
    cmd += printDividerLine()
  }

  cmd += setAlignment("center")
  // Seção Valor
  cmd += setBold(true)
  cmd += "Valor\n"
  cmd += setBold(false)
  cmd += printDividerLine()
  cmd += breakLine(1)

  cmd += setTextSize(2, 2) // Fonte grande
  cmd += `${useCoinsFormatted(total_price)}\n`
  cmd += setTextSize(1, 1) // Reset tamanho da fonte
  cmd += breakLine(1)

  // Informações adicionais
  cmd += setAlignment("left")
  cmd += "CNPJ: " + encodeText(formatCNPJ(data?.establishment.document.toString())) + "\n"
  cmd += breakLine(1)
  cmd += encodeText("POR FAVOR VERIFIQUE SE EXISTEM OBJETOS DE VALORES NO INTERIOR DO VEICULO E AVISE A GERENCIA.\n")
  cmd += encodeText("SEGUNDA A SABADO DAS 08:00 AS 17:30\n")
  cmd += encodeText("DOMINGOS E FERIADOS 08:00 AS 12:00\n")
  cmd += encodeText(
    "CASO NAO SEJA RETIRADO O VEICULO ATE O FECHAMENTO DO LAVA RAPIDO SERA COBRADO TAXA DE ESTACIONAMENTO\n"
  )
  cmd += setBold(true)
  cmd += encodeText("NOTURNA\n")
  cmd += setBold(false)
  cmd += breakLine(1)
  cmd += feedPaper(2)

  return cmd
}
