import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

export default function ServicesScreen() {
  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Criar Serviço', 'O formulário de criação de serviços será implementado na Fase 5.');
  };

  const services = [
    { id: 1, name: 'Ducha rápida', price: 'R$ 20,00', category: 'Lavagem Simples' },
    { id: 2, name: 'Lavagem de Motor', price: 'R$ 50,00', category: 'Lavagem Completa' },
    { id: 3, name: 'Higienização Interna', price: 'R$ 150,00', category: 'Polimento' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Serviços</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
          <MaterialIcons name="add" size={20} color="#ffffff" />
          <Text style={styles.addBtnText}>Novo Serviço</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {services.map((svc) => (
          <View key={svc.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{svc.name}</Text>
                <Text style={styles.cardCategory}>{svc.category}</Text>
              </View>
              <Text style={styles.cardPrice}>{svc.price}</Text>
            </View>
            
            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.actionBtn}>
                <MaterialIcons name="edit" size={16} color="#4f46e5" />
                <Text style={[styles.actionBtnText, { color: '#4f46e5' }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <MaterialIcons name="delete" size={16} color="#ef4444" />
                <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  list: {
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardCategory: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
