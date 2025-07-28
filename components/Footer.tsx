import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../appComponents/AuthProvider';
import LoginRequiredModal from '../appComponents/LoginRequiredModal';

export const scrollHandlersRef: any = {
  current: {},
};

const { width } = Dimensions.get('window');
const PLAY_ROUTE = '재생';
const ICON_BASE_PATH = '../images/footerIcon/';

const TABS = [
  {
    key: 'contents', label: '컨텐츠', route: '컨텐츠',
    icons: {
      default: require(`${ICON_BASE_PATH}default_contents_image.png`),
      active:  require(`${ICON_BASE_PATH}active_contents_image.png`),
      white:   require(`${ICON_BASE_PATH}white_contents_image.png`),
    },
  },
  {
    key: 'map', label: '지도', route: '지도',
    icons: {
      default: require(`${ICON_BASE_PATH}default_map_icon.png`),
      active:  require(`${ICON_BASE_PATH}active_map_icon.png`),
      white:   require(`${ICON_BASE_PATH}white_map_icon.png`),
    },
  },
  {
    key: 'home', label: '홈', route: '홈',
    icons: {
      default: require(`${ICON_BASE_PATH}default_home_icon.png`),
      active:  require(`${ICON_BASE_PATH}active_home_icon.png`),
      white:   require(`${ICON_BASE_PATH}white_home_icon.png`),
    },
  },
  {
    key: 'upload', label: '업로드', route: '업로드',
    icons: {
      default: require(`${ICON_BASE_PATH}default_upload_icon.png`),
      active:  require(`${ICON_BASE_PATH}active_upload_icon.png`),
      white:   require(`${ICON_BASE_PATH}white_upload_icon.png`),
    },
  },
  {
    key: 'profile', label: '프로필', route: '프로필',
    icons: {
      default: require(`${ICON_BASE_PATH}default_mypage_icon.png`),
      active:  require(`${ICON_BASE_PATH}active_mypage_icon.png`),
      white:   require(`${ICON_BASE_PATH}white_mypage_icon.png`),
    },
  },
];

const getTabIcon = (icons, isPlaying, isActive, isPlayTab) => {
  if (isPlaying) return isPlayTab ? icons.active : icons.white;
  return isActive ? icons.active : icons.default;
};

const getTabTextStyle = (isPlaying, isPlayTab, isActive) => {
  if (isPlaying) return isPlayTab ? styles.activeTabText : styles.whiteTabText;
  return isActive ? styles.activeTabText : styles.defaultTabText;
};

const Footer = React.memo(({ style }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { role } = useAuth();
  const isGuest = role === 'ROLE_GUEST';
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const isPlaying = route.name === PLAY_ROUTE;

  const handleTabPress = (tabRoute: string) => {
    if (isGuest && (tabRoute === '업로드' || tabRoute === '프로필')) {
      setLoginModalVisible(true);
      return;
    }
    if (route.name === tabRoute) {
      const handler = scrollHandlersRef.current[tabRoute];
      if (handler) handler();
    } else {
      navigation.navigate(tabRoute);
    }
  };

  return (
    <>
      <View style={[styles.container, isPlaying && styles.playingContainer, style]}>
        <View style={styles.tabRow}>
          {TABS.map(tab => {
            const isActive  = route.name === tab.route;
            const isPlayTab = tab.route === PLAY_ROUTE;
            const iconSource = getTabIcon(tab.icons, isPlaying, isActive, isPlayTab);
            const textStyle  = getTabTextStyle(isPlaying, isPlayTab, isActive);

            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => handleTabPress(tab.route)}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
              >
                <Image source={iconSource} style={styles.icon} />
                <Text style={[styles.tabText, textStyle]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <LoginRequiredModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
      />
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0.3,
    borderTopColor: '#000',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  playingContainer: {
    backgroundColor: 'black',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // 탭을 고르게 배치
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // 탭 간 동일한 폭 차지
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginVertical: 2,
  },
  tabText: {
    fontSize: width * 0.03,
    marginTop: 0,
  },
  defaultTabText: {
    color: 'black',
  },
  activeTabText: {
    color: '#FF7F50',
  },
  whiteTabText: {
    color: 'white',
  },
});

export default Footer;
