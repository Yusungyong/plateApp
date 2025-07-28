import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  UIManager,
  Animated,
  Easing,
  SafeAreaView,
} from 'react-native';
import { useApiService } from '../../appComponents/apiService';
import Icon from 'react-native-vector-icons/Ionicons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const groupMenusByTitle = (menus) => {
  const groups = {};
  menus.forEach((menu) => {
    const title = menu.menuTitle || '기타';
    if (!groups[title]) groups[title] = [];
    groups[title].push(menu);
  });
  return Object.keys(groups).map((title) => ({
    title,
    items: groups[title],
  }));
};

const getFormattedPrice = (price) => {
  if (!price) return '가격문의';
  if (typeof price === 'number') {
    return `${price.toLocaleString()}원`;
  }
  if (/^\d+$/.test(price)) {
    return `${parseInt(price, 10).toLocaleString()}원`;
  }
  return price;
};

const AnimatedAccordion = ({ open, children }) => {
  const animatedHeight = React.useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(null);

  const onLayout = (e) => {
    const h = e.nativeEvent.layout.height;
    if (!contentHeight && h > 0) setContentHeight(h);
  };

  useEffect(() => {
    if (contentHeight !== null) {
      if (open) {
        Animated.timing(animatedHeight, {
          toValue: contentHeight,
          duration: 330,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [open, contentHeight]);

  // 처음엔 auto, 이후엔 height로!
  if (contentHeight === null) {
    return (
      <View onLayout={onLayout}>
        {open ? children : null}
      </View>
    );
  }
  return (
    <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
      {children}
    </Animated.View>
  );
};


const MenuContents = ({ route, navigation }) => {
  const { type, id } = route.params; // type, id로 받음!
  const [menuData, setMenuData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openedSections, setOpenedSections] = useState({});

  const { apiCall } = useApiService();

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const data = await apiCall({
          url: 'get-feed-menu',
          method: 'POST',
          data: { type, id }, // type, id로 요청!
        });
        setMenuData(data);
      } catch (error) {
        setError(error.message || '메뉴 정보를 불러오지 못했습니다.');
        Alert.alert('Error', error.message || '메뉴 정보를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [type, id, apiCall]);

  const groupedMenus = useMemo(() => groupMenusByTitle(menuData), [menuData]);

  const toggleSection = (title) => {
    setOpenedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#FDA085" style={{ flex: 1, marginTop: 80 }} />;
  }

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Text style={{ color: '#e74c3c', fontSize: 15 }}>Error: {error}</Text>
      </View>
    );
  }

  if (!groupedMenus || groupedMenus.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="restaurant-outline" size={72} color="#bbb" />
        <Text style={styles.emptyText}>등록된 메뉴가 없습니다</Text>
      </View>
    );
  }

  // idx, groupTitle까지 받아서 key 생성!
  const renderMenuItem = (item, idx, groupTitle) => (
    <View style={styles.menuCard} key={`${groupTitle}_${item.menuName}_${idx}`}>
      <View style={styles.menuItemRow}>
        <Text
          style={styles.menuName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.menuName}
        </Text>
        <Text
          style={item.price ? styles.menuPrice : styles.menuNoPrice}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {getFormattedPrice(item.price)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단에 뒤로가기 버튼 들어갈 영역 */}
      <View style={styles.headerBox}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 18 }}
        >
          <Icon name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>메뉴 정보</Text>
        <View style={{ width: 30 }} />
      </View>
      <FlatList
        data={groupedMenus}
        keyExtractor={(item, idx) => `${item.title}_${idx}`}
        renderItem={({ item, index }) => (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={[
                styles.sectionHeader,
                openedSections[item.title] && styles.sectionHeaderOpen,
              ]}
              onPress={() => toggleSection(item.title)}
              activeOpacity={0.82}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  name="fast-food-outline"
                  size={20}
                  color={openedSections[item.title] ? "#FDA085" : "#bbb"}
                  style={{ marginRight: 7 }}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    openedSections[item.title] && { color: '#FDA085' }
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
              </View>
              <Icon
                name={openedSections[item.title] ? "chevron-up" : "chevron-down"}
                size={23}
                color={openedSections[item.title] ? "#FDA085" : "#bbb"}
              />
            </TouchableOpacity>
            <AnimatedAccordion open={!!openedSections[item.title]} style={styles.menuList}>
              {item.items.map((menuItem, idx) =>
                renderMenuItem(menuItem, idx, item.title)
              )}
            </AnimatedAccordion>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 8,
    marginBottom: 6,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 14,
    borderRadius: 13,
    overflow: 'hidden',
    shadowColor: '#aaa',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9fa',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeaderOpen: {
    backgroundColor: '#FFF6F0',
    borderBottomColor: '#FDA085',
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 0.4,
    maxWidth: 210,
  },
  menuList: {
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    paddingBottom: 6,
    paddingTop: 2,
  },
  menuCard: {
    borderBottomColor: '#f2f2f2',
    borderBottomWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuName: {
    fontSize: 15.5,
    color: '#212121',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  menuPrice: {
    fontSize: 15.5,
    color: '#FDA085',
    fontWeight: 'bold',
    marginLeft: 10,
    minWidth: 64,
    maxWidth: 110,
    textAlign: 'right',
  },
  menuNoPrice: {
    fontSize: 15.5,
    color: '#bbb',
    fontStyle: 'italic',
    marginLeft: 10,
    minWidth: 64,
    maxWidth: 110,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 21,
    color: '#bbb',
    marginTop: 12,
    fontWeight: 'bold',
  },
});

export default MenuContents;
