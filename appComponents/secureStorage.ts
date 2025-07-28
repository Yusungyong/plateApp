// secureStorage.ts
import * as Keychain from 'react-native-keychain';

type StoredValue = string | object;

export const secureStorage = {
  /**
   * 데이터 저장 (문자열 또는 객체 가능)
   * @param key 저장할 키
   * @param value 저장할 값 (문자열 또는 객체)
   */
  async setItem(key: string, value: StoredValue): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await Keychain.setGenericPassword(key, stringValue, {
      service: key,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },

  /**
   * 데이터 조회
   * @param key 조회할 키
   * @returns 문자열 또는 객체 (파싱 가능하면 객체, 아니면 문자열)
   */
  async getItem<T = StoredValue>(key: string): Promise<T | null> {
    const credentials = await Keychain.getGenericPassword({ service: key });
    if (!credentials) return null;
    try {
      return JSON.parse(credentials.password) as T;
    } catch {
      // 파싱 실패시 문자열 반환
      return credentials.password as unknown as T;
    }
  },

  /**
   * 데이터 삭제
   * @param key 삭제할 키
   */
  async removeItem(key: string): Promise<void> {
    await Keychain.resetGenericPassword({ service: key });
  },

  /**
   * 모든 데이터(서비스별) 삭제 (보통 안 씀, 필요 시 사용)
   * (Keychain에 저장된 모든 데이터는 아닌, 특정 서비스 키들에 대해 반복적으로 호출 필요)
   */
};

export default secureStorage;

// ---- 사용 예시 ----

// 저장
// await secureStorage.setItem('tokens', { accessToken: 'abc', refreshToken: 'def' });

// 조회
// const tokens = await secureStorage.getItem<{ accessToken: string; refreshToken: string }>('tokens');

// 삭제
// await secureStorage.removeItem('tokens');
