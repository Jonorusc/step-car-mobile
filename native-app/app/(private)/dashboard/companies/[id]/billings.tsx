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
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/theme';
import {
  useBillingIndicators,
  useListBillings,
  useUpdateBillingStatus,
  useDeleteBilling,
  Billing,
} from '@/hooks/useBillings';
import { formatCurrencyBRL } from '@/utils/formatters';

export default function CompanyBillingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const companyId = Number(id);
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: indicators, isLoading: loadingIndicators } = useBillingIndicators(companyId);
  const { data: billingsData, isLoading: loadingBillings, refetch } = useListBillings({
    companyId,
    page,
    limit_per_page: 20,
    status: statusFilter || undefined,
  });

  const updateStatusMutation = useUpdateBillingStatus(companyId);
  const deleteMutation = useDeleteBilling(companyId);

  const billings = billingsData?.data || [];

  const handleToggleStatus = (billing: Billing) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newStatus = billing.status === 'PENDING' ? 'PAYMENTED' : 'PENDING';
    updateStatusMutation.mutate({ closingId: billing.id, status: newStatus }, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: (err: any) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erro', err.response?.data?.message || 'Erro ao atualizar status.');
      }
    });
  };

  const handleDelete = (closingId: number) => {
    Alert.alert(
      'Excluir Fechamento',
      'Tem certeza que deseja excluir este fechamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(closingId, {
              onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              },
              onError: (err: any) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Erro', err.response?.data?.message || 'Erro ao excluir fechamento.');
              }
            });
          }
        }
      ]
    );
  };

  const renderIndicator = (title: string, value: string, subValue: string, icon: keyof typeof MaterialIcons.glyphMap, color: string) => (
    <View style={styles.indicatorCard}>
      <View style={styles.indicatorHeader}>
        <MaterialIcons name={icon} size={16} color={color} />
        <Text style={styles.indicatorTitle}>{title}</Text>
      </View>
      <Text style={[styles.indicatorValue, { color }]}>{value}</Text>
      <Text style={styles.indicatorSub}>{subValue}</Text>
    </View>
  );

  const renderHeader = () => (
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
        <Text style={styles.breadcrumbText}>Voltar para Empresas</Text>
      </TouchableOpacity>
      
      <Text style={styles.pageTitle}>Fechamentos</Text>
      <Text style={styles.pageSubtitle}>Gerencie os faturamentos da empresa</Text>

      {loadingIndicators ? (
        <ActivityIndicator size="small" color={Theme.colors.primary} style={{ marginTop: 20 }} />
      ) : indicators ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.indicatorsScroll}>
          {renderIndicator(
            'TOTAL',
            String(indicators.total_closures_year),
            'Acumulado no ano',
            'file-copy',
            '#3b82f6'
          )}
          {renderIndicator(
            'VALOR TOTAL',
            formatCurrencyBRL(indicators.total_amount / 100),
            'Somatório geral',
            'attach-money',
            '#0f172a'
          )}
          {renderIndicator(
            'PAGOS',
            String(indicators.total_paid_closures),
            `${formatCurrencyBRL(indicators.total_paid_amount / 100)} quitados`,
            'check-circle',
            '#10b981'
          )}
          {renderIndicator(
            'PENDENTES',
            String(indicators.total_pending_closures),
            `${formatCurrencyBRL(indicators.total_pending_amount / 100)} em aberto`,
            'pending-actions',
            '#f59e0b'
          )}
        </ScrollView>
      ) : null}

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Histórico</Text>
        <View style={styles.filterTabs}>
          {['', 'PAYMENTED', 'PENDING'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterTab, statusFilter === status && styles.filterTabActive]}
              onPress={() => {
                setStatusFilter(status);
                setPage(1);
              }}
            >
              <Text style={[styles.filterTabText, statusFilter === status && styles.filterTabTextActive]}>
                {status === '' ? 'Todos' : status === 'PAYMENTED' ? 'Pagos' : 'Pendentes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Billing }) => {
    const isPaid = item.status === 'PAYMENTED';
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardDates} numberOfLines={1} adjustsFontSizeToFit>
              {item.date_start.split('-').reverse().join('/')} - {item.date_end.split('-').reverse().join('/')}
            </Text>
            <Text style={styles.cardDesc} numberOfLines={1}>{item.description || 'Mensal'}</Text>
          </View>
          <TouchableOpacity
            style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusPending]}
            onPress={() => handleToggleStatus(item)}
            activeOpacity={0.8}
          >
            <Text style={[styles.statusText, isPaid ? styles.statusPaidText : styles.statusPendingText]}>
              {isPaid ? 'Pago' : 'Pendente'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardStats}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Veículos</Text>
            <Text style={styles.statVal}>{item.total_vehicles || 0}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Serviços</Text>
            <Text style={styles.statVal}>{item.total_services || 0}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Valor Total</Text>
            <Text style={styles.statValPrice}>{formatCurrencyBRL(item.invoiced_amount / 100)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDateText}>
            Gerado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
          </Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push(`/dashboard/companies/${companyId}/billings/${item.id}` as any)}
            >
              <MaterialIcons name="description" size={20} color="#64748b" />
            </TouchableOpacity>
            {item.document_url && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Linking.openURL(item.document_url)}
              >
                <MaterialIcons name="file-download" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete(item.id)}
            >
              <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Fechamentos',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#0f172a',
        }}
      />
      
      {loadingBillings && page === 1 && !billingsData ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={billings}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt-long" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Nenhum fechamento encontrado.</Text>
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
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  indicatorsScroll: {
    marginTop: 20,
    gap: 12,
    paddingBottom: 8,
  },
  indicatorCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    width: 160,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicatorTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  indicatorValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  indicatorSub: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  filterContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#0f172a',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardDates: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
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
    fontSize: 11,
    fontWeight: '700',
  },
  statusPendingText: {
    color: '#ea580c',
    fontSize: 11,
    fontWeight: '700',
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  statValPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  cardDateText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
});
