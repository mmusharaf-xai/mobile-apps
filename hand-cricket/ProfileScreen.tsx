import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Animated, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useUser } from './UserContext';
import AlertModal from './AlertModal';

const avatars = [
  { name: 'cricket', icon: 'sports-cricket' },
  { name: 'hand', icon: 'front-hand' },
  { name: 'baseball', icon: 'sports-baseball' },
  { name: 'medal', icon: 'military-tech' },
  { name: 'trophy', icon: 'emoji-events' },
];

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user: currentUser, updateUser, logout } = useUser();
  const [editedUsername, setEditedUsername] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalButtons, setModalButtons] = useState<any[]>([]);
  const usernameInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  // Animated value for smooth toggle knob movement
  const switchAnim = useRef(new Animated.Value(2)).current;

  // Use lighter bold weight on iOS for consistent thickness across platforms
  const boldWeight = Platform.OS === 'ios' ? '600' : 'bold';

  // Sync edited fields from context user
  useEffect(() => {
    if (currentUser) {
      setEditedUsername(currentUser.username);
      setEditedEmail(currentUser.email);
      setSelectedAvatar(currentUser.avatar || 0);
    }
  }, [currentUser]);

  // Animate toggle knob on theme change
  useEffect(() => {
    Animated.timing(switchAnim, {
      toValue: isDark ? 26 : 2,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  useEffect(() => {
    if (currentUser) {
      setHasChanges(
        editedUsername !== currentUser.username ||
        editedEmail !== currentUser.email ||
        selectedAvatar !== (currentUser.avatar || 0)
      );
    }
  }, [editedUsername, editedEmail, selectedAvatar, currentUser]);

  const saveChanges = async () => {
    if (!currentUser) return;
    await updateUser({ username: editedUsername, email: editedEmail, avatar: selectedAvatar });
    setHasChanges(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const showModal = (title: string, message: string, buttons: any[]) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalButtons(buttons);
    setModalVisible(true);
  };

  const handleLogout = () => {
    showModal('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        },
        style: 'destructive',
      },
    ]);
  };

  if (!currentUser) return <View />;

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
          <Text style={{ fontSize: 18, fontWeight: boldWeight, color: colors.textPrimary }}>Profile Settings</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Avatar Section */}
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: colors.primary, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '20' }}>
            <MaterialIcons name={avatars[selectedAvatar]?.icon as any} size={60} color={colors.primary} />
          </View>
          <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.surfaceBorder }}>
            <MaterialIcons name="lock" size={16} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>{currentUser.email}</Text>
          </View>
        </View>

        {/* Username */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: boldWeight, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4, marginBottom: 8 }}>Username</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16 }}>
            <TextInput
              ref={usernameInputRef}
              value={editedUsername}
              onChangeText={setEditedUsername}
              style={{ flex: 1, fontSize: 16, color: colors.textPrimary }}
              placeholder="Username"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => usernameInputRef.current?.focus()}>
              <MaterialIcons name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Password */}
        <TouchableOpacity
          onPress={() => navigation.navigate('UpdatePassword')}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 16, padding: 20, marginBottom: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name="key" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: boldWeight, color: colors.textPrimary }}>Change Password</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>Last updated recently</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Dark Mode Toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 16, padding: 20, marginBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceBorder, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name="dark-mode" size={24} color={colors.textMuted} />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: boldWeight, color: colors.textPrimary }}>Dark Mode</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>Currently {isDark ? 'enabled' : 'disabled'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleTheme}>
            <View style={{ width: 48, height: 24, borderRadius: 12, backgroundColor: isDark ? colors.primary : colors.surfaceBorder, position: 'relative' }}>
              <Animated.View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: 'white',
                position: 'absolute',
                top: 2,
                left: switchAnim,
              }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Avatar Selection */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: boldWeight, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Your Avatar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
            {avatars.map((avatar, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedAvatar(index)}
                style={{ marginRight: 16, alignItems: 'center' }}
              >
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: selectedAvatar === index ? 3 : 1,
                  borderColor: selectedAvatar === index ? colors.primary : colors.surfaceBorder,
                  padding: 2,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <View style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 38,
                    backgroundColor: selectedAvatar === index ? colors.primary + '20' : colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MaterialIcons name={avatar.icon as any} size={36} color={selectedAvatar === index ? colors.primary : colors.textMuted} />
                  </View>
                </View>
                {selectedAvatar === index && (
                  <Text style={{ fontSize: 9, fontWeight: boldWeight, color: colors.primary, textTransform: 'uppercase', marginTop: 4 }}>Active</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Footer */}
      <BlurView
        intensity={Platform.OS === 'android' ? 100 : 85}
        tint={isDark ? 'dark' : 'light'}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.surfaceBorder }}
      >
        {hasChanges && (
          <TouchableOpacity
            onPress={saveChanges}
            style={{
              width: '100%',
              height: 56,
              backgroundColor: colors.primary,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              shadowColor: colors.primary,
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '900', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 }}>Save Changes</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleLogout}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 }}
        >
          <MaterialIcons name="logout" size={20} color="#dc2626" />
          <Text style={{ fontSize: 14, fontWeight: boldWeight, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 1 }}>Logout</Text>
        </TouchableOpacity>
      </BlurView>

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