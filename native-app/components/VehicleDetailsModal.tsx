import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';
import { Theme } from '@/constants/theme';
import { formatCurrencyBRL, formatPlateDisplay } from '@/utils/formatters';

interface VehicleDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  vehicleId: number | null;
}

export default function VehicleDetailsModal({ visible, onClose, vehicleId }: VehicleDetailsModalProps) {
  const { data: fullVehicle, isLoading } = useQuery({
    queryKey: ['fullVehicleDetails', vehicleId],
    queryFn: async () => {
      const res = await api.get(`/user/vehicle/show/full/${vehicleId}`);
      return res.data?.data;
    },
    enabled: visible && !!vehicleId,
  });

  const getSubtotal = () => {
    if (!fullVehicle?.services) return 0;
    return fullVehicle.services.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Detalhes do Veículo</Text>
              <Text style={styles.sheetSub}>Resumo dos serviços e categorias</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color="#475569" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
              <Text style={styles.loadingText}>Carregando informações...</Text>
            </View>
          ) : fullVehicle ? (
            <ScrollView style={styles.viewport} contentContainerStyle={styles.viewportContent}>
              <View style={styles.invoiceCard}>
                <View style={styles.invoicePlate}>
                  <View style={styles.invoicePlateHeader}>
                    <Text style={styles.invoicePlateHeaderText}>BRASIL</Text>
                  </View>
                  <Text style={styles.invoicePlateVal}>{formatPlateDisplay(fullVehicle.vehicle.plate || '')}</Text>
                </View>

                <View style={styles.invoiceMeta}>
                  <View style={styles.invoiceMetaRow}>
                    <Text style={styles.invoiceMetaLabel}>Modelo:</Text>
                    <Text style={styles.invoiceMetaVal}>{fullVehicle.vehicle.model}</Text>
                  </View>
                  <View style={styles.invoiceMetaRow}>
                    <Text style={styles.invoiceMetaLabel}>Cor:</Text>
                    <Text style={styles.invoiceMetaVal}>{fullVehicle.vehicle.color}</Text>
                  </View>
                  {fullVehicle.company && (
                    <View style={styles.invoiceMetaRow}>
                      <Text style={styles.invoiceMetaLabel}>Convênio:</Text>
                      <Text style={styles.invoiceMetaVal}>{fullVehicle.company.name}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.invoiceServices}>
                  <Text style={styles.invoiceSectionTitle}>Serviços Contratados</Text>
                  {fullVehicle.services && fullVehicle.services.map((svc: any) => (
                    <View key={svc.service_id} style={styles.invoiceSvcRow}>
                      <View style={styles.svcDetails}>
                        <Text style={styles.invoiceSvcName}>• {svc.name} {svc.quantity > 1 ? `(x${svc.quantity})` : ''}</Text>
                        <Text style={styles.invoiceSvcCat}>{svc.category_name}</Text>
                      </View>
                      <Text style={styles.invoiceSvcPrice}>
                        {formatCurrencyBRL(svc.price * svc.quantity)}
                      </Text>
                    </View>
                  ))}
                  {(!fullVehicle.services || fullVehicle.services.length === 0) && (
                    <Text style={styles.noServicesText}>Nenhum serviço registrado.</Text>
                  )}
                </View>

                <View style={styles.invoicePricing}>
                  <View style={styles.invoicePricingRow}>
                    <Text style={styles.invoicePriceLabel}>Subtotal:</Text>
                    <Text style={styles.invoicePriceValue}>
                      {formatCurrencyBRL(getSubtotal())}
                    </Text>
                  </View>
                  
                  {fullVehicle.vehicle.discount > 0 && (
                    <View style={styles.invoicePricingRow}>
                      <Text style={styles.invoicePriceLabel}>Desconto:</Text>
                      <Text style={[styles.invoicePriceValue, { color: '#ef4444' }]}>
                        - {formatCurrencyBRL(fullVehicle.vehicle.discount)}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.invoicePricingRow, styles.invoiceGrandTotalRow]}>
                    <Text style={styles.invoiceTotalLabel}>Valor Final:</Text>
                    <Text style={styles.invoiceTotalValue}>
                      {formatCurrencyBRL(Math.max(0, getSubtotal() - fullVehicle.vehicle.discount))}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <MaterialIcons name="error-outline" size={48} color="#ef4444" />
              <Text style={styles.loadingText}>Não foi possível carregar os detalhes.</Text>
            </View>
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
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  viewport: {
    flex: 1,
  },
  viewportContent: {
    padding: 24,
  },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  invoicePlate: {
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  invoicePlateHeader: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  invoicePlateHeaderText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  invoicePlateVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 2,
  },
  invoiceMeta: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceMetaLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  invoiceMetaVal: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  invoiceServices: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  invoiceSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  invoiceSvcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  svcDetails: {
    flex: 1,
  },
  invoiceSvcName: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  invoiceSvcCat: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  invoiceSvcPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  noServicesText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  invoicePricing: {
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  invoicePricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoicePriceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  invoicePriceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  invoiceGrandTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginBottom: 0,
  },
  invoiceTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  invoiceTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10b981',
  },
});
