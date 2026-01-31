import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from './constants';
import AlertModal from './AlertModal';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState<any[]>([]);
  const navigation = useNavigation();

  const showModal = (title: string, message: string, buttons: any[]) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalButtons(buttons);
    setModalVisible(true);
  };

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

  const handleLogout = () => {
    showModal('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('currentUser');
          navigation.navigate('Auth' as never);
        },
        style: 'destructive',
      },
    ]);
  };

  if (!user) {
    return <View />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary, fontSize: 24, textAlign: 'center' }}>Welcome to Home, {user.username}!</Text>
        <Text style={{ color: colors.primary, fontSize: 18, textAlign: 'center', marginTop: 8 }}>HandCricket Game Coming Soon...</Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <TouchableOpacity
          style={{ width: '100%', height: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <AlertModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        buttons={modalButtons}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}