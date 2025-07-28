import { useApiService } from "./apiService";
import { useCallback } from 'react';

type SaveFcmTokenPayload = {
  username: string;
  fcmToken: string;
};

export const useSaveFcmToken = () => {
  const { apiCall } = useApiService();

  const saveFcmToken = useCallback(
    async ({ username, fcmToken }: SaveFcmTokenPayload) => {
        
        if (!username || !fcmToken) {
            throw new Error('Username and FCM token are required');
        }
      const response = await apiCall({
        method: 'POST',
        url: 'user-fcm-save',
        data: { username, fcmToken },
      });
      if (response.success) {

      } else {
        console.warn('⚠️ FCM 토큰 저장 실패:', response.message);
      }
      return response;
    },
    [apiCall]
  );

  return { saveFcmToken };
};
