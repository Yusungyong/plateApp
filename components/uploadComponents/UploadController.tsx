import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CommonLayout from '../../common/CommonLayout';
import CreatePost from '../FeedComponents/CreateFeed/CreatePost';
import SubmitButtonComponent from '../FeedComponents/CreateFeed/SubmitButtonComponent';
import UploadContents from './UploadContents';

const UploadController: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<'feed' | 'video'>('feed');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = useNavigation();

  const createPostRef = useRef<any>(null);
  const uploadContentsRef = useRef<any>(null);

  const options = [
    { label: '피드', value: 'feed' },
    { label: '영상', value: 'video' },
  ];

  const handleSubmit = () => {
    if (selectedOption === 'feed') {
      createPostRef.current?.submit();
    } else {
      uploadContentsRef.current?.submit();
    }
  };

  return (
    <CommonLayout>
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FF7F50" />
          </TouchableOpacity>

          <View style={styles.segmentContainer}>
            {options.map((option) => {
              const isSelected = selectedOption === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.segmentButton, isSelected && styles.segmentButtonSelected]}
                  onPress={() => setSelectedOption(option.value as 'feed' | 'video')}
                >
                  <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 등록 버튼 */}
          <SubmitButtonComponent onPress={handleSubmit} isSubmitting={isSubmitting} />
        </View>

        {/* 본문 영역 */}
        <View style={styles.contentContainer}>
          {selectedOption === 'feed' ? (
            <CreatePost ref={createPostRef} onSubmitStateChange={setIsSubmitting} />
          ) : (
            <UploadContents ref={uploadContentsRef} onSubmitStateChange={setIsSubmitting} />
          )}
        </View>
      </View>
    </CommonLayout>
  );
};

export default UploadController;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF7F50',
    overflow: 'hidden',
  },
  segmentButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  segmentButtonSelected: {
    backgroundColor: '#FF7F50',
  },
  segmentText: {
    fontSize: 16,
    color: '#FF7F50',
  },
  segmentTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
});
