import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Theme } from '@/constants/theme';
import { useCompanyIndicators } from '@/hooks/useCompany';

interface Props {
  establishmentId: number;
}

export default function CompanyIndicators({ establishmentId }: Props) {
  const { data: indicators, isLoading } = useCompanyIndicators(establishmentId);

  const formatLastUpdate = (dateString?: string | null) => {
    if (!dateString) return { main: '-', sub: '-' };
    const date = new Date(dateString.replace(' ', 'T'));
    const diff = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let main = '';
    if (diff === 0) main = 'Hoje';
    else if (diff === 1) main = 'Há 1 dia';
    else main = `Há ${diff} dias`;

    const sub = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    return { main, sub };
  };

  const lastUpdate = formatLastUpdate(indicators?.lastUpdate);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Theme.colors.primary} />
      </View>
    );
  }

  const renderIndicator = (title: string, value: string | number, subValue: string, icon: keyof typeof MaterialIcons.glyphMap, color: string) => (
    <View style={styles.indicatorCard}>
      <View style={styles.indicatorHeader}>
        <MaterialIcons name={icon} size={16} color={color} />
        <Text style={styles.indicatorTitle}>{title}</Text>
      </View>
      <Text style={[styles.indicatorValue, { color }]}>{value}</Text>
      <Text style={styles.indicatorSub}>{subValue}</Text>
    </View>
  );

  return (
    <ScrollView
      style={{ flexGrow: 0, height: 110, maxHeight: 110 }}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {renderIndicator(
        'TOTAL DE EMPRESAS',
        indicators?.total || 0,
        'Cadastro acumulado',
        'business',
        '#3b82f6'
      )}
      {renderIndicator(
        'CADASTRADAS ESTE MÊS',
        indicators?.registeredThisMonth || 0,
        'Neste mês',
        'calendar-today',
        '#10b981'
      )}
      {renderIndicator(
        'CADASTRADAS ESTA SEMANA',
        indicators?.registeredThisWeek || 0,
        'Nesta semana',
        'date-range',
        '#f59e0b'
      )}
      {renderIndicator(
        'ÚLTIMA ATUALIZAÇÃO',
        lastUpdate.main,
        lastUpdate.sub,
        'update',
        '#64748b'
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 12,
    alignItems: 'flex-start',
  },
  indicatorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    width: 150,
    height: 100,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicatorTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 6,
    textTransform: 'uppercase',
    flex: 1,
  },
  indicatorValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  indicatorSub: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
