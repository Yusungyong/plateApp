import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager,
  Keyboard,
} from 'react-native';
import LoginRequiredModal from '../../../../appComponents/LoginRequiredModal';
import { useAuth } from '../../../../appComponents/AuthProvider';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CommentInput = ({ replyTo, onCancelReply, onSubmit }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const [loginModalVisible, setLoginModalVisible] = useState(false); // ✅ 로그인 모달 상태
  const { isLoggedIn, role } = useAuth();
  const isGuest = role === 'ROLE_GUEST';
  // 텍스트 길이 변경 시 애니메이션 효과
  useEffect(() => {
    LayoutAnimation.easeInEaseOut();
  }, [text]);

  // 답글 대상이 생기면 자동 포커스
  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = () => {
    if (!isLoggedIn || isGuest) {
      setLoginModalVisible(true);
      Keyboard.dismiss();
    return;
    }    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  const handleInputTouch = () => {
    if (!isLoggedIn || isGuest) {
      setLoginModalVisible(true);
      Keyboard.dismiss();
    return;
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.container}>
        {replyTo && (
          <View style={styles.replyingTo}>
            <Text style={styles.replyTag}>@{replyTo.nickname}</Text>
            <Text style={styles.replyText}>님에게 답글 작성 중</Text>
            <TouchableOpacity onPress={onCancelReply}>
              <Text style={styles.cancel}>취소</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="댓글을 입력하세요"
            placeholderTextColor="#888"
            multiline
            numberOfLines={1}
            textAlignVertical="top"
            onFocus={handleInputTouch}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={text.trim().length === 0}
            style={[
              styles.submitButton,
              text.trim().length === 0 && styles.submitButtonDisabled,
            ]}
          >
            <Text style={styles.submitText}>등록</Text>
          </TouchableOpacity>
        </View>
        <LoginRequiredModal
          visible={loginModalVisible}
          onClose={() => setLoginModalVisible(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  replyingTo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
  },
  replyTag: {
    fontWeight: 'bold',
    color: '#007aff',
    marginRight: 4,
  },
  replyText: {
    fontSize: 14,
    color: '#333',
  },
  cancel: {
    marginLeft: 8,
    color: '#888',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
  },
  submitButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#007aff',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CommentInput;
