import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Animated, Keyboard, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFeedImageViewer } from './useFeedImageViewerData';
import { useAuth } from '../../appComponents/AuthProvider';
import { FeedImageBucket } from '../../appComponents/config';
import CommentModal from './CommentModal';
import LoginRequiredModal from '../../appComponents/LoginRequiredModal';
import BackButton from './BackButton';
import ImageCarousel from './ImageCarousel';
import MetaInfoBar from './MetaInfoBar';
import ActionBar from './ActionBar';
import DotIndicator from './DotIndicator';
import { useFeedLikeHooks } from '../FeedComponents/Hooks/feedItemHooks/useFeedLikeHooks';

const FeedImageViewer: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    feedId,
    username: fromParamUsername,
    scrollToCommentId,
    scrollToReplyId,
    initialIndex = 0,
  } = route.params as any;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [highlightCommentId, setHighlightCommentId] = useState<number | undefined>(scrollToCommentId);
  const [highlightReplyId, setHighlightReplyId] = useState<number | undefined>(scrollToReplyId);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const { fetchFeedImageViewer } = useFeedImageViewer();
  const { axiosFeedLikeCall } = useFeedLikeHooks();
  const { isLoggedIn, role, username: currentUsername } = useAuth();
  const isGuest = role === 'ROLE_GUEST';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const usernameToUse = fromParamUsername || currentUsername || '';
        const result = await fetchFeedImageViewer(feedId, usernameToUse);
        setData(result);
      } catch (e) {
        console.error('피드 이미지 뷰어 로딩 실패:', e);
        Alert.alert('에러', '피드 데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [feedId, fromParamUsername, currentUsername]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (scrollToCommentId || scrollToReplyId) setShowCommentModal(true);
  }, [scrollToCommentId, scrollToReplyId]);

  const handleLikePress = async () => {
    if (!isLoggedIn || isGuest) {
      setLoginModalVisible(true);
      Keyboard.dismiss();
      return;
    }
    if (!data) return;
    try {
      const { updatedLikeCount, updatedLikeYn } = await axiosFeedLikeCall(
        data.id, data.likeYn, data.likeCount
      );
      setData(prev =>
        prev
          ? { ...prev, likeCount: updatedLikeCount, likeYn: updatedLikeYn }
          : prev
      );
    } catch (e) {
      Alert.alert('오류', '좋아요 처리에 실패했습니다.');
    }
  };

  const handleLocationPress = () => {
    if (data?.longitude && data?.latitude) {
      navigation.navigate('지도', {
        initialLatitude: data.latitude,
        initialLongitude: data.longitude,
      });
    }
  };

  // 👇 메뉴 버튼 핸들러 추가
  const handleMenuPress = () => {
    // type, id 구조로 넘김 (Menu 스크린에서 받기)
    navigation.navigate('Menu', { type: 'feed', id: feedId });
  };

  const handleCloseModal = () => {
    setShowCommentModal(false);
    setHighlightCommentId(undefined);
    setHighlightReplyId(undefined);
  };

  if (loading)
    return <ActivityIndicator size="large" color="#fff" style={{ marginTop: 100 }} />;
  if (!data)
    return <Text style={{ color: '#fff', marginTop: 100 }}>데이터를 불러올 수 없습니다.</Text>;

  const images = data.images ? data.images.split(', ').filter(Boolean).map(url => FeedImageBucket + url) : [];
  const tags = data.tags ? data.tags.split('#').filter(Boolean).map(tag => `#${tag}`) : [];
  const liked = data.likeYn === 'Y';

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ImageCarousel
        images={images}
        initialIndex={initialIndex}
        onIndexChange={setCurrentIndex}
      />
      <MetaInfoBar
        profileImageUrl={data.profileImageUrl}
        username={data.username}
        content={data.content}
        tags={tags}
      />
      <ActionBar
        liked={liked}
        likeCount={data.likeCount}
        commentCount={data.commentCount}
        onLikePress={handleLikePress}
        onCommentPress={() => setShowCommentModal(true)}
        onLocationPress={handleLocationPress}
        onMenuPress={handleMenuPress}  // 👈 추가!
      />
      <DotIndicator count={images.length} current={currentIndex} />
      <CommentModal
        visible={showCommentModal}
        onClose={handleCloseModal}
        feedId={feedId}
        highlightCommentId={highlightCommentId}
        highlightReplyId={highlightReplyId}
      />
      <LoginRequiredModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default FeedImageViewer;
