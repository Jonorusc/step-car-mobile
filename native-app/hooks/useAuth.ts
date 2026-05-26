import { create } from 'zustand';
import api from '../utils/api';
import * as SecureStore from 'expo-secure-store';

export interface Subscription {
    id: number;
    plan: string;
    status: string;
    expires_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    type_user: string;
    subscription_active?: Subscription[];
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    initializeSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/user/auth/login', { email, password });
            const access_token = response.data?.data?.access_token;
            const user = response.data?.data?.user;

            if (!access_token || !user) {
                throw new Error('Invalid login response payload');
            }

            await SecureStore.setItemAsync('access_token', access_token);
            // Fallback to access_token if no separate refresh token returned
            const refresh_token = response.data?.data?.refresh_token || access_token;
            await SecureStore.setItemAsync('refresh_token', refresh_token);

            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (name, email, password) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/user/auth/register', { name, email, password });
            const access_token = response.data?.data?.access_token;
            const user = response.data?.data?.user;

            if (!access_token || !user) {
                throw new Error('Invalid registration response payload');
            }

            await SecureStore.setItemAsync('access_token', access_token);
            const refresh_token = response.data?.data?.refresh_token || access_token;
            await SecureStore.setItemAsync('refresh_token', refresh_token);

            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    initializeSession: async () => {
        set({ isLoading: true });
        try {
            const token = await SecureStore.getItemAsync('access_token');
            if (token) {
                const response = await api.post('/user/auth/me');
                const user = response.data?.data;
                if (user) {
                    set({ user, isAuthenticated: true });
                } else {
                    await SecureStore.deleteItemAsync('access_token');
                    await SecureStore.deleteItemAsync('refresh_token');
                    set({ user: null, isAuthenticated: false });
                }
            }
        } catch (error) {
            console.error('Failed to initialize session:', error);
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },
}));

export default useAuthStore;
