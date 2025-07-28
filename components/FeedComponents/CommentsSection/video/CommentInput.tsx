// ✅ Finalized CommentInput.tsx with aligned button and input
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import LoginRequiredModal from '../../../../appComponents/LoginRequiredModal';
import { useAuth } from '../../../../appComponents/AuthProvider';
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CommentInput = ({ replyTo, onCancelReply, onSubmit, inputRef }) => {
  const [text, setText] = useState('');
  const { isLoggedIn, role } = useAuth();
  const isGuest = role === 'ROLE_GUEST';
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  useEffect(() => {
    LayoutAnimation.easeInEaseOut();
  }, [text]);

  useEffect(() => {
    if (replyTo && inputRef?.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  const handleInputTouch = () => {
    if (!isLoggedIn || isGuest) {
      setLoginModalVisible(true);
      inputRef?.current?.blur();
      return;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.wrapper}>
        {replyTo && (
          <View style={styles.replyToRow}>
            <Text style={styles.replyToText}> {replyTo.nickname}님에게 대댓글 작성중..</Text>
            <TouchableOpacity onPress={onCancelReply}>
              <Text style={styles.cancelButton}>취소</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="댓글을 입력하세요"
            value={text}
            onChangeText={setText}
            multiline
            onFocus={handleInputTouch}
          />
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
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
  wrapper: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  replyToRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  replyToText: {
    fontSize: 13,
    color: '#555',
  },
  cancelButton: {
    fontSize: 13,
    color: '#007AFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center', // ✅ 정렬 개선
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  submitButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6, // ✅ 높이 보정
    backgroundColor: '#007AFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CommentInput;