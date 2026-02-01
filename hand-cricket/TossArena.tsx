import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from './ThemeContext';

export default function TossArena() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.textPrimary, fontSize: 24 }}>Toss Arena</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Coming Soon...</Text>
    </View>
  );
}