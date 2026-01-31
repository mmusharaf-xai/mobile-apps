import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { colors } from './constants';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await AsyncStorage.getItem('currentUser');
      if (currentUser) {
        setUser(JSON.parse(currentUser));
      } else {
        navigation.navigate('Auth' as never);
      }
    };
    checkUser();
  }, []);

  if (!user) {
    return <View />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundDark }}>
      <Text style={{ color: colors.textPrimary, fontSize: 24 }}>Welcome to Home, {user.username}!</Text>
      <Text style={{ color: colors.primary, fontSize: 18 }}>HandCricket Game Coming Soon...</Text>
    </View>
  );
}