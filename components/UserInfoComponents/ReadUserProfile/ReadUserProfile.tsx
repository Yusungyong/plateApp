import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import useUserProfilePodlist from './useUserProfilePodList';
import UserProfileHeader from './UserProfileHeader';
import ProfileImageModal from './ProfileImageModal';
import PostGrid from './PostGrid';      
import FeedGrid from './FeedGrid';      
import UserMapView from './UserMapView'; 

const ReadUserProfile = ({ route, navigation }) => {
  const username = route.params?.user?.username;
  const [modalVisible, setModalVisible] = useState(false);
  // 'video' | 'feed' | 'map' 으로 확장
  const [selectedTab, setSelectedTab] = useState<'video' | 'feed' | 'map'>('video');
  const { data, loading, error, createUserProfilePodlist } = useUserProfilePodlist();

  useEffect(() => {
    createUserProfilePodlist(username).catch(console.error);
  }, []);

  const user = data?.user;
  const videos = data?.videos || [];
  const feeds = data?.feeds || [];

  return (
    <View style={styles.container}>
      {user && (
        <UserProfileHeader
          user={user}
          selectedTab={selectedTab}
          onProfileImagePress={() => setModalVisible(true)}
          onTabPress={setSelectedTab}
        />
      )}

      {/* 영상 탭 */}
      {selectedTab === 'video' && (
        <PostGrid
          posts={videos}
          loading={loading}
          error={error}
          onPress={post =>
            navigation.navigate('재생', {
              storeId: post.storeId,
              passedUsername: post.username,
            })
          }
        />
      )}

      {/* 피드 탭 */}
      {selectedTab === 'feed' && (
        <FeedGrid
          feeds={feeds}
          loading={loading}
          error={error}
          onPress={feed =>
            navigation.navigate('FeedImageViewer', {
              feedId: feed.feedId, username : 'su12ng'
            })
          }
        />
      )}

      {/* 지도 탭 - 여기가 추가된 부분! */}
      {selectedTab === 'map' && user && (
        <UserMapView
          latitude={user.latitude}
          longitude={user.longitude}
          regionName={user.activeRegion}
          markerLabel={user.nickName}
        />
      )}

      <ProfileImageModal
        visible={modalVisible}
        imageUrl={user?.profileImageUrl}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 32 },
});

export default ReadUserProfile;
