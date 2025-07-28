import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';

const screenWidth = Dimensions.get('window').width;
const horizontalPadding = 16;
const imageGap = 8;

interface Props {
  uris: string[];
}

const ImageBlock: React.FC<Props> = ({ uris }) => {
  const [imageRatio, setImageRatio] = useState(1);

  useEffect(() => {
    if (uris.length === 1) {
      Image.getSize(
        uris[0],
        (width, height) => {
          const ratio = width / height;
          setImageRatio(ratio || 1);
        },
        () => setImageRatio(1)
      );
    }
  }, [uris]);

  const count = uris.length;

  const renderImages = () => {
    switch (count) {
      case 1:
        return (
          <FastImage
            source={{ uri: uris[0] }}
            style={{
              width: screenWidth - horizontalPadding * 2,
              height: (screenWidth - horizontalPadding * 2) / imageRatio,
              borderRadius: 10,
              alignSelf: 'center',
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        );

      case 2:
        return (
          <View style={styles.row}>
            {uris.map((uri, i) => (
              <FastImage
                key={i}
                source={{ uri }}
                style={styles.halfImage}
                resizeMode={FastImage.resizeMode.cover}
              />
            ))}
          </View>
        );

      case 3:
        return (
          <View>
            <FastImage
              source={{ uri: uris[0] }}
              style={styles.fullTopImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.row}>
              {uris.slice(1).map((uri, i) => (
                <FastImage
                  key={i}
                  source={{ uri }}
                  style={styles.halfImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.gridWrapper}>
            {uris.map((uri, i) => (
              <FastImage
                key={i}
                source={{ uri }}
                style={styles.gridImage}
                resizeMode={FastImage.resizeMode.cover}
              />
            ))}
          </View>
        );

      case 5:
        return (
          <View>
            <View style={styles.row}>
              {uris.slice(0, 2).map((uri, i) => (
                <FastImage
                  key={i}
                  source={{ uri }}
                  style={styles.halfImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ))}
            </View>
            <View style={styles.row}>
              {uris.slice(2).map((uri, i) => (
                <FastImage
                  key={i}
                  source={{ uri }}
                  style={styles.thirdImage}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ))}
            </View>
          </View>
        );

      default:
        return (
          <FlatList
            data={uris}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(uri, index) => `${uri}-${index}`}
            renderItem={({ item }) => (
              <FastImage
                source={{ uri: item }}
                style={styles.gridImage}
                resizeMode={FastImage.resizeMode.cover}
              />
            )}
            columnWrapperStyle={styles.flatListRow}
          />
        );
    }
  };

  return <View style={styles.container}>{renderImages()}</View>;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    gap: imageGap,
    marginBottom: imageGap,
  },
  fullTopImage: {
    width: screenWidth - horizontalPadding * 2,
    height: 200,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: imageGap,
  },
  halfImage: {
    flex: 1,
    height: 150,
    borderRadius: 10,
  },
  thirdImage: {
    flex: 1,
    height: 100,
    borderRadius: 10,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridImage: {
    width: (screenWidth - horizontalPadding * 2 - imageGap * 1) / 2,
    height: 140,
    borderRadius: 10,
    marginBottom: imageGap,
    marginHorizontal: imageGap / 2,
  },
  flatListRow: {
    justifyContent: 'space-between',
    marginBottom: imageGap,
  },
});

export default ImageBlock;
