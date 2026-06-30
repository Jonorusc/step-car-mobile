import { Slot, useRouter, useSegments, useRootNavigationState, SplashScreen } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore, isUserSubscribed } from '../hooks/useAuth';
import { StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => { });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export default function RootLayout() {
  const { user, isAuthenticated, initializeSession, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Load initial session on startup
  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return; // Wait for navigation state to be ready before routing

    const segmentsList = segments as string[];
    const inAuthGroup = segmentsList[0] === '(auth)';
    const onSubscriptionPage = segmentsList[0] === '(auth)' && segmentsList[1] === 'subscription';

    const isSubscribed = isUserSubscribed(user);

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

    setIsNavigationReady(true);
  }, [isAuthenticated, user, segments, isLoading, rootNavigationState?.key]);

  useEffect(() => {
    if (isNavigationReady) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [isNavigationReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
