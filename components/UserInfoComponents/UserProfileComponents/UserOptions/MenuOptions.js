import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  LayoutAnimation,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../../../appComponents/AuthProvider';
import { useApiService } from '../../../../appComponents/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import CommonLayout from '../../../../common/CommonLayout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRegionPicker } from '../ProfileSection/ActiveRegionPicker/useRegionPicker';
import { registerActiveRegion } from './RegActiveRegion';

const OPTIONS = Object.freeze({
  TERMS: '이용약관',
  NICKNAME: '닉네임',
  FEED_FILTER: '피드 필터 설정',
  VIDEO_FILTER: '영상 필터 설정',
});

const DEFAULT_TEXT = '미등록';
const DEFAULT_REGION = '활동지역을 등록해주세요.';

const MenuOptions = ({ navigation }) => {
  const { apiCall } = useApiService();
  const [userMenuInfo, setUserMenuInfo] = useState({});
  const { logout } = useAuth();
  const [region, setRegion] = useState(DEFAULT_REGION);

  const { openPicker, RegionPickerModal, selectedRegion } = useRegionPicker();

  const fetchMenuInfo = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) throw new Error('사용자 이름이 저장되어 있지 않습니다.');

      const data = await apiCall({
        method: 'GET',
        url: 'user-menu-info',
        params: { username },
      });
      setUserMenuInfo(data);
      setRegion(data?.activeRegion || DEFAULT_REGION);
    } catch (error) {
      console.error('Error fetching menu info:', error);
      Alert.alert('오류', '사용자 정보를 불러오지 못했습니다.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      fetchMenuInfo();
    }, [])
  );

  useEffect(() => {
    const updateRegion = async () => {
      if (selectedRegion && selectedRegion !== userMenuInfo.activeRegion) {
        await registerActiveRegion(selectedRegion, apiCall);
        setRegion(selectedRegion);
      }
    };
    updateRegion();
  }, [selectedRegion]);

  const handleOptionPress = (option) => {
    switch (option) {
      case OPTIONS.TERMS:
        navigation.navigate('이용약관');
        break;
      case OPTIONS.NICKNAME:
        navigation.navigate('CreateNickName');
        break;
      case OPTIONS.FEED_FILTER:
        navigation.navigate('FeedFilterSettings');
        break;
      case OPTIONS.VIDEO_FILTER:
        navigation.navigate('VideoFilterSettings');
        break;
      default:
        Alert.alert('오류', '알 수 없는 옵션이 선택되었습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      Alert.alert('오류', '로그아웃에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return DEFAULT_TEXT;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const OptionItem = ({
    label,
    value,
    onPress,
    isDanger,
    hideArrow = false,
    icon,
    disabled = false,
  }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        isDanger && styles.dangerBox,
        disabled && styles.disabledBox,
      ]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.6}
      disabled={disabled}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={disabled ? '#ccc' : isDanger ? '#FF4D4F' : '#666'}
          style={styles.icon}
        />
      )}
      <View style={styles.optionTextContainer}>
        <Text
          style={[
            styles.label,
            isDanger && styles.danger,
            disabled && styles.disabled,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {value !== undefined && (
          <Text
            style={[
              styles.value,
              isDanger && styles.danger,
              disabled && styles.disabled,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {value || DEFAULT_TEXT}
          </Text>
        )}
      </View>
      {!hideArrow && onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isDanger ? '#FF4D4F' : '#ccc'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <CommonLayout>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileBox}>
          <Ionicons name="person-circle-outline" size={40} color="#999" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.profileName}>
              {userMenuInfo.nickName || '사용자'}
            </Text>
            <Text style={styles.profileRegion}>
              {region}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>계정 정보</Text>
        <View style={styles.sectionGroup}>
          <OptionItem
            label="닉네임"
            value={userMenuInfo.nickName}
            onPress={() => handleOptionPress(OPTIONS.NICKNAME)}
            icon="person-outline"
          />
          <OptionItem
            label="활동지역"
            value={region}
            onPress={openPicker}
            icon="location-outline"
          />
          <OptionItem
            label="연락처"
            value={userMenuInfo.phone}
            onPress={() => navigation.navigate('PhoneRegister')}
            icon="call-outline"
          />
          <OptionItem
            label="이메일"
            value={userMenuInfo.email}
            onPress={() => navigation.navigate('EmailRegister')}
            icon="mail-outline"
          />
          <OptionItem
            label="가입일"
            value={formatDate(userMenuInfo.createdAt)}
            icon="calendar-clear-outline"
            hideArrow
            disabled
          />
        </View>

        <Text style={styles.sectionHeader}>설정</Text>
        <View style={styles.sectionGroup}>
          <OptionItem
            label="이용약관"
            onPress={() => handleOptionPress(OPTIONS.TERMS)}
            icon="document-text-outline"
          />
          <OptionItem
            label="비밀번호 변경"
            onPress={() => navigation.navigate('ChangePasswordScreen')}
            icon="lock-closed-outline"
          />
          <OptionItem
            label="피드 필터 설정"
            onPress={() => handleOptionPress(OPTIONS.FEED_FILTER)}
            icon="funnel-outline"
          />
          <OptionItem
            label="영상 필터 설정"
            onPress={() => handleOptionPress(OPTIONS.VIDEO_FILTER)}
            icon="film-outline"
          />
        </View>
        <Text style={styles.sectionHeader}>계정 관리</Text>
        <View style={styles.sectionGroup}>
          <OptionItem
            label="로그아웃"
            onPress={handleLogout}
            isDanger
            icon="log-out-outline"
          />
          
          {/* 👇 추가된 항목 */}
          <OptionItem
            label="차단된 사용자 목록"
            onPress={() => navigation.navigate('BlockedUserList')}
            icon="ban-outline"
          />

          <OptionItem
            label="회원탈퇴"
            onPress={() => navigation.navigate('WithdrawalInfo')}
            isDanger
            icon="person-remove-outline"
          />
        </View>

      </ScrollView>

      {/* 🔽 활동지역 선택 모달 */}
      {RegionPickerModal()}
    </CommonLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileRegion: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 14,
    color: '#999',
    marginTop: 24,
    marginBottom: 8,
    fontWeight: '600',
  },
  sectionGroup: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  icon: {
    width: 26,
    marginRight: 10,
    textAlign: 'center',
  },
  optionTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  danger: {
    color: '#FF4D4F',
  },
  dangerBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  disabled: {
    color: '#ccc',
  },
  disabledBox: {
    opacity: 0.6,
  },
});

export default MenuOptions;
