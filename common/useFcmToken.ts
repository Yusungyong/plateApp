// appComponents/useFcmToken.ts
import { useCallback } from 'react';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

export const useFcmToken = () => {
  // 서버에 무조건 전송 (로컬 fcmToken과 비교하지 않음)
  const registerFcmToken = useCallback(async (username, saveFcmToken) => {
    if (!username) return;
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
          return;
        }
      }
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      // 항상 서버에 토큰 전달
      if (token) {
        await saveFcmToken({ username, fcmToken: token });
        await AsyncStorage.setItem('fcmToken', token);
        if (__DEV__) {
          console.log('✅ FCM 토큰 서버에 저장 요청 완료:', token);
        }
      } else {
        console.warn('FCM 토큰이 없습니다');
      }
    } catch (err) {
      console.error('🚨 FCM 등록 오류:', err);
    }
  }, []);

  return { registerFcmToken };
};
