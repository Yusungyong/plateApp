import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import FeedItemHeader from './FeedItemHeader';
import FeedItemFooter from './FeedItemFooter';
import FeedItemImages from './FeedItemImages';
import FeedContentText from './FeedContentText';
import FeedMoreOptionsModal from './FeedMoreOptionsModal';
import ReportReasonModal from './ReportReasonModal';
import { useSubmitReport } from './useSubmitReport';
import { useBlockUser } from './useBlockUser';

const FeedItem = React.memo(({ item }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [localTargetFlag, setLocalTargetFlag] = useState(item.targetFlag);
  const navigation = useNavigation();
  const { submitReport } = useSubmitReport();
  const { blockUser } = useBlockUser();

  useEffect(() => {
    const getUsername = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        setCurrentUser(username);
      } catch (error) {
        console.error('Error getting username from AsyncStorage:', error);
      }
    };
    getUsername();
  }, []);

  const handleModalOpen = (target) => {
    setSelectedTarget(target);
    setModalVisible(true);
  };

  const handleReport = () => {
    setModalVisible(false);
    setReasonModalVisible(true);
  };

  const handleSubmitReason = async (reason: string) => {
    setReasonModalVisible(false);

    if (!currentUser || !selectedTarget) return;

    const reportPayload = {
      reporterUsername: currentUser,
      targetUsername: selectedTarget.username,
      targetType: 'feed',
      targetId: selectedTarget.id,
      reason,
      submittedAt: new Date().toISOString(),
    };

    try {
      await submitReport(reportPayload);
      console.log('📤 신고 전송 완료', reportPayload);
      setLocalTargetFlag('Y');
    } catch (e) {
      console.error('🚨 신고 전송 실패:', e);
    }
  };

  const handleBlock = async () => {
    if (!currentUser || !selectedTarget?.username) return;

    try {
      const payload = {
        blockerUsername: currentUser,
        blockedUsername: selectedTarget.username,
        blockedAt: new Date().toISOString(),
      };

      await blockUser(payload);
      alert(`${selectedTarget.username}님을 차단했습니다.`);
    } catch (e) {
      console.error('🚫 사용자 차단 실패:', e);
    }

    setModalVisible(false);
  };

  return (
    <View style={styles.feedItem}>
      {localTargetFlag === 'Y' ? (
        <View style={styles.blockedContainer}>
          <Text style={styles.blockedText}>🚫 사용자 신고로 제재중인 컨텐츠입니다.</Text>
        </View>
      ) : (
        <>
          <FeedItemHeader
            feedData={item}
            currentUser={currentUser}
            onModalOpen={() => handleModalOpen(item)}
          />
          {/* feedId, username props 추가! */}
          <FeedItemImages
            images={item.images}
            feedId={item.id}
            username={item.username}
          />
          <FeedContentText
            nickName={item.nickName}
            content={item.content}
            tags={item.tags}
            onModalOpen={() => handleModalOpen(item)}
          />
          <FeedItemFooter
            feedData={item}
            onModalOpen={() => handleModalOpen(item)}
          />
        </>
      )}

      <FeedMoreOptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onReport={handleReport}
        onBlock={handleBlock}
      />

      <ReportReasonModal
        visible={reasonModalVisible}
        onClose={() => setReasonModalVisible(false)}
        onSubmit={handleSubmitReason}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  feedItem: {
    backgroundColor: 'white',
    marginVertical: 8,
    paddingTop: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderRadius: 8,
    overflow: 'hidden',
  },
  blockedContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedText: {
    fontSize: 16,
    color: '#888',
  },
});

export default FeedItem;
