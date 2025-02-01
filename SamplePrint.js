import React from 'react';
import {Button, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {BluetoothEscposPrinter} from 'react-native-bluetooth-escpos-printer';
import {hsdLogo} from './dummy-logo';

const SamplePrint = props => {
  const data = props.parsedData;
  return (
    <View style={styles.container}>
      <View style={styles.btn}>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            let columnWidths = [8, 20, 20];
            try {
              await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
              await BluetoothEscposPrinter.printPic(hsdLogo, {
                width: 250,
                left: 150,
              });
              await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.CENTER,
              );
              await BluetoothEscposPrinter.printColumn(
                [48],
                [BluetoothEscposPrinter.ALIGN.CENTER],
                ['Jl. Brigjen Saptadji Hadiprawira No.93'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [32],
                [BluetoothEscposPrinter.ALIGN.CENTER],
                ['https://xfood.id'],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Cliente', 'Prawito Hudoro'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Embalagem', 'Sim'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Entrega', 'Retirar Pessoalmente'],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printText('Produtos\r\n', {
                widthtimes: 1,
              });
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                columnWidths,
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['1x', 'Cumi-Cumi', 'R$200,00'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                columnWidths,
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['1x', 'Tongkol Seco', 'R$300,00'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                columnWidths,
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['1x', 'Atum', 'R$400,00'],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Subtotal', 'R$900,00'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Embalagem', 'R$6,00'],
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Entrega', 'R$0,00'],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [24, 24],
                [
                  BluetoothEscposPrinter.ALIGN.LEFT,
                  BluetoothEscposPrinter.ALIGN.RIGHT,
                ],
                ['Total', 'R$906,00'],
                {},
              );
              await BluetoothEscposPrinter.printText('\r\n\r\n', {});
              await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.CENTER,
              );
              await BluetoothEscposPrinter.printQRCode(
                'DP0837849839',
                280,
                BluetoothEscposPrinter.ERROR_CORRECTION.L,
              );
              await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.CENTER,
              );
              await BluetoothEscposPrinter.printColumn(
                [48],
                [BluetoothEscposPrinter.ALIGN.CENTER],
                ['DP0837849839'],
                {widthtimes: 2},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printColumn(
                [48],
                [BluetoothEscposPrinter.ALIGN.CENTER],
                ['Sábado, 18 de Junho de 2022 - 06:00 WIB'],
                {},
              );
              await BluetoothEscposPrinter.printText(
                '================================================',
                {},
              );
              await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
              await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
            } catch (e) {
              alert(e.message || 'ERRO');
            }
          }}>
          <Text style={styles.buttonText}>Imprimir cupom</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SamplePrint;

const styles = StyleSheet.create({
  container: {
    // padding: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0f1729',
  },
  btn: {
    marginBottom: 8,
  },
  button: {
    padding: 12,
    borderWidth: 2,
    borderColor: '#0f1729',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f1729',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
