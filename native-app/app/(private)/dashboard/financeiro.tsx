import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Theme } from '@/constants/theme';
import { useSession } from '@/hooks/useSession';
import { useDashboardMetrics, MonthlyData } from '@/hooks/useDashboard';

const formatCurrency = (value: number | string | undefined | null) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'R$ 0,00';
  return (num / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR');
};

const CustomBarChart = ({ data, title }: { data: MonthlyData[], title: string }) => {
  if (!data || data.length === 0) return null;

  // Find max value to scale the bars
  const maxPrice = Math.max(...data.map(d => parseFloat(d.total_price) || 0));

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.chartWrapper}>
        {data.map((item, index) => {
          const value = parseFloat(item.total_price) || 0;
          // Minimum width of 5% so even 0 values are visible slightly, max 100%
          const widthPercentage = maxPrice > 0 ? Math.max((value / maxPrice) * 100, 5) : 5;

          return (
            <View key={index} style={styles.barRow}>
              <View style={styles.barLabelContainer}>
                <Text style={styles.barLabelMonth}>{item.month}</Text>
                <Text style={styles.barLabelVehicles}>{item.total_vehicle} veíc.</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${widthPercentage}%` }]} />
                <Text style={styles.barValue}>{formatCurrency(value)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function FinanceiroScreen() {
  const { activeEstablishment } = useSession();

  // Date Range state (Default: last 30 days to today)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const { data, isLoading, refetch, isRefetching } = useDashboardMetrics({
    establishment_id: String(activeEstablishment?.id || ''),
    dateStart: startStr,
    dateEnd: endStr,
  });

  const [currentTab, setCurrentTab] = useState<'records' | 'companies'>('records');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Financeiro</Text>
        </View>

        {/* Date Filter */}
        <View style={styles.dateFilterContainer}>
          <View style={styles.dateRow}>
            <TouchableOpacity 
              style={styles.datePickerBtn} 
              onPress={() => setShowPicker('start')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="event" size={18} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>

            <Text style={styles.dateSeparator}>-</Text>

            <TouchableOpacity 
              style={styles.datePickerBtn} 
              onPress={() => setShowPicker('end')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="event" size={18} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showPicker && (
          <View style={styles.pickerWrapper}>
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
            {Platform.OS === 'ios' && (
              <TouchableOpacity 
                style={styles.iosPickerDoneBtn}
                onPress={() => setShowPicker(null)}
              >
                <Text style={styles.iosPickerDoneBtnText}>Confirmar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isLoading && !data ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          </View>
        ) : data ? (
          <View style={styles.metricsContainer}>
            
            {/* Total de Registros */}
            <View style={styles.metricCardFull}>
              <Text style={styles.metricLabel}>Total de Registros</Text>
              <Text style={styles.metricValueLarge}>{data.total_vehicles}</Text>
            </View>

            {/* Veículos */}
            <View style={styles.metricRow}>
              <View style={styles.metricCardHalf}>
                <Text style={styles.metricLabel}>Veículos Registrados</Text>
                <Text style={styles.metricValue}>{data.vehicle.total_vehicles}</Text>
              </View>
              <View style={styles.metricCardHalf}>
                <Text style={styles.metricLabel}>Veículos de Empresas</Text>
                <Text style={styles.metricValue}>{data.company.total_vehicles}</Text>
              </View>
            </View>

            {/* Faturamento Segmentado */}
            <View style={styles.metricRow}>
              <View style={styles.metricCardHalf}>
                <Text style={styles.metricLabel}>Faturamento Avulso</Text>
                <Text style={styles.metricValue}>{formatCurrency(data.vehicle.total_vehicles_invoiced)}</Text>
              </View>
              <View style={styles.metricCardHalf}>
                <Text style={styles.metricLabel}>Faturamento Empresas</Text>
                <Text style={styles.metricValue}>{formatCurrency(data.company.total_vehicles_invoiced)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Faturamento Total */}
            <View style={styles.metricRow}>
              <View style={styles.metricCardHalf}>
                <Text style={styles.metricLabel}>Faturamento Bruto</Text>
                <Text style={styles.metricValue}>{formatCurrency(data.total_invoice)}</Text>
              </View>
              <View style={styles.metricCardHalf}>
                <Text style={styles.metricLabel}>Faturamento Líquido</Text>
                <Text style={styles.metricValue}>{formatCurrency(data.total_net)}</Text>
              </View>
            </View>

            {/* Descontos */}
            <View style={styles.metricCardFull}>
              <Text style={styles.metricLabel}>Total em Descontos</Text>
              <Text style={[styles.metricValueLarge, { color: '#ef4444' }]}>
                - {formatCurrency(data.total_discount)}
              </Text>
            </View>

            {/* Charts Section */}
            <View style={styles.chartsSection}>
              <Text style={styles.sectionTitle}>Veículos e Faturamento</Text>
              
              {/* Tabs */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity 
                  style={[styles.tabBtn, currentTab === 'records' && styles.tabBtnActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCurrentTab('records');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, currentTab === 'records' && styles.tabTextActive]}>Avulsos</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tabBtn, currentTab === 'companies' && styles.tabBtnActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCurrentTab('companies');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, currentTab === 'companies' && styles.tabTextActive]}>Empresas</Text>
                </TouchableOpacity>
              </View>

              <CustomBarChart 
                data={currentTab === 'records' ? data.vehicle.monthly_stats : data.company.monthly_stats}
                title={currentTab === 'records' ? 'Faturamento Mensal - Avulsos' : 'Faturamento Mensal - Empresas'}
              />

            </View>

          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="error-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Não foi possível carregar os dados financeiros.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  dateFilterContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateSeparator: {
    marginHorizontal: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  pickerWrapper: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iosPickerDoneBtn: {
    marginTop: 12,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  iosPickerDoneBtnText: {
    color: Theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  centerContainer: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsContainer: {
    paddingHorizontal: 24,
  },
  metricCardFull: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCardHalf: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  metricCardHalfFirst: {
    marginRight: 6,
  },
  metricCardHalfSecond: {
    marginLeft: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricValueLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 12,
  },
  chartsSection: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#0f172a',
  },
  chartContainer: {
    marginTop: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 16,
  },
  chartWrapper: {
    gap: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabelContainer: {
    width: 60,
  },
  barLabelMonth: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  barLabelVehicles: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  barTrack: {
    flex: 1,
    height: 28,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible', // allow text to overflow if small
  },
  barFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 6,
  },
  barValue: {
    position: 'absolute',
    left: 8,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
});
