import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SecondaryButtonProps {
  onPress: () => void;
  title: string;
  selected?: boolean;
  width?: number | `${number}%`;
}

const SecondaryButton = ({ onPress, title, selected, width }: SecondaryButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        selected && styles.selectedButton,
        { width } // Apply the width prop
      ]}
    >
      <Text style={[
        styles.buttonText,
        selected && styles.selectedButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.10)',
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16
  },
  selectedButton: {
    backgroundColor: '#000', // Blue
  },
  selectedButtonText: {
    color: 'white', // Change text color to white when selected
  },
});

export default SecondaryButton;
