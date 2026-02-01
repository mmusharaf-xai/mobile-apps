import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from './ThemeContext';

export default function RankingScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.textPrimary, fontSize: 24 }}>Ranking Screen</Text>
    </View>
  );
}