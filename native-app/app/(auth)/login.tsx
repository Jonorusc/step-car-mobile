import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validation';
import * as WebBrowser from 'expo-web-browser';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    let hasError = false;

    // Reset errors
    setEmailError('');
    setPasswordError('');

    if (!validateEmail(email)) {
      setEmailError('Por favor, insira um e-mail válido.');
      hasError = true;
    }

    if (!validatePassword(password)) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      hasError = true;
    }

    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await login(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to index upon successful login
      router.replace('/');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || 'Credenciais inválidas. Verifique seu e-mail e senha.';
      Alert.alert('Erro de Autenticação', message);
    }
  };

  const handleForgotPassword = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await WebBrowser.openBrowserAsync('https://stepcar.com.br');
    } catch (error) {
      console.error('Failed to open WebBrowser:', error);
      Alert.alert('Erro', 'Não foi possível abrir o link de recuperação de senha.');
    }
  };

  const handleRegisterRedirect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // Redirect to the web registration page
      await WebBrowser.openBrowserAsync('https://stepcar.com.br/sign-up');
    } catch (error) {
      console.error('Failed to open WebBrowser:', error);
      Alert.alert('Erro', 'Não foi possível abrir a página de cadastro.');
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Top Header Section */}
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/images/splash-icon.png')}
            style={styles.logoImage}
          />
          <Text style={styles.brandTitle}>Bem-vindo de volta</Text>
          <Text style={styles.brandSubtitle}>Entre na sua conta para continuar</Text>
        </View>

        {/* Form Card Container */}
        <View style={styles.cardContainer}>
          <Text style={styles.loginCardTitle}>Login</Text>

          {/* Email / Username field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail ou Registro</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputErrorBorder : null]}>
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail ou registro"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={[styles.inputWrapper, passwordError ? styles.inputErrorBorder : null]}>
              <TextInput
                style={styles.input}
                placeholder="Digite a senha"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Entrar (Submit) button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.buttonTextWrapper}>
                <Text style={styles.loginButtonText}>Entrar</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#ffffff" style={styles.arrowIcon} />
              </View>
            )}
          </TouchableOpacity>

          {/* Divider line */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Forgot Password action */}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton} activeOpacity={0.7}>
            <MaterialIcons name="vpn-key" size={18} color="#475569" style={{ marginRight: 8 }} />
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          {/* Create Account action */}
          <TouchableOpacity onPress={handleRegisterRedirect} style={styles.registerOutlineButton} activeOpacity={0.7}>
            <Text style={styles.registerOutlineButtonText}>Criar conta</Text>
          </TouchableOpacity>

        </View>

        {/* Footer Section */}
        <Text style={styles.footerText}>© 2026 Sistema. Todos os direitos reservados.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 20,
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  loginCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    height: 48,
  },
  inputErrorBorder: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
  },
  loginButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrowIcon: {
    marginLeft: 6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 14,
    marginHorizontal: 10,
  },
  forgotPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginBottom: 12,
  },
  forgotPasswordText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  registerOutlineButton: {
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  registerOutlineButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
});
