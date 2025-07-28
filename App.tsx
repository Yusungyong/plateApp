import 'react-native-reanimated'; // 👈 무조건 가장 상단!
import React from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, focusManager } from 'react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { AppState, AppStateStatus, StatusBar } from 'react-native';
import AuthProvider, { useAuth } from './appComponents/AuthProvider';
import Navigation from './appComponents/Navigation';
import { navigationRef } from './appComponents/navigationRef';
import store from './src/redux/store';
import messaging from '@react-native-firebase/messaging';
import { getApps } from '@react-native-firebase/app';
import { useSaveFcmToken } from './appComponents/useSaveFcmToken';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFcmToken } from './common/useFcmToken';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === 'active');
}

// ✅ FCM payload 분기 이동 함수 (switch-case 구조)
function handleNotificationNavigate(remoteMessage) {
  const data = remoteMessage?.data;
  if (!data) return;
  const type = data.type;
  switch (type) {
    case 'video':
      navigationRef.current?.navigate('재생', {
        storeId: Number(data.referenceId),
        passedUsername: 'noti',
        ...(data.commentId ? { scrollToCommentId: Number(data.commentId) } : {}),
        ...(data.replyId ? { scrollToReplyId: Number(data.replyId) } : {}),
      });
      break;
    case 'feed':
      navigationRef.current?.navigate('FeedImageViewer', {
        feedId: Number(data.referenceId),
        username: data.receiverId ? String(data.receiverId) : undefined,
        ...(data.commentId ? { scrollToCommentId: Number(data.commentId) } : {}),
        ...(data.replyId ? { scrollToReplyId: Number(data.replyId) } : {}),
      });
      break;
    default:
      // 기타 타입 분기
      break;
  }
}

// ✅ FCM 처리용 컴포넌트 (UI 갱신 콜백 지원)
const FcmManager = ({ onForegroundNotification }) => {
  const { saveFcmToken } = useSaveFcmToken();
  const { isLoggedIn } = useAuth();
  const { registerFcmToken } = useFcmToken();

  React.useEffect(() => {
    const setupFirebaseMessaging = async () => {
      try {
        const apps = getApps();
        if (!isLoggedIn) return;

        const username = await AsyncStorage.getItem('username');
        await registerFcmToken(username, saveFcmToken);
      } catch (err) {
        console.error('🚨 FCM 설정 중 오류:', err);
      }
    };

    setupFirebaseMessaging();

    // 🔥 Foreground FCM 메시지 리스너 (필요시 UI 갱신)
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (__DEV__) {
        console.log('📦 Foreground FCM payload:', remoteMessage.data);
      }
      if (onForegroundNotification) onForegroundNotification(remoteMessage.data);
    });

    return unsubscribe;
  }, [isLoggedIn, onForegroundNotification, registerFcmToken, saveFcmToken]);

  return null;
};

const App: React.FC = () => {
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);

    // 백그라운드 상태에서 알림 클릭 → 앱 열림
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage && remoteMessage.data) {
        if (__DEV__) {
          console.log('📦 알림 클릭(Background):', remoteMessage.data);
        }
        handleNotificationNavigate(remoteMessage);
      }
    });

    // 앱이 완전히 종료된 상태에서 알림 클릭 → 앱 열림
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage && remoteMessage.data) {
          if (__DEV__) {
            console.log('📦 알림 클릭(Terminated):', remoteMessage.data);
          }
          handleNotificationNavigate(remoteMessage);
        }
      });

    return () => {
      subscription.remove();
      unsubscribeNotificationOpened();
    };
  }, []);

  // 예시: 알림 실시간 갱신 함수 연결 (필요하면 실제 함수로 교체)
  const handleForegroundNotification = (data) => {
    // 예) fetchNotifications();
  };

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer ref={navigationRef}>
            <AuthProvider>
              <StatusBar barStyle="dark-content" hidden={false} backgroundColor="#fff" />
              <FcmManager onForegroundNotification={handleForegroundNotification} />
              <Navigation />
            </AuthProvider>
          </NavigationContainer>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
