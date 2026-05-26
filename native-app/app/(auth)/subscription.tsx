import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuthStore } from '../../hooks/useAuth';
import * as WebBrowser from 'expo-web-browser';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, initializeSession, logout, isLoading } = useAuthStore();
  const [checking, setChecking] = useState(false);

  const handleSubscribe = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // Direct them to the main website to complete subscription payment
      await WebBrowser.openBrowserAsync('https://stepcar.com.br');
    } catch (error) {
      console.error('Failed to open WebBrowser:', error);
      Alert.alert('Erro', 'Não foi possível abrir o link de assinatura.');
    }
  };

  const handleCheckPayment = async () => {
    setChecking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      // Re-trigger initializeSession to fetch profile data from /user/auth/me
      await initializeSession();
      
      const updatedState = useAuthStore.getState();
      const isSubscribed = Array.isArray(updatedState.user?.subscription_active) &&
        updatedState.user.subscription_active.some(sub => sub.status === 'active');
      
      if (isSubscribed) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Sucesso!',
          'Assinatura confirmada! Bem-vindo ao StepCar.',
          [{ text: 'OK', onPress: () => router.replace('/') }]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Assinatura Pendente',
          'Nenhuma assinatura ativa foi detectada para sua conta. Se você realizou o pagamento recentemente, por favor aguarde alguns instantes e tente novamente.'
        );
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', 'Não foi possível verificar seu status. Tente novamente em instantes.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao sair.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <MaterialIcons name="star-half" size={80} color="#f59e0b" />
          <Text style={styles.brandTitle}>StepCar Premium</Text>
          <Text style={styles.brandSubtitle}>Olá, {user?.name || 'Operador'}</Text>
        </View>

        <View style={styles.cardContainer}>
          <MaterialIcons name="lock" size={40} color="#cbd5e1" style={styles.lockIcon} />
          <Text style={styles.cardTitle}>Assinatura Requerida</Text>
          
          <Text style={styles.cardDescription}>
            Sua conta operacional foi criada com sucesso! Para desbloquear o acesso nativo às ferramentas de lavagem, gerenciamento de vagas e impressões Bluetooth, é necessário possuir uma assinatura ativa.
          </Text>

          <Text style={styles.infoText}>
            * As assinaturas e transações financeiras são efetuadas de forma segura diretamente através do nosso site.
          </Text>

          {/* Subscribe CTA */}
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <MaterialIcons name="open-in-new" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.subscribeButtonText}>Assinar no Web App</Text>
          </TouchableOpacity>

          {/* Check Payment Trigger */}
          <TouchableOpacity
            style={[styles.checkButton, checking ? styles.buttonDisabled : null]}
            onPress={handleCheckPayment}
            disabled={checking || isLoading}
            activeOpacity={0.8}
          >
            {checking ? (
              <ActivityIndicator color="#14b8a6" />
            ) : (
              <>
                <MaterialIcons name="refresh" size={20} color="#14b8a6" style={{ marginRight: 8 }} />
                <Text style={styles.checkButtonText}>Verificar Pagamento</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout link */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Entrar com outra conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 12,
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 6,
  },
  cardContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  lockIcon: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
    fontStyle: 'italic',
  },
  subscribeButton: {
    flexDirection: 'row',
    backgroundColor: '#0284c7',
    borderRadius: 8,
    height: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    height: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#14b8a6',
  },
  buttonDisabled: {
    borderColor: '#334155',
  },
  checkButtonText: {
    color: '#14b8a6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 36,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
