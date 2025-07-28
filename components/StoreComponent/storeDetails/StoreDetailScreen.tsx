import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import StoreImageSlider from './StoreImageSlider';
import StoreTabs from './StoreTabs';
import StoreInfoSection from './StoreInfoSection';
import StoreFeedSection from './StoreFeedSection';
import StoreMenuSection from './StoreMenuSection';
import StoreMapSection from './StoreMapSection';
// import StoreActionButton from './StoreActionButton'; // 리뷰작성 버튼 제거
import { imageBucket, FeedImageBucket } from '../../../appComponents/config';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const TABS = ['정보', '리뷰', '메뉴'];

const StoreDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { item } = route.params;
  
  const thumbnails = (item.thumbnail ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const imageBase =
    item.type === 'video' ? imageBucket : FeedImageBucket;
  const [tab, setTab] = useState(0);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <StoreImageSlider thumbnails={thumbnails} imageBase={imageBase} />
      <StoreTabs tabs={TABS} currentTab={tab} onTabChange={setTab} />

      <View style={styles.card}>
        {tab === 0 && <StoreInfoSection item={item} />}
        {tab === 1 && (
          <StoreFeedSection
            feeds={item.feeds}
            onFeedPress={feed =>
              navigation.navigate('FeedDetailScreen', { feed })
            }
          />
        )}
        {tab === 2 && <StoreMenuSection id={item.id} type={item.type} />}
      </View>

      <StoreMapSection
        latitude={item.latitude}
        longitude={item.longitude}
        name={item.storeName}
      />
      {/* <StoreActionButton onPress={() => alert('리뷰 남기기')} /> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#f6f6f6' },
  container: { alignItems: 'center', paddingBottom: 40, paddingTop: 60 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 16,
    width: width * 0.92,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default StoreDetailScreen;
