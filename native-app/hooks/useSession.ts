import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { BackendEstablishment } from './useEstablishments';
import logger from '../utils/logger';

interface SessionState {
    activeEstablishment: BackendEstablishment | null;
    isLoadingSession: boolean;
    setActiveEstablishment: (establishment: BackendEstablishment | null) => Promise<void>;
    initializeSessionEstablishment: (list: BackendEstablishment[]) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
    activeEstablishment: null,
    isLoadingSession: true,

    setActiveEstablishment: async (establishment) => {
        try {
            if (establishment) {
                await SecureStore.setItemAsync('active_establishment_id', String(establishment.id));
                // Soft haptic vibration on switch
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } else {
                await SecureStore.deleteItemAsync('active_establishment_id');
            }
            set({ activeEstablishment: establishment });
        } catch (error) {
            logger.error('Failed to set active establishment in secure store:', error);
            set({ activeEstablishment: establishment });
        }
    },

    initializeSessionEstablishment: async (list) => {
        if (list.length === 0) {
            set({ activeEstablishment: null, isLoadingSession: false });
            return;
        }

        set({ isLoadingSession: true });
        try {
            const savedIdStr = await SecureStore.getItemAsync('active_establishment_id');
            if (savedIdStr) {
                const savedId = parseInt(savedIdStr, 10);
                const found = list.find((est) => est.id === savedId);
                if (found) {
                    set({ activeEstablishment: found, isLoadingSession: false });
                    return;
                }
            }

            // If there is exactly 1 establishment, auto-select it.
            // If there are multiple establishments and no valid saved ID, let the user choose.
            if (list.length === 1) {
                const defaultEstablishment = list[0];
                await SecureStore.setItemAsync('active_establishment_id', String(defaultEstablishment.id));
                set({ activeEstablishment: defaultEstablishment, isLoadingSession: false });
            } else {
                set({ activeEstablishment: null, isLoadingSession: false });
            }
        } catch (error) {
            logger.error('Failed to initialize session establishment:', error);
            if (list.length === 1) {
                set({ activeEstablishment: list[0], isLoadingSession: false });
            } else {
                set({ activeEstablishment: null, isLoadingSession: false });
            }
        }
    },
}));

export const useSession = () => useSessionStore();
export default useSession;
