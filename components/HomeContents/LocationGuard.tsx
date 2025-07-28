import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestAndFetchLocation } from '../../common/locationUtils';
import HomeScreen from './HomeScreen';
import { getGuestToken } from '../../appComponents/useGuestToken';
import { useAuth } from '../../appComponents/AuthProvider';
import secureStorage from '../../appComponents/secureStorage';
import { isTokenExpired } from '../../common/jwtUtils';
import { apiUrl } from '../../appComponents/config';

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await fetch(`${apiUrl}refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.accessToken;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const LocationGuard = () => {
  const [locationChecked, setLocationChecked] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [guestReady, setGuestReady] = useState(false);
  const { isLoggedIn, login, logout } = useAuth();

  useEffect(() => {
    const init = async () => {
      try {
        // === [테스트용] accessToken만 삭제 ===
        const tokens = await secureStorage.getItem('tokens');
        console.log('초기 tokens:', tokens);

        await requestAndFetchLocation(() => {}, setLocationError);

        // 토큰 다시 읽기
        const newTokens = await secureStorage.getItem('tokens');
        let accessToken = newTokens?.accessToken;
        const refreshToken = newTokens?.refreshToken;

        // 1. accessToken 만료 체크
        if (accessToken === null || accessToken === undefined || isTokenExpired(accessToken)) {
          if (refreshToken && !isTokenExpired(refreshToken)) {
            const newAccessToken = await refreshAccessToken(refreshToken);
            if (newAccessToken) {
              await secureStorage.setItem('tokens', { accessToken: newAccessToken, refreshToken });
              accessToken = newAccessToken;
              if (login) await login(newAccessToken, refreshToken);
            } else {
              await secureStorage.removeItem('tokens');
              await AsyncStorage.multiRemove([
                'Authorization',
                'username',
                'role',
                'profileImageUrl',
                'region',
              ]);
              await logout();
            }
          } else {
            await secureStorage.removeItem('tokens');
            await AsyncStorage.multiRemove([
              'Authorization',
              'username',
              'role',
              'profileImageUrl',
              'region',
            ]);
            await logout();
          }
        }

        // 2. 로그인 안된 경우에만 게스트 토큰 발급
        const finalTokens = await secureStorage.getItem('tokens');
        const finalAccessToken = finalTokens?.accessToken;
        const orgTokenawait = await AsyncStorage.getItem('Authorization');
        if ((!isLoggedIn && !orgTokenawait) || !finalAccessToken) {
          const { token, username } = await getGuestToken();
          if (token && username) {
            await AsyncStorage.setItem('Authorization', token);
            await AsyncStorage.setItem('username', username);
            await login(token);
          }
        }

        setGuestReady(true);
      } catch (err) {
        console.error('초기화 실패:', err);
      } finally {
        setLocationChecked(true);
      }
    };

    init();
  }, [isLoggedIn]);

  if (!locationChecked || !guestReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2f80ed" />
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{locationError}</Text>
      </View>
    );
  }

  return <HomeScreen />;
};

export default LocationGuard;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});
