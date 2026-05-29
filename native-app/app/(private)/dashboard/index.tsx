import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import { useSession } from '@/hooks/useSession';
import useBLE from '@/hooks/useBLE';
import { useCouponBuilder } from '@/hooks/useCouponBuilder';
import RegistroWizard from '@/components/RegistroWizard';
import EditVehicleWizard from '@/components/EditVehicleWizard';
import VehicleDetailsModal from '@/components/VehicleDetailsModal';
import VehicleCard from '@/components/VehicleCard';
import { Theme } from '@/constants/theme';


// ============================================================================
// 1. BUSINESS LOGIC & FETCH SEPARATION (SOLID Principles)
// ============================================================================

/**
 * Hook customizado responsável apenas pelo fetch dos 5 últimos veículos.
 * Isola a lógica de request e tratamento de dados da UI.
 */
const useRecentVehicles = (establishmentId?: number) => {
  return useQuery({
    queryKey: ['recent_vehicles', establishmentId],
    queryFn: async () => {
      if (!establishmentId) return [];

      const response = await api.get('/user/vehicle/list', {
        params: {
          establishmentId,
          limitPerPage: 5,
          page: 1,
        }
      });

      // Tratamento robusto para a resposta paginada do Laravel
      const payload = response.data?.data;
      let vehicles = [];
      if (Array.isArray(payload)) {
        vehicles = payload;
      } else if (payload && Array.isArray(payload.data)) {
        vehicles = payload.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        vehicles = response.data.data;
      }

      // Filtra os 5 mais recentes estritamente conforme a regra de negócio
      return vehicles.slice(0, 5);
    },
    enabled: !!establishmentId,
    staleTime: 1000 * 60 * 2, // Cache de 2 minutos
  });
};

// ============================================================================
// 2. NATIVE MOBILE COMPONENTS (Cards)
// ============================================================================

// Component removed: moved to @/components/VehicleCard

// ============================================================================
// 3. MAIN DASHBOARD SCREEN
// ============================================================================

export default function RegistroDashboard() {
  const queryClient = useQueryClient();
  const { activeEstablishment } = useSession();
  const { print, isConnected } = useBLE();
  const { buildCouponData } = useCouponBuilder();

  const systemColor = Theme.colors.primary;

  const [wizardVisible, setWizardVisible] = useState(false);
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [editWizardVisible, setEditWizardVisible] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsVehicleId, setDetailsVehicleId] = useState<number | null>(null);

  // Busca isolada (apenas 5 itens, trigger on load)
  const { data: vehicles, isLoading, error, refetch } = useRecentVehicles(activeEstablishment?.id);

  // Mutation de exclusão
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/user/vehicle/delete/${id}`);
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['recent_vehicles', activeEstablishment?.id] });
      refetch();
      Alert.alert('Sucesso', 'Registro de veículo removido com sucesso!');
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Erro ao remover veículo.');
    }
  });

  const handlePrint = async (vehicle: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isConnected) {
      Alert.alert('Aviso', 'Conecte a impressora Bluetooth nas opções do dashboard primeiro.');
      return;
    }

    setPrintingId(vehicle.id);
    try {
      const cupomData = await buildCouponData(vehicle.id);
      if (!cupomData) throw new Error('Falha ao gerar dados do cupom');
      await print(cupomData);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível imprimir o cupom.');
    } finally {
      setPrintingId(null);
    }
  };

  const handleDelete = (vehicle: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Atenção',
      `Deseja realmente excluir o veículo ${vehicle.plate}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteMutation.mutate(vehicle.id) }
      ]
    );
  };

  const handleEdit = (vehicle: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingVehicleId(vehicle.id);
    setEditWizardVisible(true);
  };

  const handleViewDetails = (vehicle: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetailsVehicleId(vehicle.id);
    setDetailsModalVisible(true);
  };

  const handleWizardSuccess = async (createdVehicle: any) => {
    setWizardVisible(false);
    refetch(); // Atualiza a lista com o item recém-criado

    if (isConnected) {
      try {
        const cupomData = await buildCouponData(createdVehicle.id);
        if (cupomData) await print(cupomData);
      } catch (err) {
        Alert.alert('Aviso', 'Veículo salvo, mas ocorreu um erro ao imprimir.');
      }
    } else {
      Alert.alert('Sucesso', 'Veículo registrado! Conecte a impressora para emitir cupom.');
    }
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listTitle}>Últimos Registros</Text>
      <Text style={styles.listSubtitle}>Exibindo os 5 veículos mais recentes</Text>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={systemColor} />
          <Text style={styles.emptyText}>Buscando veículos na base...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.emptyText}>Erro ao conectar com a API.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="directions-car" size={48} color="#CBD5E1" />
        <Text style={styles.emptyText}>Nenhum veículo registrado recentemente.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Botão Flutuante Superior de Ação Principal */}
      <View style={styles.topSection}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: systemColor, shadowColor: systemColor }]} onPress={() => setWizardVisible(true)} activeOpacity={0.8}>
          <MaterialIcons name="add" size={24} color="#FFF" />
          <Text style={styles.fabText}>NOVO REGISTRO</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.flatlistContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPrint={handlePrint}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
            isPrinting={printingId === item.id}
            systemColor={systemColor}
          />
        )}
      />

      <RegistroWizard
        visible={wizardVisible}
        onClose={() => setWizardVisible(false)}
        onSuccess={handleWizardSuccess}
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

// ============================================================================
// 4. ESTILIZAÇÃO MÓVEL (100% NATIVA)
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  topSection: {
    padding: 16,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    zIndex: 10
  },
  fab: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  fabText: {
    color: '#FFF',
    fontWeight: '800',
    marginLeft: 8,
    fontSize: 16,
    letterSpacing: 0.5
  },
  flatlistContent: {
    padding: 16,
    paddingBottom: 100
  },
  listHeader: {
    marginBottom: 20
  },
  listTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A'
  },
  listSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 10
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryText: {
    color: '#334155',
    fontWeight: '700'
  },

  // Styles for VehicleCard removed and moved to the component file
});
