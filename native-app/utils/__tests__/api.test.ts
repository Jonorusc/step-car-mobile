import api from '../api';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

describe('API Client Core', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('defines the custom api client', () => {
        expect(api).toBeDefined();
        expect(api.defaults.baseURL).toBe('https://stepcarhomolog.com.br/api/v1');
    });

    it('injects access token interceptor handles secure reading', async () => {
        const mockToken = 'test-token-123';
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);

        // Trigger request interceptor
        const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
        const mockConfig = { headers: {} } as any;

        const config = await requestHandler(mockConfig);
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith('access_token');
        expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });
});
