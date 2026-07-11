import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

interface EmptyStateProps {
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}

export default function NoEstablishmentEmptyState({ onLogout, isLoggingOut }: EmptyStateProps) {
  const handleLogoutPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onLogout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="store-mall-directory" size={48} color="#cbd5e1" />
            <View style={styles.alertBadge}>
              <MaterialIcons name="warning" size={16} color="#f59e0b" />
            </View>
          </View>

          <Text style={styles.title}>Nenhum Estabelecimento</Text>
          
          <Text style={styles.description}>
            Sua conta operacional foi autenticada, porém não identificamos nenhum estabelecimento vinculado ao seu usuário.
          </Text>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionHeader}>O que fazer?</Text>
            <View style={styles.instructionRow}>
              <MaterialIcons name="chevron-right" size={18} color="#0284c7" />
              <Text style={styles.instructionText}>
                Contate o administrador da sua empresa para vincular seu e-mail.
              </Text>
            </View>
            <View style={styles.instructionRow}>
              <MaterialIcons name="chevron-right" size={18} color="#0284c7" />
              <Text style={styles.instructionText}>
                Acesse o painel web para cadastrar novos estabelecimentos.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogoutPress}
            disabled={isLoggingOut}
            activeOpacity={0.8}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <MaterialIcons name="logout" size={18} color="#ffffff" style={styles.logoutIcon} />
                <Text style={styles.logoutText}>Sair da Conta</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  alertBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#1e293b',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
  },
  instructionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginLeft: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    borderRadius: 8,
    height: 46,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
