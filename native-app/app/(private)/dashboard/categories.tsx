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
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useSession } from '@/hooks/useSession';
import { useCategoryList, useDeleteCategory, Category } from '@/hooks/useCategory';
import { Theme } from '@/constants/theme';
import EditCategoryModal from '@/components/EditCategoryModal';

// Simple useDebounce inline
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function CategoriesScreen() {
  const { activeEstablishment } = useSession();
  const systemColor = Theme.colors.primary;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching
  } = useCategoryList(activeEstablishment?.id ?? 0, debouncedSearch || null);

  const categories = data?.pages.flatMap(page => page.data) || [];
  const deleteMutation = useDeleteCategory();

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
  }, [refetch]);

  const handleDeleteConfirm = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Remover Categoria',
      `Tem certeza que deseja excluir a categoria ${category.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(category.id, {
              onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Sucesso', 'Categoria removida com sucesso!');
              },
              onError: (err: any) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Erro', err.response?.data?.message || 'Erro ao remover categoria.');
              }
            });
          },
        },
      ]
    );
  };

  const handleEdit = (category: Category) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategoryToEdit(category);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategoryToEdit(null);
    setShowEditModal(true);
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyCard}>
          <ActivityIndicator size="large" color={systemColor} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Carregando categorias...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorCard}>
          <MaterialIcons name="error-outline" size={44} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={styles.errorTitle}>Erro ao carregar categorias</Text>
          <Text style={styles.errorDesc}>
            {error instanceof Error ? error.message : 'Verifique sua conexão ou tente novamente.'}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyCard}>
        <MaterialIcons name="category" size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
        <Text style={styles.emptyTitle}>Nenhuma categoria encontrada</Text>
        <Text style={styles.emptyDesc}>
          Não encontramos nenhuma categoria com os filtros atuais.
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconContainer}>
             <MaterialIcons name="category" size={20} color={systemColor} />
          </View>
          <View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.cardSubtitle} numberOfLines={2}>{item.description}</Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleEdit(item)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="edit" size={16} color="#475569" />
          <Text style={styles.actionBtnText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={() => handleDeleteConfirm(item)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete" size={16} color="#ef4444" />
          <Text style={styles.actionBtnDangerText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Categorias</Text>
        
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar categorias..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94a3b8"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialIcons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
            <MaterialIcons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List */}
      <FlatList
        data={categories}
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

      <EditCategoryModal 
        visible={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setCategoryToEdit(null);
        }} 
        onSuccess={() => {
          setShowEditModal(false);
          setCategoryToEdit(null);
        }}
        category={categoryToEdit}
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
    marginBottom: 16,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
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
