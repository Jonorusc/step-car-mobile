import { useAuthStore, isUserSubscribed } from '../useAuth';
import api from '../../utils/api';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('../../utils/api', () => ({
    post: jest.fn(),
    defaults: { headers: { common: {} } },
}));

describe('Auth Zustand Store', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    });

    it('has initial default state values', () => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isLoading).toBe(false);
    });

    it('performs login and stores access tokens successfully', async () => {
        const mockBasicUser = { id: 10, name: 'João Silva', email: 'joao@email.com', type_user: 'admin' };
        const mockFullUser = {
            id: 10,
            name: 'João Silva',
            email: 'joao@email.com',
            type_user: 'admin',
            is_subscriber: true,
            payment_status: 'active',
            subscription_active: [{ id: 1, plan: 'Premium', status: 'active', expires_at: '2025-12-31' }],
        };

        const mockLoginResponse = {
            data: {
                data: {
                    access_token: 'test-access-token',
                    user: mockBasicUser,
                },
            },
        };
        const mockMeResponse = {
            data: {
                data: mockFullUser,
            },
        };

        (api.post as jest.Mock)
            .mockResolvedValueOnce(mockLoginResponse)
            .mockResolvedValueOnce(mockMeResponse);

        await useAuthStore.getState().login('joao@email.com', 'password123');

        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockFullUser);
        expect(state.isAuthenticated).toBe(true);
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'test-access-token');
        expect(api.post).toHaveBeenCalledWith('/user/auth/login', { email: 'joao@email.com', password: 'password123' });
        expect(api.post).toHaveBeenCalledWith('/user/auth/me');
    });

    it('performs register, fetches profile, and stores access tokens successfully', async () => {
        const mockBasicUser = { id: 10, name: 'João Silva', email: 'joao@email.com', type_user: 'admin' };
        const mockFullUser = {
            id: 10,
            name: 'João Silva',
            email: 'joao@email.com',
            type_user: 'admin',
            is_subscriber: true,
            payment_status: 'active',
            subscription_active: [{ id: 1, plan: 'Premium', status: 'active', expires_at: '2025-12-31' }],
        };

        const mockRegisterResponse = {
            data: {
                data: {
                    access_token: 'test-access-token',
                    user: mockBasicUser,
                },
            },
        };
        const mockMeResponse = {
            data: {
                data: mockFullUser,
            },
        };

        (api.post as jest.Mock)
            .mockResolvedValueOnce(mockRegisterResponse)
            .mockResolvedValueOnce(mockMeResponse);

        await useAuthStore.getState().register('João Silva', 'joao@email.com', 'password123');

        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockFullUser);
        expect(state.isAuthenticated).toBe(true);
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'test-access-token');
        expect(api.post).toHaveBeenCalledWith('/user/auth/register', { name: 'João Silva', email: 'joao@email.com', password: 'password123' });
        expect(api.post).toHaveBeenCalledWith('/user/auth/me');
    });

    it('performs logout and clears state successfully', async () => {
        useAuthStore.setState({
            user: { id: 10, name: 'João Silva', email: 'joao@email.com', type_user: 'admin' },
            isAuthenticated: true,
        });

        await useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
    });
});

describe('isUserSubscribed helper', () => {
    it('returns false if user is null', () => {
        expect(isUserSubscribed(null)).toBe(false);
    });

    it('returns true if is_subscriber is true', () => {
        const user = { id: 1, name: 'Test', email: 'test@email.com', type_user: 'admin', is_subscriber: true };
        expect(isUserSubscribed(user)).toBe(true);
    });

    it('returns true if is_subscriber is 1', () => {
        const user = { id: 1, name: 'Test', email: 'test@email.com', type_user: 'admin', is_subscriber: 1 } as any;
        expect(isUserSubscribed(user)).toBe(true);
    });

    it('returns true if payment_status is active', () => {
        const user = { id: 1, name: 'Test', email: 'test@email.com', type_user: 'admin', payment_status: 'active' };
        expect(isUserSubscribed(user)).toBe(true);
    });

    it('returns true if subscription_active array has active sub', () => {
        const user = {
            id: 1,
            name: 'Test',
            email: 'test@email.com',
            type_user: 'admin',
            subscription_active: [{ id: 1, plan: 'Premium', status: 'active', expires_at: '2025-12-31' }],
        };
        expect(isUserSubscribed(user)).toBe(true);
    });

    it('returns false if subscription is inactive or empty', () => {
        const user = {
            id: 1,
            name: 'Test',
            email: 'test@email.com',
            type_user: 'admin',
            is_subscriber: false,
            payment_status: 'inactive',
            subscription_active: [{ id: 1, plan: 'Premium', status: 'inactive', expires_at: '2025-12-31' }],
        };
        expect(isUserSubscribed(user)).toBe(false);
    });

    it('returns true if employee has access', () => {
        const user = { id: 1, name: 'Test', email: 'test@email.com', type_user: 'employee', employee_has_access: true };
        expect(isUserSubscribed(user)).toBe(true);
    });

    it('returns false if employee has no access', () => {
        const user = { id: 1, name: 'Test', email: 'test@email.com', type_user: 'employee', employee_has_access: false };
        expect(isUserSubscribed(user)).toBe(false);
    });
});
