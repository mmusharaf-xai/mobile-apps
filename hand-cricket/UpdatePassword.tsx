import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import AlertModal from './AlertModal';

export default function UpdatePassword() {
  const { colors, isDark } = useTheme();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState<any[]>([]);
  const [passwordError, setPasswordError] = useState('');
  const [strengthScore, setStrengthScore] = useState(0);
  const navigation = useNavigation();

  const showModal = (title: string, message: string, buttons: any[]) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalButtons(buttons);
    setModalVisible(true);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, isValid: false, error: '' };
    const hasLength = password.length >= 8 && password.length <= 16;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
    const score = (hasLength ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
    const error = (score === 4) ? '' : 'Password must be 8-16 characters with at least one number, uppercase letter, and special character.';
    return { score, isValid: score === 4, error };
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    const { score, error } = getPasswordStrength(text);
    setStrengthScore(score);
    setPasswordError(error);
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
    const { isValid } = getPasswordStrength(newPassword);
    if (!isValid) {
      showModal('Error', 'New password does not meet the requirements', [{ text: 'OK', onPress: () => {} }]);
      return;
    }

    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser') || '{}');
    if (currentUser.password !== oldPassword) {
      showModal('Error', 'Old password is incorrect', [{ text: 'OK', onPress: () => {} }]);
      return;
    }

    currentUser.password = newPassword;
    await AsyncStorage.setItem('currentUser', JSON.stringify(currentUser));

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
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>Change Password</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Subtitle */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 8 }}>Update Credentials</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>Ensure your account is using a strong, unique password to stay secure.</Text>
        </View>

        {/* Current Password */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4, marginBottom: 8 }}>Current Password</Text>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name="lock" size={20} color={colors.textSecondary} style={{ position: 'absolute', left: 16, top: 16 }} />
            <TextInput
              style={{ width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 24, height: 56, paddingLeft: 48, paddingRight: 56, color: colors.textPrimary, fontSize: 15 }}
              placeholder="Enter current password"
              placeholderTextColor={colors.textMuted}
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry={!showOldPassword}
            />
            <TouchableOpacity
              onPress={() => setShowOldPassword(!showOldPassword)}
              style={{ position: 'absolute', right: 16, top: 16 }}
            >
              <MaterialIcons
                name={showOldPassword ? 'visibility-off' : 'visibility'}
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4, marginBottom: 8 }}>New Password</Text>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name="lock" size={20} color={colors.textSecondary} style={{ position: 'absolute', left: 16, top: 16 }} />
            <TextInput
              style={{
                width: '100%',
                backgroundColor: passwordError ? (isDark ? '#7f1d1d' : '#fee2e2') : colors.surface,
                borderWidth: 1,
                borderColor: passwordError ? '#ef4444' : colors.inputBorder,
                borderRadius: 24,
                height: 56,
                paddingLeft: 48,
                paddingRight: 56,
                color: colors.textPrimary,
                fontSize: 15,
              }}
              placeholder="Min. 8 characters"
              placeholderTextColor={colors.textMuted}
              value={newPassword}
              onChangeText={handleNewPasswordChange}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={{ position: 'absolute', right: 16, top: 16 }}
            >
              <MaterialIcons
                name={showNewPassword ? 'visibility-off' : 'visibility'}
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {passwordError ? (
            <Text style={{ fontSize: 11, color: '#ef4444', marginTop: 8, marginLeft: 4, lineHeight: 16 }}>
              {passwordError}
            </Text>
          ) : null}

          {/* Strength Slider */}
          {newPassword.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, paddingHorizontal: 4 }}>
              {[1, 2, 3, 4].map((level) => {
                const isFilled = level <= strengthScore;
                const barColor = strengthScore >= 3 ? colors.primary : (strengthScore >= 2 ? '#f59e0b' : '#ef4444');
                return (
                  <View
                    key={level}
                    style={{
                      flex: 1,
                      height: 4,
                      backgroundColor: isFilled ? barColor : colors.surfaceBorder,
                      borderRadius: 999,
                    }}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4, marginBottom: 8 }}>Confirm New Password</Text>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name="lock" size={20} color={colors.textSecondary} style={{ position: 'absolute', left: 16, top: 16 }} />
            <TextInput
              style={{ width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 24, height: 56, paddingLeft: 48, paddingRight: 56, color: colors.textPrimary, fontSize: 15 }}
              placeholder="Repeat new password"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', right: 16, top: 16 }}
            >
              <MaterialIcons
                name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={{ marginBottom: 40, padding: 16, backgroundColor: colors.primary + '15', borderRadius: 16, borderWidth: 1, borderColor: colors.primary + '30', flexDirection: 'row', gap: 12 }}>
          <MaterialIcons name="info" size={24} color={colors.primary} style={{ marginTop: 2 }} />
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18, flex: 1 }}>
            Changing your password will sign you out of all other active sessions on different devices.
          </Text>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          onPress={handleUpdate}
          style={{
            width: '100%',
            height: 56,
            backgroundColor: colors.primary,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            shadowColor: colors.primary,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 }}>Update Password</Text>
          <MaterialIcons name="task-alt" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: '100%',
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Cancel</Text>
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