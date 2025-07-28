import React, { useState } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import BlockList from './BlockList';
import EditorToolbar from './EditorToolbar';
import PreviewModal from './PreviewModal';
import { useApiService } from '../../../../appComponents/apiService';
import { useAuth } from '../../../../appComponents/AuthProvider';
import { useNavigation } from '@react-navigation/native';

interface Block {
  id: string;
  type: 'title' | 'text' | 'image';
  content?: string;
  uris?: string[];
  aspectRatios?: number[];
}

const CustomNewsEditor = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);

  const { apiCall } = useApiService();
  const { username } = useAuth();
  const navigation = useNavigation();

  const addImageBlock = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 0,
    });

    if (result.didCancel) return;

    if (result.assets && result.assets.length > 0) {
      const uris = result.assets.map((asset) => asset.uri).filter(Boolean) as string[];
      const aspectRatios: number[] = new Array(uris.length);

      await Promise.all(
        uris.map((uri, index) =>
          new Promise<void>((resolve) => {
            Image.getSize(
              uri,
              (width, height) => {
                aspectRatios[index] = width / height;
                resolve();
              },
              () => {
                aspectRatios[index] = 1;
                resolve();
              }
            );
          })
        )
      );

      setBlocks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'image',
          uris,
          aspectRatios,
        },
      ]);
    }
  };

  const addTextBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { id: Date.now().toString(), type: 'text', content: '' },
    ]);
  };

  const addTitleBlock = () => {
    setBlocks((prev) => [
      ...prev,
      { id: Date.now().toString(), type: 'title', content: '' },
    ]);
  };

  const updateContent = (id: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content } : block))
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const saveContent = async () => {
    try {
      const titleBlock = blocks.find((b) => b.type === 'title' && b.content?.trim());
      const textBlocks = blocks.filter((b) => b.type === 'text' && b.content?.trim());
      const imageBlocks = blocks.filter((b) => b.type === 'image' && b.uris?.length);

      // ✅ 필수 유효성 검사
      if (!titleBlock) {
        Alert.alert('제목 누락', '제목은 반드시 입력해야 합니다.');
        return;
      }

      if (textBlocks.length === 0) {
        Alert.alert('내용 누락', '텍스트 블록에 최소 한 줄 이상의 내용을 입력해주세요.');
        return;
      }
      
      if (imageBlocks.length === 0) {
        Alert.alert('이미지 누락', '이미지 블록에 최소 한 장 이상의 이미지를 추가해주세요.');
        return;
      }
      
      const combinedText = textBlocks.map((b) => b.content).join('\n\n');
      const formData = new FormData();

      const imageFiles = imageBlocks.flatMap((block) => block.uris || []);

      imageFiles.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `image_${index}.jpg`;
        const type = 'image/jpeg';

        formData.append('images', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: filename,
          type,
        } as any);
      });

      const jsonPayload = {
        title: titleBlock.content,
        content: combinedText,
        placeId: 'sample_place_id',
        postType: 'NEWS',
        startDate: '2025-05-10',
        endDate: '2025-05-20',
        isActive: true,
        username: username || 'anonymous',
        mainContent: blocks,
      };

      formData.append('data', JSON.stringify(jsonPayload));

      await apiCall({
        method: 'POST',
        url: '/api/news/register',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('✅ 등록 완료', '뉴스가 성공적으로 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.navigate('홈'), // ← 여기에 홈 스크린 이름 설정
        },
      ]);
    } catch (error) {
      console.error('❌ 저장 실패:', error.response?.data || error.message);
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <BlockList
            blocks={blocks}
            onBlocksChange={setBlocks}
            onUpdateContent={updateContent}
            onDeleteBlock={deleteBlock}
          />

          <EditorToolbar
            onAddTitle={addTitleBlock}
            onAddText={addTextBlock}
            onAddImage={addImageBlock}
            onOpenPreview={() => setPreviewVisible(true)}
            onSave={saveContent}
          />

          <PreviewModal
            visible={previewVisible}
            onClose={() => setPreviewVisible(false)}
            blocks={blocks}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CustomNewsEditor;
