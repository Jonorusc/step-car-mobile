import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useSession } from '@/hooks/useSession';
import { useEstablishments } from '@/hooks/useEstablishments';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function PrivateLayout() {
  const { data: establishments, isLoading: isLoadingEstb } = useEstablishments();
  const { initializeSessionEstablishment, isLoadingSession } = useSession();

  useEffect(() => {
    if (establishments) {
      initializeSessionEstablishment(establishments);
    }
  }, [establishments]);

  if (isLoadingEstb || isLoadingSession) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="establishments" />
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
