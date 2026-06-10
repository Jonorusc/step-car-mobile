import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useVehicles } from '@/hooks/useVehicles';
import { useSession } from '@/hooks/useSession';
import { Theme } from '@/constants/theme';
import VehicleCard from '@/components/VehicleCard';

interface CompanyVehiclesSheetProps {
  visible: boolean;
  onClose: () => void;
  companyId: number | null;
  companyName: string | null;
}

export default function CompanyVehiclesSheet({ visible, onClose, companyId, companyName }: CompanyVehiclesSheetProps) {
  const { activeEstablishment } = useSession();
  
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useVehicles({
    establishmentId: activeEstablishment?.id,
    companyId: companyId,
    withCompany: 1, // Include company info
  });

  const vehicles = data?.pages.flatMap(page => page.data) || [];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Veículos</Text>
              <Text style={styles.sheetSub}>{companyName || 'Empresa'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={vehicles}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContainer}
              onRefresh={refetch}
              refreshing={isRefetching}
              renderItem={({ item }) => (
                <VehicleCard
                  vehicle={item}
                  onPrint={() => {}}
                  systemColor={Theme.colors.primary}
                />
              )}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="directions-car" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyText}>Nenhum veículo encontrado.</Text>
                </View>
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <ActivityIndicator size="small" color={Theme.colors.primary} style={{ marginVertical: 20 }} />
                ) : null
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  sheetSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
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
