import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import AlertModal from './AlertModal';

export default function UpdatePassword() {
  const { colors } = useTheme();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleUpdate = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showModal('Error', 'Please fill all fields', [{ text: 'OK', onPress: () => {} }]);
      return;
    }
    if (newPassword !== confirmPassword) {
      showModal('Error', 'New passwords do not match', [{ text: 'OK', onPress: () => {} }]);
      return;
    }
    if (newPassword.length < 8) {
      showModal('Error', 'Password must be at least 8 characters', [{ text: 'OK', onPress: () => {} }]);
      return;
    }

    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser') || '{}');
    if (currentUser.password !== oldPassword) {
      showModal('Error', 'Old password is incorrect', [{ text: 'OK', onPress: () => {} }]);
      return;
    }

    // Update password
    currentUser.password = newPassword;
    await AsyncStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Update in users array
    const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.email === currentUser.email);
    if (index !== -1) {
      users[index].password = newPassword;
      await AsyncStorage.setItem('users', JSON.stringify(users));
    }

    showModal('Success', 'Password updated successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: 50, paddingHorizontal: 24, paddingBottom: 20, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialIcons name="arrow-back-ios" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>Update Password</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Old Password */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4, marginBottom: 8 }}>Old Password</Text>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name="lock" size={20} color={colors.textSecondary} style={{ position: 'absolute', left: 16, top: 14 }} />
            <TextInput
              style={{ width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 24, height: 48, paddingLeft: 48, paddingRight: 24, color: colors.textPrimary, fontSize: 14 }}
              placeholder="Enter old password"
              placeholderTextColor={colors.textMuted}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* New Password */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4, marginBottom: 8 }}>New Password</Text>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name="lock" size={20} color={colors.textSecondary} style={{ position: 'absolute', left: 16, top: 14 }} />
            <TextInput
              style={{ width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 24, height: 48, paddingLeft: 48, paddingRight: 24, color: colors.textPrimary, fontSize: 14 }}
              placeholder="Enter new password"
              placeholderTextColor={colors.textMuted}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Confirm Password */}
        <View style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4, marginBottom: 8 }}>Confirm Password</Text>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name="lock" size={20} color={colors.textSecondary} style={{ position: 'absolute', left: 16, top: 14 }} />
            <TextInput
              style={{ width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 24, height: 48, paddingLeft: 48, paddingRight: 24, color: colors.textPrimary, fontSize: 14 }}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleUpdate}
          style={{
            width: '100%',
            height: 56,
            backgroundColor: colors.primary,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.primary,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 }}>Update Password</Text>
        </TouchableOpacity>
      </ScrollView>

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