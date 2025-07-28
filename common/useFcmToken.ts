// appComponents/useFcmToken.ts
import { useCallback } from 'react';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

export const useFcmToken = () => {
  const registerFcmToken = useCallback(async (username, saveFcmToken) => {
    if (!username) return;
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) {
          Alert.alert('알림', '푸시 알림 권한이 허용되지 않았습니다.');
          return;
        }
      }
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      const storedToken = await AsyncStorage.getItem('fcmToken');
      if (token && token !== storedToken) {
        await saveFcmToken({ username, fcmToken: token });
        await AsyncStorage.setItem('fcmToken', token);
        if (__DEV__) {
          console.log('✅ FCM 토큰 저장 완료');
        }
      }
    } catch (err) {
      console.error('🚨 FCM 등록 오류:', err);
    }
  }, []);

  return { registerFcmToken };
};
