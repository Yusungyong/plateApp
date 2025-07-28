import React from 'react';
import FastImage from 'react-native-fast-image';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { profileBucket } from '../../appComponents/config';

// 글로벌 설정: S3 버킷 URL
const S3_BASE_URL = profileBucket;

const ProfileImage = ({ imageKey, size = 50, style, ...props }) => {
  // imageKey가 없는 경우 아이콘으로 표시
  if (!imageKey) {
    return (
      <View style={[styles.iconContainer, { width: size, height: size, borderRadius: size / 2 }, style]}>
        <Icon name="person-outline" size={size * 0.5} color="#fff" />
      </View>
    );
  }

  // imageKey가 존재하면 S3 URL과 조합하여 최종 URL 생성
  const imageUrl = `${S3_BASE_URL}${imageKey}`;

  return (
    <FastImage
      source={{
        uri: imageUrl,
        cache: FastImage.cacheControl.immutable,
      }}
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }, style]}
      resizeMode={FastImage.resizeMode.cover}
      onError={(error) => {
        console.error('ProfileImage load error: ', error);
      }}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#ccc',
  },
  iconContainer: {
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileImage;
