import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// 백그라운드 상태에서 메시지 수신시 payload 출력
messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (remoteMessage && remoteMessage.data) {
    console.log('📦 Background FCM payload:', remoteMessage.data);
  }
});

AppRegistry.registerComponent(appName, () => App);
