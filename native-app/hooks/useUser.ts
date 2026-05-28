import { useAuthStore, User } from './useAuth';

export const useUser = (): User | null => {
    return useAuthStore((state) => state.user);
};

export default useUser;
