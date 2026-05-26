import { useAuthStore } from '../useAuth';
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
        const mockUser = { id: 10, name: 'João Silva', email: 'joao@email.com', type_user: 'admin' };
        const mockResponse = {
            data: {
                data: {
                    access_token: 'test-access-token',
                    user: mockUser,
                },
            },
        };
        (api.post as jest.Mock).mockResolvedValue(mockResponse);

        await useAuthStore.getState().login('joao@email.com', 'password123');

        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.isAuthenticated).toBe(true);
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'test-access-token');
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
