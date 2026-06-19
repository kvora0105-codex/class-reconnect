import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BACKEND_URL_STORAGE_KEY = 'backend_url_override';
const REQUEST_TIMEOUT_MS = 15000;

type ExpoConstantsShape = {
  expoConfig?: { hostUri?: string };
  manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  manifest?: { debuggerHost?: string };
};

let cachedBackendUrl: string | null = null;

const normalizeUrl = (value: string | null | undefined) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';
  return trimmed.replace(/\/+$/, '');
};

const getDevHostUri = () => {
  const constants = Constants as unknown as ExpoConstantsShape;
  return (
    constants.expoConfig?.hostUri ??
    constants.manifest2?.extra?.expoClient?.hostUri ??
    constants.manifest?.debuggerHost ??
    ''
  );
};

export const getDefaultBackendUrl = () => {
  const envUrl = normalizeUrl(process.env.EXPO_PUBLIC_API_URL);
  if (envUrl) return envUrl;

  const hostUri = getDevHostUri();
  const devHost = hostUri.split(':')[0];
  if (devHost) {
    return `http://${devHost}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
};

export const getBackendUrl = async () => {
  if (cachedBackendUrl) {
    return cachedBackendUrl;
  }

  const storedUrl = normalizeUrl(await AsyncStorage.getItem(BACKEND_URL_STORAGE_KEY));
  cachedBackendUrl = storedUrl || getDefaultBackendUrl();
  return cachedBackendUrl;
};

export const setBackendUrlOverride = async (value: string) => {
  const normalized = normalizeUrl(value);
  if (!normalized) {
    throw new Error('Backend URL cannot be empty');
  }

  await AsyncStorage.setItem(BACKEND_URL_STORAGE_KEY, normalized);
  cachedBackendUrl = normalized;
  return normalized;
};

export const clearBackendUrlOverride = async () => {
  await AsyncStorage.removeItem(BACKEND_URL_STORAGE_KEY);
  cachedBackendUrl = getDefaultBackendUrl();
  return cachedBackendUrl;
};

export const checkBackendHealth = async (url?: string) => {
  const backendUrl = normalizeUrl(url) || (await getBackendUrl());
  const response = await axios.get(`${backendUrl}/api/health`, {
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

const api = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const backendUrl = await getBackendUrl();
  config.baseURL = `${backendUrl}/api`;

  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
