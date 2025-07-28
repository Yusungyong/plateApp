import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import ImageBlock from './ImageBlock';

interface Block {
  id: string;
  type: 'title' | 'text' | 'image';
  content?: string;
  uris?: string[];
  aspectRatios?: number[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  blocks: Block[];
}

const PreviewModal: React.FC<Props> = ({ visible, onClose, blocks }) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          {blocks.map((block) => (
            <View key={block.id} style={styles.previewBlock}>
              {block.type === 'image' && block.uris ? (
                <ImageBlock
                  uris={block.uris}
                  aspectRatios={block.aspectRatios}
                />
              ) : (
                <Text
                  style={
                    block.type === 'title'
                      ? styles.previewTitle
                      : styles.previewText
                  }
                >
                  {block.content}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
          <Text style={styles.modalCloseText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 24,
    paddingBottom: 80,
  },
  previewBlock: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PreviewModal;
