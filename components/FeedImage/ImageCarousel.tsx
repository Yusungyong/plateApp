import React from 'react';
import { FlatList, Dimensions, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient'; // npm install react-native-linear-gradient

const { width, height } = Dimensions.get('window');

export default function ImageCarousel({ images, initialIndex, onIndexChange }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* 위쪽 그라데이션 */}
      <LinearGradient
        colors={['#000', 'rgba(0,0,0,0)']}
        style={[
          styles.gradientTop,
          { height: Math.max(60, insets.top + 30), width }
        ]}
        pointerEvents="none"
      />
      {/* 아래쪽 그라데이션 */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', '#000']}
        style={[
          styles.gradientBottom,
          { height: Math.max(60, insets.bottom + 30), width, bottom: 0 }
        ]}
        pointerEvents="none"
      />

      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, idx) => ({
          length: width,
          offset: width * idx,
          index: idx,
        })}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.imageWrapper}>
            <FastImage
              source={{ uri: item }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.contain} // 원본 비율 최대
            />
          </View>
        )}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          onIndexChange && onIndexChange(idx);
        }}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  imageWrapper: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width,
    height,
    alignSelf: 'center',
    backgroundColor: '#000',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    zIndex: 2,
  },
});
