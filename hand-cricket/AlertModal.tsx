import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from './constants';

interface Button {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: Button[];
  onClose: () => void;
}

export default function AlertModal({ visible, title, message, buttons, onClose }: AlertModalProps) {
  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return { backgroundColor: '#dc3545' }; // Red for destructive
      case 'cancel':
        return { backgroundColor: colors.surface };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getButtonTextColor = (style?: string) => {
    switch (style) {
      case 'destructive':
        return colors.textPrimary;
      case 'cancel':
        return colors.textPrimary;
      default:
        return colors.backgroundDark;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <MaterialIcons name="warning" size={24} color={colors.primary} />
            <Text style={styles.title}>{title}</Text>
          </View>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, getButtonStyle(button.style)]}
                onPress={() => {
                  button.onPress();
                  onClose();
                }}
              >
                <Text style={[styles.buttonText, { color: getButtonTextColor(button.style) }]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});