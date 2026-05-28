import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BackendEstablishment } from '../hooks/useEstablishments';
import * as Haptics from 'expo-haptics';

interface SwitcherProps {
  active: BackendEstablishment | null;
  list: BackendEstablishment[];
  onSelect: (establishment: BackendEstablishment) => Promise<void>;
}

export default function EstablishmentSwitcher({ active, list, onSelect }: SwitcherProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
  };

  const handleSelect = async (est: BackendEstablishment) => {
    setModalVisible(false);
    await onSelect(est);
  };

  const renderEstablishmentItem = ({ item }: { item: BackendEstablishment }) => {
    const isSelected = active?.id === item.id;
    const dotColor = item.cor_system || '#0284c7';

    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          isSelected ? styles.listItemActive : null
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listItemHeader}>
          <View style={styles.listItemNameGroup}>
            <View style={[styles.colorIndicatorDot, { backgroundColor: dotColor }]} />
            <Text style={styles.listItemName}>{item.name_by_company}</Text>
          </View>
          {isSelected && (
            <MaterialIcons name="check-circle" size={20} color="#14b8a6" />
          )}
        </View>
        
        <Text style={styles.listItemDocument}>{item.document || 'CNPJ não informado'}</Text>
        <View style={styles.listItemBadgeContainer}>
          <Text style={styles.listItemBadgeText}>
            {item.type === 'CAR_WASH_AND_PARKING' ? 'Lavagem & Vaga' : item.type}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.switcherCard}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="storefront" size={24} color="#0284c7" />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.activeLabel}>Estabelecimento Ativo</Text>
            <Text style={styles.activeName} numberOfLines={1}>
              {active ? active.name_by_company : 'Selecione um estabelecimento'}
            </Text>
            {active && (
              <Text style={styles.activeDocument}>{active.document}</Text>
            )}
          </View>

          <MaterialIcons name="unfold-more" size={20} color="#94a3b8" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <SafeAreaView style={styles.safeArea}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar Estabelecimento</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                  <MaterialIcons name="close" size={22} color="#f8fafc" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={list}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderEstablishmentItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  switcherCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  activeLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 2,
  },
  activeDocument: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 12,
  },
  listItem: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  listItemActive: {
    borderColor: 'rgba(20, 184, 166, 0.3)',
    backgroundColor: 'rgba(20, 184, 166, 0.05)',
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  listItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  listItemDocument: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    marginLeft: 18,
  },
  listItemBadgeContainer: {
    marginTop: 8,
    marginLeft: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listItemBadgeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
});
