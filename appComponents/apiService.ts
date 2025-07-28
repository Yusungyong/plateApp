import { useCallback, useMemo } from 'react';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuth } from './AuthProvider';
import { navigate } from './navigationRef';
import { Alert } from 'react-native';
import secureStorage from './secureStorage';
import { apiUrl } from './config';

const API_URL = apiUrl;

const cache = new Map<string, any>();
const pendingRequests = new Map<string, Promise<any>>();

export const useApiService = () => {
  const { token, logout, login } = useAuth();

  const api: AxiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ✅ 요청 인터셉터: accessToken 추가 (Keychain에서!)
    instance.interceptors.request.use(
      async (config) => {
        // --- 1. 토큰 자동 추가 ---
        const tokens = await secureStorage.getItem<{ accessToken: string }>('tokens');
        const accessToken = tokens?.accessToken;
        if (accessToken) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        // --- 2. FormData면 Content-Type 헤더 삭제 ---
        if (config.data instanceof FormData) {
          if (config.headers && config.headers['Content-Type']) {
            delete config.headers['Content-Type'];
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // ✅ 응답 인터셉터: 401 시 refresh → accessToken 재발급 (Keychain에서!)
    instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Keychain에서 refreshToken 꺼냄
            const tokens = await secureStorage.getItem<{ accessToken: string; refreshToken: string }>('tokens');
            console.log('토큰 정보:', tokens);
            const refreshToken = tokens?.refreshToken;
            if (!refreshToken) throw new Error('No refresh token');

            const refreshResponse = await axios.post(`${API_URL}refresh`, {
              refreshToken,
            });

            const newAccessToken = refreshResponse.data.accessToken;
            if (newAccessToken) {
              // 기존 refreshToken까지 같이 다시 저장
              await secureStorage.setItem('tokens', { accessToken: newAccessToken, refreshToken });
              if (login) await login(newAccessToken, refreshToken);

              // 요청에 새 accessToken으로 다시 시도
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newAccessToken}`,
              };
              return axios(originalRequest);
            } else {
              throw new Error('accessToken 없음');
            }
          } catch (refreshErr) {
            await logout();
            Alert.alert('세션 만료', '로그인이 만료되었습니다. 다시 로그인해주세요.', [
              { text: '확인', onPress: () => navigate('Login') },
            ]);
            return Promise.reject(refreshErr);
          }
        }

        await handleError(error);
        return Promise.reject(error);
      }
    );

    return instance;
  }, [token, login, logout]);

  // 에러 처리 함수 (그대로)
  const handleError = async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const errorMessages: { [key: number]: string } = {
        401: "로그인 정보가 만료되었습니다. 다시 로그인해주세요.",
        403: "이 작업을 수행할 권한이 없습니다.",
        500: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      };

      Alert.alert(
        "오류 발생",
        errorMessages[status] || `문제가 발생했습니다. (에러 코드: ${status})`,
        []
      );
    } else if (error.request) {
      Alert.alert("네트워크 오류", "서버에 연결할 수 없습니다. 인터넷 상태를 확인해주세요.", [{ text: "확인" }]);
    } else {
      Alert.alert("오류", `알 수 없는 오류가 발생했습니다: ${error.message}`, [{ text: "확인" }]);
    }
  };

  // API 호출 래퍼 함수 (그대로)
  const apiCall = useCallback(
    async <T>(config: AxiosRequestConfig): Promise<T> => {
      const sortedParams = config.params
        ? Object.keys(config.params)
            .sort()
            .reduce((acc, key) => {
              acc[key] = config.params[key];
              return acc;
            }, {} as Record<string, any>)
        : {};

      const cacheKey = `${config.method}:${config.url}:${JSON.stringify(sortedParams)}:${JSON.stringify(config.data)}`;

      if (pendingRequests.has(cacheKey)) {
        return pendingRequests.get(cacheKey) as Promise<T>;
      }

      const request = api(config)
        .then((response) => {
          cache.set(cacheKey, response.data);
          pendingRequests.delete(cacheKey);
          return response.data;
        })
        .catch((error) => {
          pendingRequests.delete(cacheKey);
          throw error;
        });

      pendingRequests.set(cacheKey, request);
      return request;
    },
    [api]
  );

  const invalidateCache = useCallback((url: string) => {
    for (const key of cache.keys()) {
      if (key.includes(url)) {
        cache.delete(key);
      }
    }
  }, []);

  return { apiCall, invalidateCache };
};
