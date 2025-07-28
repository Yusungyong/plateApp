import React, { useEffect, useState } from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

import UsernameInput from './UsernameInput';
import PasswordInput from './PasswordInput';
import EmailInput from './EmailInput';
import { apiUrl } from '../../../appComponents/config';

const SignUpContents: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });

  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(true);

  // ✅ 동의 화면에서 돌아왔을 때 체크 및 모달 복귀
  useEffect(() => {
    const { agreedType } = route.params || {};

    if (agreedType === 'terms') {
      setTermsChecked(true);
      setShowAgreementModal(true);
      navigation.setParams({ agreedType: undefined }); // 🔄 초기화
    }

    if (agreedType === 'privacy') {
      setPrivacyChecked(true);
      setShowAgreementModal(true);
      navigation.setParams({ agreedType: undefined }); // 🔄 초기화
    }
  }, [route.params]);

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleSignUp = async () => {
    try {
      const response = await axios.post(`${apiUrl}signup`, {
        username: form.username,
        password: form.password,
        email: form.email,
      });

      if (response.data === '회원가입에 성공하였습니다.') {
        Alert.alert('회원가입 성공', '회원가입이 완료되었습니다.');
        navigation.navigate('Login');
      } else {
        Alert.alert('회원가입 실패', response.data.message || '회원가입 중 문제가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '서버와의 통신에 문제가 발생했습니다.');
    }
  };

  const handleConfirmAgreement = () => {
    if (!termsChecked || !privacyChecked) {
      Alert.alert('동의 필요', '모든 항목에 동의해 주세요.');
      return;
    }
    setShowAgreementModal(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        {currentStep === 1 && (
          <UsernameInput
            username={form.username}
            setUsername={(value) => setField('username', value)}
            onNext={handleNextStep}
          />
        )}
        {currentStep === 2 && (
          <PasswordInput
            password={form.password}
            confirmPassword={form.confirmPassword}
            setPassword={(value) => setField('password', value)}
            setConfirmPassword={(value) => setField('confirmPassword', value)}
            onNext={handleNextStep}
          />
        )}
        {currentStep === 3 && (
          <EmailInput
            email={form.email}
            setEmail={(value) => setField('email', value)}
            onSignUp={handleSignUp}
          />
        )}
      </View>

      {/* ✅ 약관 동의 모달 */}
      <Modal visible={showAgreementModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>약관 동의</Text>

            <View style={styles.checkboxRow}>
              <CheckBox
                value={termsChecked}
                onValueChange={setTermsChecked}
                tintColors={{ true: '#2f80ed', false: '#ccc' }}
              />
              <Text style={styles.checkboxLabel}>이용약관 동의 (필수)</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAgreementModal(false);
                  setTimeout(() => navigation.navigate('이용약관'), 300);
                }}
              >
                <Text style={styles.link}>보기</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxRow}>
              <CheckBox
                value={privacyChecked}
                onValueChange={setPrivacyChecked}
                tintColors={{ true: '#2f80ed', false: '#ccc' }}
              />
              <Text style={styles.checkboxLabel}>개인정보 처리방침 동의 (필수)</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAgreementModal(false);
                  setTimeout(() => navigation.navigate('PrivacyPolicy'), 300);
                }}
              >
                <Text style={styles.link}>보기</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmAgreement}>
              <Text style={styles.confirmButtonText}>동의하고 시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SignUpContents;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  checkboxLabel: {
    fontSize: 15,
    marginLeft: 8,
    color: '#333',
    flexShrink: 1,
  },
  link: {
    marginLeft: 8,
    color: '#2f80ed',
    textDecorationLine: 'underline',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#2f80ed',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
