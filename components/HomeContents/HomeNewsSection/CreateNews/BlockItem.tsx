import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImageBlock from './ImageBlock';

interface Block {
  id: string;
  type: 'title' | 'text' | 'image';
  content?: string;
  uris?: string[];
  aspectRatios?: number[];
}

interface Props {
  item: Block;
  drag: () => void;
  isActive: boolean;
  onUpdateContent: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

const BlockItem: React.FC<Props> = ({
  item,
  drag,
  isActive,
  onUpdateContent,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      onLongPress={drag}
      disabled={isActive}
      activeOpacity={1}
      style={[styles.blockCard, isActive && { opacity: 0.8 }]}
    >
      {item.type === 'image' && item.uris ? (
        <View style={{ alignItems: 'flex-start' }}>
          <ImageBlock uris={item.uris} aspectRatios={item.aspectRatios} />
        </View>
      ) : (
        <TextInput
          placeholder={item.type === 'title' ? '제목 입력' : '내용 입력'}
          value={item.content}
          onChangeText={(text) => onUpdateContent(item.id, text)}
          style={[styles.input, item.type === 'title' && styles.titleInput]}
          multiline
        />
      )}
      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
        <Icon name="close-circle" size={20} color="#aaa" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  blockCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#eee',
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#222',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
  },
});

export default BlockItem;
