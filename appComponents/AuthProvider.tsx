import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import secureStorage from './secureStorage';
 
interface AuthContextType {
  isLoggedIn: boolean;
  isInitializing: boolean;
  token: string | null;
  role: string | null;
  login: (token: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
}
 
const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
 
interface AuthProviderProps {
  initialToken?: string | null;
  children: React.ReactNode;
}
 
const decodeRoleFromToken = (token: string): string | null => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded?.role || null;
  } catch (e) {
    console.error('JWT 디코딩 실패:', e);
    return null;
  }
};
 
export const AuthProvider: React.FC<AuthProviderProps> = ({ initialToken, children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const tokens = await secureStorage.getItem<{ accessToken: string; refreshToken: string }>('tokens');
        const storedToken = initialToken ?? tokens?.accessToken ?? null;
        if (storedToken) {
          setToken(storedToken);
          setIsLoggedIn(true);
          setRole(decodeRoleFromToken(storedToken));
        }
      } catch (error) {
        console.error('AuthProvider 초기화 오류:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, [initialToken]);
 
  // 로그인 시 토큰 저장
  const login = async (newToken: string, newRefreshToken?: string) => {
    try {
      // 기존 refreshToken 가져오기
      let prevTokens = await secureStorage.getItem<{ accessToken: string; refreshToken: string }>('tokens');
      let useRefreshToken = newRefreshToken !== undefined
        ? newRefreshToken
        : prevTokens?.refreshToken ?? '';

      await secureStorage.setItem('tokens', { accessToken: newToken, refreshToken: useRefreshToken });
      setToken(newToken);
      setIsLoggedIn(true);
      setRole(decodeRoleFromToken(newToken));
    } catch (error) {
      console.error('로그인 실패:', error);
      Alert.alert('로그인 오류', '로그인 처리 중 문제가 발생했습니다.');
    }
  };
 
  const logout = async () => {
    try {
      await secureStorage.removeItem('tokens');
      await AsyncStorage.multiRemove([
        'username',
        'role',
        'profileImageUrl',
        'region',
      ]);
      setToken(null);
      setIsLoggedIn(false);
      setRole(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
      Alert.alert('로그아웃 오류', '로그아웃 처리 중 문제가 발생했습니다.');
    }
  };
 
  return (
    <AuthContext.Provider value={{ isLoggedIn, isInitializing, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
 
export default AuthProvider;
