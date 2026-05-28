import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Vehicle } from '@/hooks/useVehicles';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPrint: (vehicle: Vehicle) => Promise<void>;
  onDelete: (vehicle: Vehicle) => void;
  isPrinting?: boolean;
}

export default function VehicleCard({ vehicle, onPrint, onDelete, isPrinting = false }: VehicleCardProps) {
  const handlePrintPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPrint(vehicle);
  };

  const handleDeletePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Warning);
    onDelete(vehicle);
  };

  const netPrice = (vehicle.price - vehicle.discount) / 100;
  const netPriceFormatted = `R$ ${netPrice.toFixed(2).replace('.', ',')}`;

  return (
    <View style={styles.card}>
      {/* Top Section */}
      <View style={styles.cardHeader}>
        <View style={styles.modelGroup}>
          <Text style={styles.modelText}>{vehicle.model}</Text>
          <Text style={styles.colorText}>• {vehicle.color}</Text>
        </View>
        
        {/* Authentic Mercosul Plate Badge */}
        <View style={styles.mercosulPlate}>
          <View style={styles.plateHeader}>
            <Text style={styles.plateHeaderCountry}>BRASIL</Text>
          </View>
          <View style={styles.plateBody}>
            <Text style={styles.plateText}>{vehicle.plate.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Body Details */}
      <View style={styles.cardBody}>
        <View style={styles.dateAndCompany}>
          <View style={styles.detailItem}>
            <MaterialIcons name="event" size={14} color="#94a3b8" />
            <Text style={styles.detailValue}>{vehicle.created_at_formatted}</Text>
          </View>
          
          {vehicle.company && (
            <View style={[styles.detailItem, { marginLeft: 12 }]}>
              <MaterialIcons name="business" size={14} color="#6366f1" />
              <Text style={[styles.detailValue, { color: '#6366f1', fontWeight: '600' }]} numberOfLines={1}>
                {vehicle.company.name}
              </Text>
            </View>
          )}
        </View>

        {/* Pricing Layout */}
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Valor Original:</Text>
            <Text style={styles.priceValue}>{vehicle.price_formatted}</Text>
          </View>
          
          {vehicle.discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Desconto:</Text>
              <Text style={styles.discountValue}>
                -R$ {(vehicle.discount / 100).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          )}
          
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Pago:</Text>
            <Text style={styles.totalValue}>{netPriceFormatted}</Text>
          </View>
        </View>

        {/* Services List Pills */}
        {vehicle.services && vehicle.services.length > 0 && (
          <View style={styles.servicesContainer}>
            <Text style={styles.servicesTitle}>Serviços:</Text>
            <View style={styles.servicesList}>
              {vehicle.services.map((service) => (
                <View key={service.id} style={styles.servicePill}>
                  <Text style={styles.servicePillText}>{service.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions Footer */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.printBtn]}
          onPress={handlePrintPress}
          activeOpacity={0.7}
          disabled={isPrinting}
        >
          <MaterialIcons name="print" size={18} color="#0d9488" />
          <Text style={styles.printBtnText}>
            {isPrinting ? 'Imprimindo...' : 'Imprimir Segunda Via'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={handleDeletePress}
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
          <Text style={styles.deleteBtnText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modelGroup: {
    flex: 1,
    marginRight: 8,
  },
  modelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  colorText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  mercosulPlate: {
    width: 90,
    height: 38,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#002060',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  plateHeader: {
    backgroundColor: '#002060',
    width: '100%',
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateHeaderCountry: {
    fontSize: 7,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  plateBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  cardBody: {
    marginBottom: 12,
  },
  dateAndCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
    fontWeight: '500',
  },
  priceContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
    marginTop: 6,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '800',
  },
  servicesContainer: {
    marginTop: 8,
  },
  servicesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  servicePill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  servicePillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  printBtn: {
    backgroundColor: '#f0fdfa',
  },
  printBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0d9488',
    marginLeft: 6,
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
    marginLeft: 6,
  },
});
