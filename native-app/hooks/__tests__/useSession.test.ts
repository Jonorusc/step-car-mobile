import { useSessionStore } from '../useSession';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Medium: 'medium',
        Light: 'light',
    },
}));

describe('Session Zustand Store', () => {
    const mockEstablishment1 = {
        id: 1,
        user_id: 10,
        name_by_company: 'Est 1',
        document: '11.111.111/0001-11',
        type: 'CAR_WASH_AND_PARKING',
        cor_system: '#FF5733',
        active: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
    };

    const mockEstablishment2 = {
        id: 2,
        user_id: 10,
        name_by_company: 'Est 2',
        document: '22.222.222/0001-22',
        type: 'CAR_WASH_AND_PARKING',
        cor_system: '#FF8888',
        active: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useSessionStore.setState({
            activeEstablishment: null,
            isLoadingSession: true,
        });
    });

    it('has initial default values', () => {
        const state = useSessionStore.getState();
        expect(state.activeEstablishment).toBeNull();
        expect(state.isLoadingSession).toBe(true);
    });

    it('sets active establishment and triggers haptics and secure-store', async () => {
        await useSessionStore.getState().setActiveEstablishment(mockEstablishment1);

        const state = useSessionStore.getState();
        expect(state.activeEstablishment).toEqual(mockEstablishment1);
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('active_establishment_id', '1');
        expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('deletes active establishment from secure-store when null is set', async () => {
        await useSessionStore.getState().setActiveEstablishment(null);

        const state = useSessionStore.getState();
        expect(state.activeEstablishment).toBeNull();
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('active_establishment_id');
    });

    it('does not auto-select if secure-store has no saved ID and multiple establishments exist', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

        await useSessionStore.getState().initializeSessionEstablishment([mockEstablishment1, mockEstablishment2]);

        const state = useSessionStore.getState();
        expect(state.activeEstablishment).toBeNull();
        expect(state.isLoadingSession).toBe(false);
        expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('auto-selects default establishment if secure-store has no saved ID and only one establishment exists', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

        await useSessionStore.getState().initializeSessionEstablishment([mockEstablishment1]);

        const state = useSessionStore.getState();
        expect(state.activeEstablishment).toEqual(mockEstablishment1);
        expect(state.isLoadingSession).toBe(false);
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('active_establishment_id', '1');
    });

    it('initializes correct establishment from secure-store', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('2');

        await useSessionStore.getState().initializeSessionEstablishment([mockEstablishment1, mockEstablishment2]);

        const state = useSessionStore.getState();
        expect(state.activeEstablishment).toEqual(mockEstablishment2);
        expect(state.isLoadingSession).toBe(false);
        expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('leaves active establishment null if saved ID does not match list and multiple establishments exist', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('99');

        await useSessionStore.getState().initializeSessionEstablishment([mockEstablishment1, mockEstablishment2]);

        const state = useSessionStore.getState();
        expect(state.activeEstablishment).toBeNull();
        expect(state.isLoadingSession).toBe(false);
        expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('handles empty list gracefully', async () => {
        await useSessionStore.getState().initializeSessionEstablishment([]);

        const state = useSessionStore.getState();
        expect(state.activeEstablishment).toBeNull();
        expect(state.isLoadingSession).toBe(false);
    });
});
