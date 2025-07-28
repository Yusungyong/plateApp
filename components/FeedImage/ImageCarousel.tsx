import React from 'react';
import { FlatList, Dimensions, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');

export default function ImageCarousel({
  images,
  initialIndex,
  onIndexChange,
}) {
  return (
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
        <FastImage
          source={{ uri: item }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.contain}
        />
      )}
      onMomentumScrollEnd={e => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        onIndexChange && onIndexChange(idx);
      }}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width,
    height,
  },
});
