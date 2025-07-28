import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import secureStorage from '../../appComponents/secureStorage';
import { useApiService } from '../../appComponents/apiService';

export const useLogin = (loginCallback) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { apiCall } = useApiService();

  // 로그인
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('오류', '아이디와 비밀번호를 모두 입력해주세요');
      return;
    }

    // 디바이스 정보
    const deviceModel = DeviceInfo.getModel();
    const os = Platform.OS;
    const osVersion = DeviceInfo.getSystemVersion();
    const appVersion = DeviceInfo.getVersion();
    const deviceId = await DeviceInfo.getUniqueId();

    try {
      const data = await apiCall<any>({
        url: 'login',
        method: 'POST',
        data: {
          username,
          password,
          deviceModel,
          os,
          osVersion,
          appVersion,
          deviceId,
        },
      });
      console.log('서버 응답:', data);

      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;

      if (accessToken && refreshToken) {
        await secureStorage.setItem('tokens', { accessToken, refreshToken });
        await loginCallback(accessToken, refreshToken); // 콜백으로 둘 다 넘김!
        await fetchUserInfo(username);
      } else {
        Alert.alert('오류', '토큰을 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('오류', error?.message || '로그인 중 오류가 발생했습니다');
    }
  };

  const fetchUserInfo = async (username) => {
    try {
      const tokens = await secureStorage.getItem<{ accessToken: string }>('tokens');
      const accessToken = tokens?.accessToken;
      if (!accessToken) {
        Alert.alert('오류', '토큰이 유실되었습니다. 다시 로그인해주세요.');
        return;
      }

      const userInfoData = await apiCall<any>({
        url: 'userInfo2',
        method: 'POST',
        data: { username },
      });

      if (userInfoData.username) {
        await AsyncStorage.setItem('username', userInfoData.username);
      }
      if (userInfoData.role) {
        await AsyncStorage.setItem('role', userInfoData.role);
      }
      if (userInfoData.profileImageUrl) {
        await AsyncStorage.setItem('profileImageUrl', userInfoData.profileImageUrl);
      }
      if (userInfoData.region) {
        await AsyncStorage.setItem('region', userInfoData.region);
      }
    } catch (error) {
      console.error('Fetch user info error:', error);
      Alert.alert('오류', error?.message || '사용자 정보를 불러오는 중 오류가 발생했습니다');
    }
  };

  return { username, setUsername, password, setPassword, handleLogin };
};
