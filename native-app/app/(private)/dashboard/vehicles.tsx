import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
  FlatList,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useSession } from '@/hooks/useSession';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import VehicleCard from '@/components/VehicleCard';
import EditVehicleWizard from '@/components/EditVehicleWizard';
import VehicleDetailsModal from '@/components/VehicleDetailsModal';
import LoadingLogo from '@/components/LoadingLogo';
import { Theme } from '@/constants/theme';
import { useCouponBuilder } from '@/hooks/useCouponBuilder';
import useBLE from '@/hooks/useBLE';
import { useVehicles, Vehicle } from '@/hooks/useVehicles';
import { useUser } from '@/hooks/useAuth';

export default function VehiclesScreen() {
  const queryClient = useQueryClient();
  const { activeEstablishment } = useSession();
  const user = useUser();
  const isEmployee = user?.type_user?.toLowerCase() === 'employee';
  const { print, isConnected } = useBLE();
  const { buildCouponData } = useCouponBuilder();
  const systemColor = Theme.colors.primary;

  // Filters State
  const [currentTab, setCurrentTab] = useState<'records' | 'companies'>('records');
  const [showFilters, setShowFilters] = useState(false);
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [priceNum, setPriceNum] = useState<number | undefined>(undefined);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  // Edit Vehicle State
  const [editWizardVisible, setEditWizardVisible] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);

  // View Details State
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsVehicleId, setDetailsVehicleId] = useState<number | null>(null);

  // Printing State
  const [printingId, setPrintingId] = useState<number | null>(null);

  // Queries
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('/user/company/list');
      const payload = res.data?.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.data)) return payload.data;
      if (res.data && Array.isArray(res.data.data)) return res.data.data;
      return [];
    },
    enabled: currentTab === 'companies',
  });

  const getApiDate = () => {
    if (filterDate) {
      const d = String(filterDate.getDate()).padStart(2, '0');
      const m = String(filterDate.getMonth() + 1).padStart(2, '0');
      const y = filterDate.getFullYear();
      return `${y}-${m}-${d}`;
    }
    return undefined;
  };

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching
  } = useVehicles({
    establishmentId: activeEstablishment?.id,
    withCompany: currentTab === 'companies' ? 1 : 0,
    companyId: currentTab === 'companies' ? selectedCompanyId : null,
    model: model || undefined,
    plate: plate || undefined,
    price: priceNum || undefined,
    date: getApiDate(),
  });

  const vehicles = data?.pages.flatMap(page => page.data) || [];

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
  }, [refetch]);

  // Deletion Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/user/vehicle/delete/${id}`);
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      Alert.alert('Sucesso', 'Registro de veículo removido com sucesso!');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = err.response?.data?.message || 'Erro ao remover veículo.';
      Alert.alert('Erro', message);
    }
  });

  const handleDeleteConfirm = (vehicle: Vehicle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remover Registro',
      `Tem certeza que deseja excluir o registro do veículo ${vehicle.model} (${vehicle.plate})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(vehicle.id),
        },
      ]
    );
  };

  const handlePrintReceipt = async (vehicle: Vehicle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isConnected) {
      Alert.alert('Impressora desconectada', 'Por favor, conecte a impressora Bluetooth nas configurações do dashboard.');
      return;
    }
    setPrintingId(vehicle.id);
    try {
      const cupomData = await buildCouponData(vehicle.id);
      if (!cupomData) throw new Error('Falha ao gerar dados do cupom');
      await print(cupomData);
    } catch (err) {
      Alert.alert('Erro de Impressão', 'Não foi possível enviar o comando de impressão.');
    } finally {
      setPrintingId(null);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingVehicleId(vehicle.id);
    setEditWizardVisible(true);
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetailsVehicleId(vehicle.id);
    setDetailsModalVisible(true);
  };

  // Masking
  const handlePriceChange = (text: string) => {
    const cleanNum = text.replace(/[^0-9]/g, '');
    if (!cleanNum) {
      setPriceStr('');
      setPriceNum(undefined);
      return;
    }
    const cents = parseInt(cleanNum, 10);
    setPriceNum(cents / 100);
    setPriceStr(`R$ ${(cents / 100).toFixed(2).replace('.', ',')}`);
  };

  const handleClearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModel('');
    setPlate('');
    setPriceStr('');
    setPriceNum(undefined);
    setFilterDate(undefined);
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyCard}>
          <LoadingLogo size={50} />
          <Text style={styles.emptyTitle}>Carregando veículos...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorCard}>
          <MaterialIcons name="error-outline" size={44} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={styles.errorTitle}>Erro ao carregar histórico</Text>
          <Text style={styles.errorDesc}>
            {error instanceof Error ? error.message : 'Verifique sua conexão ou tente novamente.'}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyCard}>
        <MaterialIcons name="directions-car" size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
        <Text style={styles.emptyTitle}>Nenhum veículo encontrado</Text>
        <Text style={styles.emptyDesc}>
          Não encontramos nenhum veículo com os filtros atuais.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Veículos</Text>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'records' && styles.tabActive]}
            onPress={() => { setCurrentTab('records'); setSelectedCompanyId(null); }}
          >
            <Text style={[styles.tabText, currentTab === 'records' && styles.tabTextActive]}>Todos os Registros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'companies' && styles.tabActive]}
            onPress={() => setCurrentTab('companies')}
          >
            <Text style={[styles.tabText, currentTab === 'companies' && styles.tabTextActive]}>Por Empresa</Text>
          </TouchableOpacity>
        </View>

        {/* Company Selection */}
        {currentTab === 'companies' && (
          <View style={styles.companiesWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.companiesScroll}>
              <TouchableOpacity
                style={[styles.companyChip, selectedCompanyId === null && styles.companyChipActive]}
                onPress={() => setSelectedCompanyId(null)}
              >
                <Text style={[styles.companyChipText, selectedCompanyId === null && styles.companyChipTextActive]}>Todas</Text>
              </TouchableOpacity>
              {companies.map((c: any) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.companyChip, selectedCompanyId === c.id && styles.companyChipActive]}
                  onPress={() => setSelectedCompanyId(c.id)}
                >
                  <Text style={[styles.companyChipText, selectedCompanyId === c.id && styles.companyChipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filters Toggle */}
        <View style={styles.filtersHeader}>
          <TouchableOpacity style={styles.filterToggleBtn} onPress={() => setShowFilters(!showFilters)}>
            <MaterialIcons name="filter-alt" size={20} color="#0f172a" />
            <Text style={styles.filterToggleText}>{showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}</Text>
          </TouchableOpacity>
        </View>

        {/* Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <TextInput placeholder="Modelo" value={model} onChangeText={setModel} style={styles.filterInput} placeholderTextColor="#94a3b8" />
            <TextInput placeholder="Placa" value={plate} onChangeText={setPlate} style={styles.filterInput} autoCapitalize="characters" placeholderTextColor="#94a3b8" />
            <TextInput placeholder="Preço" value={priceStr} onChangeText={handlePriceChange} style={styles.filterInput} keyboardType="numeric" placeholderTextColor="#94a3b8" />

            <TouchableOpacity
              style={[styles.filterInput, { justifyContent: 'center' }]}
              onPress={() => setShowDatePicker(!showDatePicker)}
            >
              <Text style={{ color: filterDate ? '#0f172a' : '#94a3b8' }}>
                {filterDate ? filterDate.toLocaleDateString('pt-BR') : 'Data'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={filterDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (selectedDate) setFilterDate(selectedDate);
                  if (Platform.OS === 'android') setShowDatePicker(false);
                }}
              />
            )}

            <TouchableOpacity style={styles.clearFiltersBtn} onPress={handleClearFilters}>
              <MaterialIcons name="close" size={16} color="#ef4444" />
              <Text style={styles.clearFiltersBtnText}>Limpar Filtros</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main List */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} colors={[systemColor]} />
        }
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPrint={handlePrintReceipt}
            onDelete={isEmployee ? undefined : handleDeleteConfirm}
            onEdit={isEmployee ? undefined : handleEdit}
            onViewDetails={handleViewDetails}
            isPrinting={printingId === item.id}
            systemColor={systemColor}
          />
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={systemColor} style={{ margin: 20 }} /> : null}
      />

      <EditVehicleWizard
        visible={editWizardVisible}
        onClose={() => setEditWizardVisible(false)}
        onSuccess={() => {
          setEditWizardVisible(false);
          refetch();
        }}
        vehicleId={editingVehicleId}
      />

      <VehicleDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        vehicleId={detailsVehicleId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#0f172a',
  },
  companiesWrapper: {
    marginBottom: 16,
  },
  companiesScroll: {
    gap: 8,
  },
  companyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  companyChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  companyChipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  companyChipTextActive: {
    color: '#ffffff',
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 6,
  },
  filtersPanel: {
    marginTop: 12,
    gap: 8,
  },
  filterInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
    color: '#0f172a',
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginTop: 4,
  },
  clearFiltersBtnText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  closePickerBtnText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 6,
  },
  errorDesc: {
    fontSize: 13,
    color: '#b91c1c',
    textAlign: 'center',
    lineHeight: 18,
  },
});
