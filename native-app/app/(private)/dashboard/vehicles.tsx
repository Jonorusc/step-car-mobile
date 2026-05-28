import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useSession } from '@/hooks/useSession';
import { useVehicles, Vehicle } from '@/hooks/useVehicles';
import useBLE from '@/hooks/useBLE';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import VehicleCard from '@/components/VehicleCard';

export default function VehiclesScreen() {
  const queryClient = useQueryClient();
  const { activeEstablishment } = useSession();
  const { data: vehicles, isLoading, error, refetch } = useVehicles(activeEstablishment?.id);
  const { print, isConnected } = useBLE();

  // Log API retrieval errors for developer inspection
  if (error) {
    console.error('[vehicles.tsx] useVehicles error:', error);
  }

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Deletion Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/user/vehicle/delete/${id}`);
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['vehicles', activeEstablishment?.id] });
      Alert.alert('Sucesso', 'Registro de veículo removido com sucesso!');
    },
    onError: (err: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = err.response?.data?.message || 'Erro ao remover veículo.';
      Alert.alert('Erro', message);
    }
  });

  const handleDeleteConfirm = (vehicle: Vehicle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Warning);
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

    try {
      const cupomData = {
        vehicleToCupom: {
          id: vehicle.id,
          plate: vehicle.plate,
          model: vehicle.model,
          color: vehicle.color,
          price: vehicle.price,
          price_formatted: vehicle.price_formatted,
          discount: vehicle.discount,
          created_at_formatted: vehicle.created_at_formatted,
          services: vehicle.services,
          company: vehicle.company,
        },
        collectCategoriesToModal: vehicle.services.map(s => s.name).join(', '),
        collectFormattedServicesToModal: vehicle.services,
        establishment: activeEstablishment!,
        discount: vehicle.discount,
      };

      await print(cupomData);
    } catch (err) {
      Alert.alert('Erro de Impressão', 'Não foi possível enviar o comando de impressão.');
    }
  };

  // Filter vehicles by license plate or model — O(N) linear scan
  const filteredVehicles = vehicles?.filter((vehicle) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      vehicle.plate.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query)
    );
  }) || [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header and Search */}
      <View style={styles.searchHeader}>
        <Text style={styles.title}>Histórico de Veículos</Text>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por placa ou modelo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7} style={styles.clearBtn}>
              <MaterialIcons name="cancel" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Card List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#0284c7']} />
        }
      >
        <View style={styles.list}>
          {error ? (
            <View style={styles.errorCard}>
              <MaterialIcons name="error-outline" size={44} color="#ef4444" style={{ marginBottom: 12 }} />
              <Text style={styles.errorTitle}>Erro ao carregar histórico</Text>
              <Text style={styles.errorDesc}>
                {error instanceof Error ? error.message : 'Verifique sua conexão ou tente novamente.'}
              </Text>
            </View>
          ) : filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPrint={handlePrintReceipt}
                onDelete={handleDeleteConfirm}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <MaterialIcons name="directions-car" size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>Nenhum veículo encontrado</Text>
              <Text style={styles.emptyDesc}>
                {searchQuery.trim()
                  ? 'Não encontramos nenhum veículo correspondente à sua busca.'
                  : 'Nenhum veículo registrado neste estabelecimento.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchHeader: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    height: '100%',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
  list: {
    width: '100%',
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
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
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
