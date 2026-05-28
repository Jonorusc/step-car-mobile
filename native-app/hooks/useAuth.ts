import { create } from 'zustand';
import api from '../utils/api';
import * as SecureStore from 'expo-secure-store';

export interface Subscription {
    id: number;
    plan: string;
    status: string;
    expires_at: string;
}

export interface Address {
    id: number;
    street: string;
    number: string;
    city: string;
    state: string;
    zip_code: string;
}

export interface User {
    id: number;
    datalake_customer_id?: string;
    name: string;
    email: string;
    phone?: string;
    active?: number;
    cpf?: string;
    birthDate?: string;
    type_user: string;
    is_subscriber?: boolean;
    payment_status?: string;
    current_period_end?: string;
    subscription_active?: Subscription[];
    address?: Address[];
    employee_has_access?: boolean;
}

export const isUserSubscribed = (user: User | null): boolean => {
    if (!user) return false;
    
    // Check if employee has access
    if (user.type_user === 'employee' && user.employee_has_access === true) {
        return true;
    }

    const hasActiveSubscription = Array.isArray(user.subscription_active) &&
        user.subscription_active.some(sub => sub.status === 'active');

    return (
        user.is_subscriber === true ||
        user.is_subscriber === 1 ||
        (user.is_subscriber as any) === '1' ||
        user.payment_status === 'active' ||
        hasActiveSubscription
    );
};

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
            const basicUser = response.data?.data?.user;

            if (!access_token || !basicUser) {
                throw new Error('Invalid login response payload');
            }

            await SecureStore.setItemAsync('access_token', access_token);
            // Fallback to access_token if no separate refresh token returned
            const refresh_token = response.data?.data?.refresh_token || access_token;
            await SecureStore.setItemAsync('refresh_token', refresh_token);

            // Fetch the complete user profile from /user/auth/me
            const meResponse = await api.post('/user/auth/me');
            const fullUser = meResponse.data?.data;

            if (!fullUser) {
                throw new Error('Failed to fetch user profile details after login');
            }

            set({ user: fullUser, isAuthenticated: true, isLoading: false });
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
            const basicUser = response.data?.data?.user;

            if (!access_token || !basicUser) {
                throw new Error('Invalid registration response payload');
            }

            await SecureStore.setItemAsync('access_token', access_token);
            const refresh_token = response.data?.data?.refresh_token || access_token;
            await SecureStore.setItemAsync('refresh_token', refresh_token);

            // Fetch the complete user profile from /user/auth/me
            const meResponse = await api.post('/user/auth/me');
            const fullUser = meResponse.data?.data;

            if (!fullUser) {
                throw new Error('Failed to fetch user profile details after registration');
            }

            set({ user: fullUser, isAuthenticated: true, isLoading: false });
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

export const useUser = () => useAuthStore((state) => state.user);

export default useAuthStore;
