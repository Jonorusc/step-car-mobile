import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

export default function CompaniesScreen() {
  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Criar Empresa', 'O formulário de criação de empresas será implementado na Fase 6.');
  };

  const companies = [
    { id: 1, name: 'Localiza Rent a Car', cnpj: '02.230.150/0001-44' },
    { id: 2, name: 'Movida Aluguel de Carros', cnpj: '08.332.180/0001-99' },
    { id: 3, name: 'Unidas Locadora', cnpj: '10.550.210/0001-12' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Empresas Parceiras</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
          <MaterialIcons name="add" size={20} color="#ffffff" />
          <Text style={styles.addBtnText}>Nova Empresa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {companies.map((comp) => (
          <View key={comp.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="business" size={20} color="#4f46e5" />
              </View>
              <View style={styles.textGroup}>
                <Text style={styles.cardTitle}>{comp.name}</Text>
                <Text style={styles.cardCnpj}>CNPJ: {comp.cnpj}</Text>
              </View>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e510',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardCnpj: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
