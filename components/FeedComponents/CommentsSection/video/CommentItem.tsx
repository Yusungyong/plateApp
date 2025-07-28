import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import ReplyItem from './ReplyItem';
import CommentOptionsModal from '../CommentOptionsModal';
import CommentReportReasonModal from '../CommentReportReasonModal';
import { formatDistanceToNow, formatISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { profileBucket } from '../../../../appComponents/config';
import { useSubmitReport } from '../../FeedItem/useSubmitReport';
import { useBlockUser } from '../../FeedItem/useBlockUser';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CommentItem = ({
  comment,
  replies = [],
  isExpanded,
  onToggleReplies,
  onReply,
  onUpdate,
  onDelete,
  onUpdateReply,
  onDeleteReply,
  currentUsername,
  onBlock,
  onBlockReply,
  highlight = false,
  highlightReplyId,
  replyRefs, // ✅ 추가
}) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [inputText, setInputText] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));

  const { submitReport } = useSubmitReport();
  const { blockUser } = useBlockUser();

  const isMine = comment.username === currentUsername;

  useEffect(() => {
    if (highlight) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.5, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.5, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [highlight]);

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      alert('신고 사유를 선택해주세요.');
      return;
    }

    try {
      const reporterUsername = await AsyncStorage.getItem('username');
      if (!reporterUsername) {
        alert('로그인이 필요합니다.');
        return;
      }

      const finalReason = selectedReason === '기타' ? inputText : selectedReason;

      await submitReport({
        reporterUsername,
        targetUsername: comment.username,
        targetType: 'video-comment',
        targetId: comment.commentId,
        reason: finalReason,
        submittedAt: formatISO(new Date()),
      });

      setReportModalVisible(false);
      comment.targetFlag = 'Y';
    } catch (e) {
      console.error('신고 실패:', e);
      alert('신고에 실패했습니다.');
    }
  };

  const handleEdit = () => setEditing(true);
  const handleEditSave = () => {
    onUpdate(comment.commentId, editText);
    setEditing(false);
  };
  const handleEditCancel = () => {
    setEditText(comment.content);
    setEditing(false);
  };
  const handleDelete = () => onDelete(comment.commentId);

  const handleBlock = async () => {
    try {
      const blockerUsername = await AsyncStorage.getItem('username');
      if (!blockerUsername) {
        alert('로그인이 필요합니다.');
        return;
      }

      await blockUser({
        blockerUsername,
        blockedUsername: comment.username,
        blockedAt: formatISO(new Date()),
      });

      alert('사용자가 차단되었습니다.');
      onBlock?.(comment.commentId);
    } catch (e) {
      console.error('차단 실패:', e);
      alert('사용자 차단에 실패했습니다.');
    }
  };

  const handleOpenReportModal = () => {
    setSelectedReason('');
    setInputText('');
    setReportModalVisible(true);
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

  const formattedTime = formatDistanceToNow(new Date(comment.updatedAt), {
    addSuffix: true,
    locale: ko,
  });

  const isEdited = comment.updatedAt !== comment.createdAt;

  if (comment.targetFlag === 'Y') {
    return (
      <View style={styles.wrapper}>
        <FastImage
          source={{ uri: profileBucket + comment.profileImageUrl }}
          style={styles.avatar}
        />
        <View style={styles.container}>
          <Text style={styles.restricted}>🔒 사용자 신고로 제재중인 댓글입니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <FastImage
        source={{ uri: profileBucket + comment.profileImageUrl }}
        style={styles.avatar}
      />

      <Animated.View style={[styles.container, highlight && { backgroundColor: '#fffbe8' }, { opacity: fadeAnim }]}>
        <View style={styles.headerRow}>
          <Text style={styles.username}>{comment.username}</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="more-horiz" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {editing ? (
          <TextInput
            value={editText}
            onChangeText={setEditText}
            style={styles.input}
            autoFocus
            multiline
          />
        ) : (
          <Text style={styles.content}>{comment.content}</Text>
        )}

        {editing && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleEditSave}>
              <Text style={styles.action}>저장</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEditCancel}>
              <Text style={styles.action}>취소</Text>
            </TouchableOpacity>
          </View>
        )}

        {!editing && (
          <View style={styles.footerRow}>
            <Text style={styles.timeText}>
              {formattedTime} {isEdited && <Text style={styles.editedTag}>(수정됨)</Text>}
            </Text>

            <TouchableOpacity onPress={onToggleReplies}>
              <Text style={styles.replyToggle}>
                답글 {comment.commentCount}개 {isExpanded ? '숨기기' : '보기'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                onReply({ commentId: comment.commentId, nickname: comment.username })
              }
            >
              <Text style={styles.replyWrite}>답글 작성</Text>
            </TouchableOpacity>
          </View>
        )}

        {isExpanded && (
          <ScrollView style={styles.repliesScroll} nestedScrollEnabled>
            {replies.map((reply) => (
              <View key={reply.replyId} style={styles.replyRow}>
                <ReplyItem
                  reply={reply}
                  currentUsername={currentUsername}
                  highlight={highlightReplyId === reply.replyId}
                  onUpdate={(replyId, content) => onUpdateReply(replyId, content)}
                  onDelete={(replyId) => onDeleteReply(replyId)}
                  onBlock={(replyId) => onBlockReply?.(replyId)}
                  ref={(ref) => {
                    if (ref) {
                      replyRefs[reply.replyId] = ref; // ✅ 핵심 추가
                    }
                  }}
                />
              </View>
            ))}
          </ScrollView>
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
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 6,
    fontSize: 14,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 6,
  },
  action: {
    marginRight: 12,
    color: '#007aff',
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  timeText: {
    fontSize: 11,
    color: '#999',
  },
  editedTag: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  replyToggle: {
    fontSize: 12,
    color: '#666',
  },
  replyWrite: {
    fontSize: 13,
    color: '#007aff',
  },
  repliesScroll: {
    maxHeight: 200,
    marginTop: 12,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  restricted: {
    fontSize: 13,
    color: '#999',
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default CommentItem;
