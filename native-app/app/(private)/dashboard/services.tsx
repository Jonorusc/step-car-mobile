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
  Modal,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useSession } from '@/hooks/useSession';
import { useRBAC } from '@/hooks/useRBAC';
import { useServiceList, useDeleteService, Service } from '@/hooks/useService';
import { useCategoryList } from '@/hooks/useCategory';
import { Theme } from '@/constants/theme';
import { useCoinsFormatted } from '@/utils/currency';
import EditServiceModal from '@/components/EditServiceModal';
import LoadingLogo from '@/components/LoadingLogo';
import { useLocalSearchParams } from 'expo-router';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ServicesScreen() {
  const { activeEstablishment } = useSession();
  const { canCreateService, canEditService, canDeleteService } = useRBAC();
  const systemColor = Theme.colors.primary;
  const { categoryId } = useLocalSearchParams();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [showEditModal, setShowEditModal] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    if (categoryId) {
      const parsed = parseInt(categoryId as string, 10);
      if (!isNaN(parsed) && !selectedCategoryIds.includes(parsed)) {
        setSelectedCategoryIds([parsed]);
      }
    }
  }, [categoryId]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState('');

  const { data: categoryData } = useCategoryList(activeEstablishment?.id ?? 0, null);
  const categories = categoryData?.pages.flatMap((p) => p.data) || [];

  const toggleCategory = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
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
  } = useServiceList(activeEstablishment?.id ?? 0, selectedCategoryIds, debouncedSearch || null);

  const services = data?.pages.flatMap(page => page.data) || [];
  const deleteMutation = useDeleteService();

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
  }, [refetch]);

  const handleDeleteConfirm = (service: Service) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remover Serviço',
      `Tem certeza que deseja excluir o serviço ${service.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(service.id, {
              onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Sucesso', 'Serviço removido com sucesso!');
              },
              onError: (err: any) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Erro', err.response?.data?.message || 'Erro ao remover serviço.');
              }
            });
          },
        },
      ]
    );
  };

  const handleEdit = (service: Service) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setServiceToEdit(service);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setServiceToEdit(null);
    setShowEditModal(true);
  };

  const formatMoney = (amount: number) => {
    return useCoinsFormatted(amount);
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyCard}>
          <LoadingLogo size={50} />
          <Text style={styles.emptyTitle}>Carregando serviços...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorCard}>
          <MaterialIcons name="error-outline" size={44} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={styles.errorTitle}>Erro ao carregar serviços</Text>
          <Text style={styles.errorDesc}>
            {error instanceof Error ? error.message : 'Verifique sua conexão ou tente novamente.'}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyCard}>
        <MaterialIcons name="build" size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
        <Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text>
        <Text style={styles.emptyDesc}>
          Não encontramos nenhum serviço com os filtros atuais.
        </Text>
      </View>
    );
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearchText.toLowerCase())
  );

  const renderItem = ({ item }: { item: Service }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconContainer}>
             <MaterialIcons name="build" size={20} color={systemColor} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.priceBadge}>{formatMoney(item.price)}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText} numberOfLines={1}>{item.nameCategory}</Text>
            </View>
            {item.description ? (
              <Text style={styles.cardSubtitle} numberOfLines={2}>{item.description}</Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        {canEditService && (
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleEdit(item)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="edit" size={16} color="#475569" />
            <Text style={styles.actionBtnText}>Editar</Text>
          </TouchableOpacity>
        )}

        {canDeleteService && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={() => handleDeleteConfirm(item)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete" size={16} color="#ef4444" />
            <Text style={styles.actionBtnDangerText}>Excluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Serviços</Text>
        
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar serviços..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94a3b8"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 8 }}>
                <MaterialIcons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
            <View style={styles.searchDivider} />
            <TouchableOpacity 
              onPress={() => setShowFilterModal(true)} 
              style={styles.filterBtnIcon}
            >
              <MaterialIcons 
                name="filter-list" 
                size={22} 
                color={selectedCategoryIds.length > 0 ? Theme.colors.primary : "#94a3b8"} 
              />
              {selectedCategoryIds.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{selectedCategoryIds.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {canCreateService && (
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
              <MaterialIcons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} colors={[systemColor]} />
        }
        renderItem={renderItem}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={systemColor} style={{ margin: 20 }} /> : null}
      />

      <EditServiceModal 
        visible={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setServiceToEdit(null);
        }} 
        onSuccess={() => {
          setShowEditModal(false);
          setServiceToEdit(null);
        }}
        service={serviceToEdit}
      />

      {/* Filter Modal */}
      <Modal 
        visible={showFilterModal} 
        animationType="slide" 
        transparent={true} 
        onRequestClose={() => {
          setShowFilterModal(false);
          setCategorySearchText('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.sheetContainer, { maxHeight: '80%' }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Filtrar por Categoria</Text>
                <Text style={styles.sheetSub}>Selecione uma ou mais categorias</Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setShowFilterModal(false);
                  setCategorySearchText('');
                }} 
                style={styles.closeBtn} 
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <MaterialIcons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Buscar categorias..."
                value={categorySearchText}
                onChangeText={setCategorySearchText}
                placeholderTextColor="#94a3b8"
              />
              {categorySearchText.length > 0 && (
                <TouchableOpacity onPress={() => setCategorySearchText('')}>
                  <MaterialIcons name="close" size={20} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredCategories}
              keyExtractor={c => String(c.id)}
              contentContainerStyle={{ padding: 24 }}
              renderItem={({ item }) => {
                const isSelected = selectedCategoryIds.includes(item.id);
                return (
                  <TouchableOpacity
                    style={styles.filterRow}
                    onPress={() => toggleCategory(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterRowText, isSelected && { color: Theme.colors.primary, fontWeight: '700' }]}>
                      {item.name}
                    </Text>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <MaterialIcons name="check" size={14} color="#ffffff" />}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyDesc}>Nenhuma categoria disponível.</Text>
              }
            />

            <View style={styles.filterFooter}>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => setSelectedCategoryIds([])}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>Limpar Tudo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setShowFilterModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.applyBtnText}>Ver Resultados</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  filterBtnIcon: {
    padding: 6,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
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
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 24,
    marginTop: 16,
    height: 44,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterRowText: {
    fontSize: 15,
    color: '#334155',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    justifyContent: 'space-between',
  },
  clearBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 14,
  },
  applyBtn: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 8,
  },
  priceBadge: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10b981',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    paddingRight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 6,
  },
  actionBtnDanger: {
    backgroundColor: '#fef2f2',
  },
  actionBtnDangerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 6,
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
