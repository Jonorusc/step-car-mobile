import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import {
  useBillingDetail,
  useListBillingRecords,
  useSendBillingReport,
  BillingRecord,
} from '@/hooks/useBillings';
import { formatCurrencyBRL } from '@/utils/formatters';

export default function BillingDetailScreen() {
  const { id, billingId } = useLocalSearchParams<{ id: string; billingId: string }>();
  const companyId = Number(id);
  const closingId = Number(billingId);
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const { data: detail, isLoading: loadingDetail } = useBillingDetail(companyId, closingId);
  
  const { data: recordsData, isLoading: loadingRecords } = useListBillingRecords({
    companyId,
    closingId,
    page,
    limit_per_page: 50,
  });

  const sendReportMutation = useSendBillingReport(companyId);

  const toggleRow = (recordId: number) => {
    Haptics.selectionAsync();
    setExpandedRows(prev => ({ ...prev, [recordId]: !prev[recordId] }));
  };

  const handleSendReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendReportMutation.mutate(closingId, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Sucesso', 'E-mail enviado com sucesso!');
      },
      onError: (err: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', err.response?.data?.message || 'Erro ao enviar e-mail. Certifique-se que o PDF já foi gerado.');
      }
    });
  };

  const renderHeader = () => {
    const isPaid = detail?.status === 'PAYMENTED';
    
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.breadcrumb} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={16} color="#64748b" />
          <Text style={styles.breadcrumbText}>Voltar para Fechamentos</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Detalhes do Fechamento</Text>
          {detail && (
            <View style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusPending]}>
              <Text style={[styles.statusText, isPaid ? styles.statusPaidText : styles.statusPendingText]}>
                {isPaid ? 'Pago' : 'Pendente'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.pageSubtitle}>
          {detail ? `Período: ${detail.date_start.split('-').reverse().join('/')} - ${detail.date_end.split('-').reverse().join('/')}` : '...'}
        </Text>
        <Text style={styles.pageDesc}>
          {detail?.description || 'Mensal'}
        </Text>

        <View style={styles.totalBox}>
          <View>
            <Text style={styles.totalBoxLabel}>Valor Faturado</Text>
            <Text style={styles.totalBoxValue}>
              {loadingDetail ? '...' : formatCurrencyBRL((detail?.invoiced_amount || 0) / 100)}
            </Text>
          </View>
          
          <View style={styles.actionsBox}>
            {detail?.document_url && (
              <TouchableOpacity 
                style={styles.actionBtnOutline} 
                onPress={() => Linking.openURL(detail.document_url)}
              >
                <MaterialIcons name="file-download" size={16} color="#0f172a" />
                <Text style={styles.actionBtnOutlineText}>Baixar PDF</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionBtnSolid, sendReportMutation.isPending && styles.actionBtnDisabled]}
              onPress={handleSendReport}
              disabled={sendReportMutation.isPending}
            >
              <MaterialIcons name="send" size={16} color="#ffffff" />
              <Text style={styles.actionBtnSolidText}>
                {sendReportMutation.isPending ? 'Enviando...' : 'Enviar e-mail'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Veículos do fechamento</Text>
          <Text style={styles.sectionSubtitle}>{recordsData?.total || 0} veículos</Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: BillingRecord }) => {
    const isExpanded = expandedRows[item.id];
    const totalRecordServices = item.services?.length || 0;
    const subtotal = item.services?.reduce((acc, s) => acc + (s.price * s.quantity), 0) || 0;
    const finalTotal = subtotal - item.vehicle_discount;

    return (
      <View style={styles.recordContainer}>
        <TouchableOpacity 
          style={styles.recordHeader} 
          onPress={() => toggleRow(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.recordHeaderLeft}>
            <MaterialIcons name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color="#64748b" />
            <View style={styles.recordVehicleInfo}>
              <Text style={styles.recordPlate}>{item.vehicle_plate}</Text>
              <Text style={styles.recordModel}>{item.vehicle_model} • {item.vehicle_color}</Text>
            </View>
          </View>
          
          <View style={styles.recordHeaderRight}>
            <Text style={styles.recordTotalLabel}>Subtotal</Text>
            <Text style={styles.recordTotalValue}>{formatCurrencyBRL(finalTotal / 100)}</Text>
            {item.vehicle_discount > 0 && (
              <Text style={styles.recordDiscount}>
                Desc: -{formatCurrencyBRL(item.vehicle_discount / 100)}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && item.services && item.services.length > 0 && (
          <View style={styles.servicesContainer}>
            {item.services.map((service, idx) => (
              <View key={service.id} style={[styles.serviceRow, idx === 0 && styles.serviceRowFirst]}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.service_name}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{service.category_name}</Text>
                  </View>
                </View>
                <View style={styles.servicePriceInfo}>
                  <Text style={styles.serviceQtd}>{service.quantity}x</Text>
                  <Text style={styles.serviceTotal}>
                    {formatCurrencyBRL((service.price * service.quantity) / 100)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Detalhes',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#0f172a',
        }}
      />
      
      {loadingRecords && page === 1 && !recordsData ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={recordsData?.data || []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="directions-car" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Nenhum veículo encontrado neste fechamento.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  breadcrumbText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPaid: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statusPending: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusPaidText: {
    color: '#059669',
  },
  statusPendingText: {
    color: '#ea580c',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 2,
  },
  pageDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  totalBox: {
    marginTop: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  totalBoxLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  totalBoxValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  actionsBox: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  actionBtnOutlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  actionBtnSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  actionBtnDisabled: {
    opacity: 0.7,
  },
  actionBtnSolidText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  recordContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  recordHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordVehicleInfo: {
    gap: 2,
  },
  recordPlate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  recordModel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  recordHeaderRight: {
    alignItems: 'flex-end',
  },
  recordTotalLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  recordTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  recordDiscount: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
    marginTop: 2,
  },
  servicesContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  serviceRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  serviceInfo: {
    flex: 1,
    paddingRight: 16,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#7e22ce',
    fontWeight: '600',
  },
  servicePriceInfo: {
    alignItems: 'flex-end',
  },
  serviceQtd: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
});
