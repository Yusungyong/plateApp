import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onAddTitle: () => void;
  onAddText: () => void;
  onAddImage: () => void;
  onOpenPreview: () => void;
  onSave: () => void;
}

const EditorToolbar: React.FC<Props> = ({
  onAddTitle,
  onAddText,
  onAddImage,
  onOpenPreview,
  onSave,
}) => {
  return (
    <View style={styles.toolbar}>
      <TouchableOpacity onPress={onAddTitle} style={styles.textButton}>
        <Text style={styles.textButtonText}>+ 제목</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onAddText} style={styles.textButton}>
        <Text style={styles.textButtonText}>+ 텍스트</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onAddImage} style={styles.textButton}>
        <Text style={styles.textButtonText}>+ 이미지</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onOpenPreview} style={styles.textButton}>
        <Text style={styles.textButtonText}>👁 미리보기</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>✔ 저장</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  textButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  textButtonText: {
    fontSize: 14,
    color: '#444',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default EditorToolbar;
