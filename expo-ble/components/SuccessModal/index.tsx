import React from "react";
import { Modal, View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

const SuccessModal = ({ data, visible, onClose }: { data: any, visible: boolean; onClose: () => void }) => {
  async function sharePDF() {
      try {
          data
          let base64Pdf = data.base64;
          let fileName = data.fileName;

          // Caminho temporário seguro para Android/iOS
          const path =
          Platform.OS === 'android'
              ? `${RNFS.CachesDirectoryPath}/${fileName}`
              : `${RNFS.DocumentDirectoryPath}/${fileName}`;

          // Salva o PDF
          await RNFS.writeFile(path, base64Pdf, 'base64');

          const exists = await RNFS.exists(path);
          if (!exists) throw new Error('Arquivo não foi criado');

          // O Share.open vai usar file:// no Android
          await Share.open({
              title: 'Compartilhar Relatório',
              url: `file://${path}`,
              type: 'application/pdf',
              failOnCancel: false,
          });

          // Opcional: remove o arquivo após compartilhar
          // await RNFS.unlink(path);

          onClose();
      } catch (err) {
          console.error('Erro ao compartilhar PDF:', err);
      }
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Animação Lottie */}
          <LottieView
            source={require('../../assets/animate/success.json')}
            autoPlay
            loop={false}
            style={{ width: 120, height: 120 }}
          />

          <Text style={styles.title}>Sucesso!</Text>
          <Text style={styles.message}>O arquivo foi gerado com sucesso, compartilhe.</Text>

          <TouchableOpacity style={styles.button} onPress={sharePDF}>
            <Text style={styles.buttonText}>Compartilhar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonClosed} onPress={onClose}>
            <Text style={styles.buttonTextClosed}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#2e7d32",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#f97316",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonClosed: {
    backgroundColor: "#e6e6e6ff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonTextClosed: {
    color: "#001d29",
    fontWeight: "bold",
  },
});

export default SuccessModal;