import React, { useState, useCallback, useEffect } from 'react';
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
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { Theme } from '@/constants/theme';
import { useSession } from '@/hooks/useSession';
import { useUser } from '@/hooks/useAuth';
import { useCompanyList, useDeleteCompany, Company } from '@/hooks/useCompany';

import EditCompanyModal from '@/components/EditCompanyModal';
import LoadingLogo from '@/components/LoadingLogo';
import { useRouter } from 'expo-router';
import CompanyIndicators from '@/components/CompanyIndicators';
import CompanyVehiclesSheet from '@/components/CompanyVehiclesSheet';

export default function CompaniesScreen() {
  const { activeEstablishment } = useSession();
  const user = useUser();
  const isEmployee = user?.type_user?.toLowerCase() === 'employee';

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVehiclesSheet, setShowVehiclesSheet] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const router = useRouter();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching
  } = useCompanyList(activeEstablishment?.id || 0, debouncedSearch || null);

  const deleteMutation = useDeleteCompany();

  const companies = data?.pages.flatMap(page => page.data) || [];

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Excluir Empresa',
      `Tem certeza que deseja excluir a empresa "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(id, {
              onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              },
              onError: (err: any) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Erro', err.response?.data?.message || 'Erro ao excluir a empresa.');
              }
            });
          }
        }
      ]
    );
  };

  const renderRightActions = (item: Company) => {
    return (
      <View style={styles.swipeActionsContainer}>
        {!isEmployee && (
          <TouchableOpacity
            style={[styles.swipeActionBtn, { backgroundColor: Theme.colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCompany(item);
              setShowEditModal(true);
            }}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.swipeActionText}>Editar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.swipeActionBtn, { backgroundColor: '#3b82f6' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedCompany(item);
            setShowVehiclesSheet(true);
          }}
        >
          <MaterialIcons name="directions-car" size={20} color="#fff" />
          <Text style={styles.swipeActionText}>Veículos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.swipeActionBtn, { backgroundColor: '#6366f1' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/dashboard/companies/${item.id}/billings` as any);
          }}
        >
          <MaterialIcons name="request-quote" size={20} color="#fff" />
          <Text style={styles.swipeActionText} numberOfLines={1} adjustsFontSizeToFit>Fechamentos</Text>
        </TouchableOpacity>

        {!isEmployee && (
          <TouchableOpacity
            style={[styles.swipeActionBtn, { backgroundColor: '#ef4444' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleDelete(item.id, item.fantasy_name || item.company_name);
            }}
          >
            <MaterialIcons name="delete" size={20} color="#fff" />
            <Text style={styles.swipeActionText}>Excluir</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Company }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
      <View style={styles.cardContainer}>
        <View style={styles.cardContent}>
          <Text style={styles.companyName}>{item.fantasy_name || item.company_name}</Text>
          <Text style={styles.companyDoc}>CNPJ: {item.document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}</Text>
          <Text style={styles.companyEmail}>{item.email}</Text>
        </View>
        <MaterialIcons name="chevron-left" size={24} color="#cbd5e1" />
      </View>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Empresas Parceiras</Text>
        {!isEmployee && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCompany(null);
              setShowEditModal(true);
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar empresa por nome..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#94a3b8"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <MaterialIcons name="close" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {activeEstablishment?.id && (
        <CompanyIndicators establishmentId={activeEstablishment.id} />
      )}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Empresas cadastradas</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <LoadingLogo size={50} />
        </View>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="business" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Nenhuma empresa encontrada.</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : null
          }
        />
      )}

      {/* Edit/Create Modal */}
      <EditCompanyModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
      />

      {/* Vehicles Sheet */}
      <CompanyVehiclesSheet
        visible={showVehiclesSheet}
        onClose={() => setShowVehiclesSheet(false)}
        companyId={selectedCompany?.id || null}
        companyName={selectedCompany?.fantasy_name || selectedCompany?.company_name || null}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  listHeader: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  companyDoc: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  companyEmail: {
    fontSize: 13,
    color: '#64748b',
  },
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  swipeActionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
    paddingHorizontal: 2,
  },
  swipeActionText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
