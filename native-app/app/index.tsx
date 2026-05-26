import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../hooks/useAuth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function Index() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log('user is authenticated')
    return <Redirect href="/login" />;
  }

  const isSubscribed = Array.isArray(user?.subscription_active) &&
    user.subscription_active.some(sub => sub.status === 'active');

  if (!isSubscribed) {
    return <Redirect href="/subscription" />;
  }

  // Redirect to the private home screen
  return <Redirect href="/(private)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
