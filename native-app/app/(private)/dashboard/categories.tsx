import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

export default function CategoriesScreen() {
  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Criar Categoria', 'O formulário de criação de categorias será implementado na Fase 4.');
  };

  const categories = [
    { id: 1, name: 'Lavagem Simples', desc: 'Lavagem externa básica', active: true },
    { id: 2, name: 'Lavagem Completa', desc: 'Higienização interna e externa com cera', active: true },
    { id: 3, name: 'Polimento', desc: 'Polimento técnico e cristalização', active: false },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão de Categorias</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
          <MaterialIcons name="add" size={20} color="#ffffff" />
          <Text style={styles.addBtnText}>Nova Categoria</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {categories.map((cat) => (
          <View key={cat.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{cat.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: cat.active ? '#14b8a620' : '#ef444420' }]}>
                <Text style={[styles.statusText, { color: cat.active ? '#14b8a6' : '#ef4444' }]}>
                  {cat.active ? 'Ativa' : 'Inativa'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>{cat.desc}</Text>
            
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
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
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
