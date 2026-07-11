import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useCreateService, useUpdateService } from '@/hooks/useService';
import { useCategoryList } from '@/hooks/useCategory';
import { useSession } from '@/hooks/useSession';
import { useCoinsFormatted } from '@/utils/currency';

export default function EditServiceModal({ visible, onClose, onSuccess, service }: any) {
  const { activeEstablishment } = useSession();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const isEdit = !!service;
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  // Fetch categories for the selector
  const { data: categoryData, isLoading: isLoadingCategories } = useCategoryList(
    activeEstablishment?.id ?? 0, 
    null
  );
  const categories = categoryData?.pages.flatMap((p) => p.data) || [];

  useEffect(() => {
    if (visible && service) {
      setName(service.name || '');
      setDescription(service.description || '');
      setPrice(service.price ? String(service.price) : '');
      setCategoryId(service.category_id || null);
    } else if (visible && !service) {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(null);
    }
    setIsCategoryDropdownOpen(false);
  }, [visible, service]);

  const handlePriceChange = (val: string) => {
    let onlyDigits = val.replace(/\D/g, '');
    if (parseInt(onlyDigits, 10) === 0) {
      onlyDigits = '';
    }
    setPrice(onlyDigits);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!name.trim() || !price || !categoryId || !activeEstablishment?.id) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha o nome, preço e selecione a categoria.');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
      Alert.alert('Erro', 'Preço inválido.');
      return;
    }

    const payload = isEdit 
        ? { 
            id: service.id, 
            establishmentId: activeEstablishment.id, 
            name, 
            description, 
            price: numericPrice 
          } 
        : { 
            establishmentId: activeEstablishment.id, 
            categoryId, 
            name, 
            description, 
            price: numericPrice 
          };
    
    const mutation = isEdit ? updateMutation : createMutation;

    mutation.mutate(payload as any, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess();
      },
      onError: (err: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', err.response?.data?.message || 'Erro ao salvar serviço.');
      }
    });
  };

  const selectedCategoryName = categories.find(c => c.id === categoryId)?.name || 'Selecione uma categoria...';

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>{isEdit ? 'Editar Serviço' : 'Novo Serviço'}</Text>
              <Text style={styles.sheetSub}>Preencha os dados do serviço</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
            
            {!isEdit && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Categoria *</Text>
                <TouchableOpacity 
                  style={[styles.input, styles.categorySelect]} 
                  onPress={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: categoryId ? '#0f172a' : '#94a3b8' }}>{selectedCategoryName}</Text>
                  <MaterialIcons name={isCategoryDropdownOpen ? "arrow-drop-up" : "arrow-drop-down"} size={24} color="#94a3b8" />
                </TouchableOpacity>

                {isCategoryDropdownOpen && (
                  <View style={styles.dropdownContainer}>
                    {isLoadingCategories ? (
                      <ActivityIndicator size="small" color="#10b981" style={{ padding: 12 }} />
                    ) : categories.length === 0 ? (
                      <Text style={styles.dropdownEmpty}>Nenhuma categoria encontrada.</Text>
                    ) : (
                      categories.map(cat => (
                        <TouchableOpacity 
                          key={cat.id} 
                          style={styles.dropdownItem}
                          onPress={() => {
                            setCategoryId(cat.id);
                            setIsCategoryDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome do Serviço *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Polimento"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preço (R$) *</Text>
              <TextInput
                style={styles.input}
                placeholder="R$ 0,00"
                value={price ? useCoinsFormatted(price) : ''}
                onChangeText={handlePriceChange}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
              <TextInput
                style={[styles.input, { height: 80, paddingTop: 12 }]}
                placeholder="Detalhes adicionais do serviço"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Footer Controls */}
          <View style={styles.footerControls}>
            <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.backBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn, 
                (createMutation.isPending || updateMutation.isPending) ? styles.saveBtnDisabled : null
              ]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  sheetSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  categorySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    maxHeight: 150,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#0f172a',
  },
  dropdownEmpty: {
    padding: 16,
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  footerControls: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
