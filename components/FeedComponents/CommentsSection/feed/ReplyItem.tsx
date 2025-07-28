import React, { useState, memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatDistanceToNow, formatISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommentOptionsModal from '../CommentOptionsModal';
import CommentReportReasonModal from '../CommentReportReasonModal';
import { useSubmitReport } from '../../FeedItem/useSubmitReport';
import { useBlockUser } from '../../FeedItem/useBlockUser';
import { profileBucket } from '../../../../appComponents/config';

const ReplyItem = memo(({ reply, currentUsername, onUpdate, onDelete, onBlock, highlight = false }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [inputText, setInputText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);

  const { submitReport } = useSubmitReport();
  const { blockUser } = useBlockUser();

  const isMine = reply.username === currentUsername;
  const formattedTime = formatDistanceToNow(new Date(reply.updatedAt), {
    addSuffix: true,
    locale: ko,
  });
  const isEdited = reply.updatedAt !== reply.createdAt;

  // 🔄 highlight animation
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (highlight) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]),
        { iterations: 3 }
      ).start();
    }
  }, [highlight]);

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#fffae6'],
  });

  const handleEdit = () => setEditing(true);
  const handleEditCancel = () => {
    setEditing(false);
    setEditText(reply.content);
  };
  const handleEditSave = () => {
    if (!editText.trim()) return;
    onUpdate(reply.replyId, editText);
    setEditing(false);
  };
  const handleDelete = () => onDelete(reply.replyId);

  const handleBlock = async () => {
    try {
      const blockerUsername = await AsyncStorage.getItem('username');
      if (!blockerUsername) return alert('로그인이 필요합니다.');
      await blockUser({
        blockerUsername,
        blockedUsername: reply.username,
        blockedAt: formatISO(new Date()),
      });
      alert('사용자가 차단되었습니다.');
      onBlock?.(reply.replyId);
    } catch (e) {
      console.error('사용자 차단 실패:', e);
      alert('차단에 실패했습니다.');
    }
  };

  const handleOpenReportModal = () => {
    setSelectedReason('');
    setInputText('');
    setReportModalVisible(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) return alert('신고 사유를 선택해주세요.');
    try {
      const reporterUsername = await AsyncStorage.getItem('username');
      if (!reporterUsername) return alert('로그인이 필요합니다.');
      const reason = selectedReason === '기타' ? inputText : selectedReason;
      await submitReport({
        reporterUsername,
        targetUsername: reply.username,
        targetType: 'feed-reply',
        targetId: reply.replyId,
        reason,
        submittedAt: formatISO(new Date()),
      });
      setReportModalVisible(false);
      reply.targetFlag = 'Y';
    } catch (e) {
      console.error('신고 실패:', e);
      alert('신고에 실패했습니다.');
    }
  };

  const modalOptions = isMine
    ? [
        { label: '댓글 수정', onPress: handleEdit },
        { label: '댓글 삭제', onPress: handleDelete, destructive: true },
      ]
    : [
        { label: '사용자 차단', onPress: handleBlock, destructive: true },
        { label: '신고하기', onPress: handleOpenReportModal, destructive: true },
      ];

  if (reply.targetFlag === 'Y') {
    return (
      <View style={styles.wrapper}>
        <FastImage source={{ uri: profileBucket + reply.profileImageUrl }} style={styles.avatar} />
        <View style={styles.container}>
          <Text style={styles.restricted}>🔒 사용자 신고로 제재중인 댓글입니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <FastImage source={{ uri: profileBucket + reply.profileImageUrl }} style={styles.avatar} />
      <Animated.View style={[styles.container, highlight && { backgroundColor: bgColor }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.username, isMine && { color: '#007AFF' }]}>
            {reply.username}{isMine ? ' (나)' : ''}
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="more-horiz" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {editing ? (
          <>
            <TextInput
              style={styles.input}
              value={editText}
              onChangeText={setEditText}
              autoFocus
              multiline
            />
            <View style={styles.actions}>
              <TouchableOpacity onPress={handleEditSave}>
                <Text style={styles.action}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditCancel}>
                <Text style={styles.action}>취소</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.content}>{reply.content}</Text>
            <Text style={styles.time}>
              {formattedTime}
              {isEdited && <Text style={styles.editedTag}> (수정됨)</Text>}
            </Text>
          </>
        )}

        <CommentOptionsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          options={modalOptions}
        />

        <CommentReportReasonModal
          visible={reportModalVisible}
          selectedReason={selectedReason}
          setSelectedReason={setSelectedReason}
          inputText={inputText}
          setInputText={setInputText}
          onClose={() => setReportModalVisible(false)}
          onSubmit={handleSubmitReport}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    marginLeft: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#222',
  },
  content: {
    fontSize: 14,
    color: '#333',
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  action: {
    marginRight: 16,
    color: '#007aff',
    fontSize: 13,
    fontWeight: '500',
  },
  time: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  editedTag: {
    fontSize: 11,
    color: '#aaa',
  },
  restricted: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    paddingTop: 4,
    paddingBottom: 4,
  },
});

export default ReplyItem;
