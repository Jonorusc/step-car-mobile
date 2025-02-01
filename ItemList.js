import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import React from 'react';

const ItemList = ({ label, value, onPress, connected, actionText, color = '#0f1729' }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>{label || 'DESCONHECIDO'}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {connected && <Text style={styles.connected}>Conectado</Text>}
      {!connected && (
        <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor: color }]}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ItemList;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
  connected: {
    fontWeight: 'bold',
    color: '#0f1729',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});