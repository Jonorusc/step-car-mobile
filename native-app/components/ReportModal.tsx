import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDownloadReport, Company } from '@/hooks/useCompany';
import { useSession } from '@/hooks/useSession';
import { Theme } from '@/constants/theme';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  company: Company | null;
}

export default function ReportModal({ visible, onClose, company }: ReportModalProps) {
  const { activeEstablishment } = useSession();
  const downloadMutation = useDownloadReport();

  const [startDate, setStartDate] = useState(new Date());
  
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 30);
  const [endDate, setEndDate] = useState(defaultEnd);

  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const handleGenerate = () => {
    if (!company || !activeEstablishment) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    downloadMutation.mutate({
      establishment_id: activeEstablishment.id,
      company_id: company.id,
      date_start: startStr,
      date_end: endStr,
      company_name: company.company_name
    }, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onClose();
      },
      onError: (err: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', err.response?.data?.message || 'Falha ao gerar o relatório.');
      }
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Gerar Relatório</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Selecione o período do relatório para a empresa{' '}
            <Text style={{ fontWeight: '700', color: '#0f172a' }}>{company?.fantasy_name}</Text>
          </Text>

          <View style={styles.dateRow}>
            <View style={styles.dateCol}>
              <Text style={styles.label}>Data Inicial</Text>
              <TouchableOpacity 
                style={styles.datePickerBtn} 
                onPress={() => setShowPicker('start')}
                activeOpacity={0.7}
              >
                <MaterialIcons name="event" size={20} color="#64748b" style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateCol}>
              <Text style={styles.label}>Data Final</Text>
              <TouchableOpacity 
                style={styles.datePickerBtn} 
                onPress={() => setShowPicker('end')}
                activeOpacity={0.7}
              >
                <MaterialIcons name="event" size={20} color="#64748b" style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showPicker && (
            <DateTimePicker
              value={showPicker === 'start' ? startDate : endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowPicker(Platform.OS === 'ios' ? showPicker : null);
                if (date) {
                  if (showPicker === 'start') setStartDate(date);
                  else setEndDate(date);
                }
              }}
            />
          )}
          
          {Platform.OS === 'ios' && showPicker && (
            <TouchableOpacity 
              style={styles.iosPickerDoneBtn}
              onPress={() => setShowPicker(null)}
            >
              <Text style={styles.iosPickerDoneBtnText}>Confirmar Data</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.generateBtn, downloadMutation.isPending && styles.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={downloadMutation.isPending}
            activeOpacity={0.8}
          >
            {downloadMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <MaterialIcons name="download" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.generateBtnText}>Gerar Relatório</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 24,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateCol: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  dateText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  iosPickerDoneBtn: {
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  iosPickerDoneBtnText: {
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  generateBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  generateBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});
