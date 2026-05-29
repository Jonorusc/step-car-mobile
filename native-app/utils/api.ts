import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import logger from './logger';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
    throw new Error(
        'EXPO_PUBLIC_API_URL is not configured. Check your .env file.'
    );
}

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
});

api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            logger.error('Error fetching access token from SecureStore:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await SecureStore.getItemAsync('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token stored');
                }

                const response = await axios.post(
                    `${API_BASE_URL}/user/auth/refresh`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`,
                        },
                    },
                );

                const access_token = response.data?.data?.access_token;
                const refresh_token = response.data?.data?.refresh_token;

                if (!access_token) {
                    throw new Error('Refresh token request returned empty access token');
                }

                await SecureStore.setItemAsync('access_token', access_token);
                if (refresh_token) {
                    await SecureStore.setItemAsync('refresh_token', refresh_token);
                }

                api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                originalRequest.headers.Authorization = `Bearer ${access_token}`;

                processQueue(null, access_token);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Clean credentials on failure
                await SecureStore.deleteItemAsync('access_token');
                await SecureStore.deleteItemAsync('refresh_token');
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    },
);

export default api;
