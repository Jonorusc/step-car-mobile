import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../hooks/useAuth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function RootLayout() {
  const { user, isAuthenticated, initializeSession, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Load initial session on startup
  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const segmentsList = segments as string[];
    const inAuthGroup = segmentsList[0] === '(auth)';
    const onSubscriptionPage = segmentsList[0] === '(auth)' && segmentsList[1] === 'subscription';
    
    const isSubscribed = Array.isArray(user?.subscription_active) &&
      user.subscription_active.some(sub => sub.status === 'active');

    if (!isAuthenticated) {
      // Unauthenticated users belong on login or register (both are in auth group)
      // If they are on a private page or the subscription gate page, send them to login
      if (!inAuthGroup || onSubscriptionPage) {
        router.replace('/login');
      }
    } else {
      // Authenticated users
      if (!isSubscribed) {
        // Locked: redirect to subscription blocking gate
        if (!onSubscriptionPage) {
          router.replace('/subscription');
        }
      } else {
        // Active Subscribers belong in private sections
        // If they are in the auth group (login, register, subscription), redirect to private index
        if (inAuthGroup) {
          router.replace('/');
        }
      }
    }
  }, [isAuthenticated, user, segments, isLoading]);

  if (isLoading && !user) {
    // Show premium minimal loader during startup rehydration
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
