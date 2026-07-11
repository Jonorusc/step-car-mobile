import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { Vehicle } from '@/hooks/useVehicles';
import { Theme } from '@/constants/theme';
import { formatCurrencyBRL, formatPlateDisplay } from '@/utils/formatters';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPrint: (vehicle: Vehicle) => Promise<void> | void;
  onDelete?: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onViewDetails?: (vehicle: Vehicle) => void;
  isPrinting?: boolean;
  systemColor?: string;
}

export default function VehicleCard({ 
  vehicle, 
  onPrint, 
  onDelete, 
  onEdit, 
  onViewDetails,
  isPrinting = false,
  systemColor = Theme.colors.primary 
}: VehicleCardProps) {
  const discountVal = Number(vehicle.discount) || 0;
  const netPriceFormatted = formatCurrencyBRL(Number(vehicle.price || 0) - discountVal);

  // Lógica visual para a cor da bolinha
  const getBadgeColor = (colorName: string) => {
    const c = colorName?.toLowerCase();
    if (c === 'preto') return '#1E293B';
    if (c === 'branco') return '#F8FAFC';
    if (c === 'prata' || c === 'cinza') return '#94A3B8';
    if (c === 'vermelho') return '#EF4444';
    if (c === 'azul') return '#3B82F6';
    if (c === 'verde') return '#10B981';
    if (c === 'amarelo') return '#EAB308';
    if (c === 'laranja') return '#F97316';
    if (c === 'roxo') return '#8B5CF6';
    if (c === 'marrom') return '#8B4513';
    return '#CBD5E1';
  };

  const renderRightActions = () => {
    if (!onEdit && !onDelete) return null;

    return (
      <View style={styles.swipeActionsContainer}>
        {onEdit && (
          <TouchableOpacity style={styles.swipeActionEdit} onPress={() => onEdit(vehicle)} activeOpacity={0.8}>
            <MaterialIcons name="edit" size={24} color="#FFF" />
            <Text style={styles.swipeActionText}>Editar</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={styles.swipeActionDelete} onPress={() => onDelete(vehicle)} activeOpacity={0.8}>
            <MaterialIcons name="delete-outline" size={24} color="#FFF" />
            <Text style={styles.swipeActionText}>Excluir</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => onViewDetails && onViewDetails(vehicle)}>
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modelText}>{vehicle.model}</Text>
              <View style={styles.colorBadgeRow}>
                <View style={[styles.colorDot, { backgroundColor: getBadgeColor(vehicle.color) }]} />
                <Text style={styles.colorText}>{vehicle.color}</Text>
              </View>
            </View>
            <View style={styles.plateBadge}>
              <Text style={styles.plateText}>{formatPlateDisplay(vehicle.plate)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardBody}>
            <View style={styles.rowBetween}>
              <Text style={styles.labelText}>Data de Entrada:</Text>
              <Text style={styles.valueText}>{vehicle.created_at_formatted}</Text>
            </View>
            
            {vehicle.company && (
               <View style={styles.rowBetween}>
                 <Text style={styles.labelText}>Empresa:</Text>
                 <Text style={[styles.valueText, { color: '#6366f1', fontWeight: '600' }]} numberOfLines={1}>
                   {vehicle.company.name}
                 </Text>
               </View>
            )}

            {discountVal > 0 && (
              <View style={styles.rowBetween}>
                <Text style={styles.labelText}>Subtotal:</Text>
                <Text style={styles.valueText}>{formatCurrencyBRL(vehicle.price)}</Text>
              </View>
            )}
            {discountVal > 0 && (
              <View style={styles.rowBetween}>
                <Text style={styles.labelText}>Desconto:</Text>
                <Text style={styles.discountText}>- {formatCurrencyBRL(discountVal)}</Text>
              </View>
            )}
            <View style={styles.rowBetween}>
              <Text style={styles.labelText}>Valor Total:</Text>
              <Text style={[styles.priceHighlight, { color: systemColor }]}>{netPriceFormatted}</Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButtonPrimary, { backgroundColor: systemColor, flex: 1 }]}
              onPress={() => onPrint(vehicle)}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <MaterialIcons name="print" size={20} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.actionTextPrimary}>Imprimir Recibo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flex: 1
  },
  modelText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B'
  },
  colorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6
  },
  colorText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600'
  },
  plateBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0'
  },
  plateText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#334155',
    letterSpacing: 1
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14
  },
  cardBody: {
    marginBottom: 16
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  labelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500'
  },
  valueText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600'
  },
  priceHighlight: {
    fontSize: 16,
    fontWeight: '900'
  },
  discountText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700'
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  actionTextPrimary: {
    color: '#FFF',
    fontWeight: '800',
    marginLeft: 6,
    fontSize: 14
  },
  swipeActionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  swipeActionEdit: {
    backgroundColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  swipeActionDelete: {
    backgroundColor: '#F87171',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  swipeActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});
