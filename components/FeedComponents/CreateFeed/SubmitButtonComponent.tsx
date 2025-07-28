// SubmitButtonComponent.tsx
import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

interface SubmitButtonProps {
  onPress: () => void;
  isSubmitting: boolean;
}

const SubmitButtonComponent: React.FC<SubmitButtonProps> = ({ onPress, isSubmitting }) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={isSubmitting}>
      {isSubmitting ? (
        <Text style={[styles.submitText, { opacity: 0.5 }]}>작성 중...</Text>
      ) : (
        <Image source={require('../../../images/upload_button_icon.png')} style={styles.uploadButtonIcon} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  submitText: {
    fontSize: 16,
    color: '#FF7F50',
    fontWeight: 'bold',
  },
  uploadButtonIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});

export default SubmitButtonComponent;
