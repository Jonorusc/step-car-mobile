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
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategory';

import { useSession } from '@/hooks/useSession';

export default function EditCategoryModal({ visible, onClose, onSuccess, category }: any) {
  const { activeEstablishment } = useSession();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isEdit = !!category;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  useEffect(() => {
    if (visible && category) {
      setName(category.name || '');
      setDescription(category.description || '');
    } else if (visible && !category) {
      setName('');
      setDescription('');
    }
  }, [visible, category]);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Manual Validation
    if (!name.trim()) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha o nome da categoria.');
      return;
    }

    const payload = isEdit 
        ? { id: category.id, name, description, numberIcon: category.number_icon || 1 } 
        : { establishmentId: activeEstablishment?.id, name, description, numberIcon: 1 };
    
    const mutation = isEdit ? updateMutation : createMutation;

    mutation.mutate(payload as any, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess();
      },
      onError: (err: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', err.response?.data?.message || 'Erro ao salvar categoria.');
      }
    });
  };

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
              <Text style={styles.sheetTitle}>{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</Text>
              <Text style={styles.sheetSub}>Preencha os dados da categoria</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome da Categoria</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Lavagem Simples"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
              <TextInput
                style={[styles.input, { height: 80, paddingTop: 12 }]}
                placeholder="Ex: Inclui lavagem externa e aspiração"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

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
  footerControls: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'space-between',
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
