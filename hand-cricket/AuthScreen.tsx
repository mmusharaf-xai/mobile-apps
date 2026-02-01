import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from './ThemeContext';
import AlertModal from './AlertModal';

const avatars = [
  { name: 'cricket', icon: 'sports-cricket' },
  { name: 'hand', icon: 'front-hand' },
  { name: 'baseball', icon: 'sports-baseball' },
  { name: 'medal', icon: 'military-tech' },
  { name: 'trophy', icon: 'emoji-events' },
];

export default function AuthScreen() {
  const { colors } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
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

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };



  const handleSubmit = async () => {
    if (isLogin) {
      // Login
      if (!email || !password) {
        showModal('Error', 'Please fill all fields', [{ text: 'OK', onPress: () => {} }]);
        return;
      }
      if (!isValidEmail(email)) {
        showModal('Error', 'Please enter a valid email address', [{ text: 'OK', onPress: () => {} }]);
        return;
      }
      if (password.length < 8) {
        showModal('Error', 'Password must be at least 8 characters', [{ text: 'OK', onPress: () => {} }]);
        return;
      }
      const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        setUsername('');
        setEmail('');
        setPassword('');
        setSelectedAvatar(0);
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        showModal('Error', 'Invalid credentials', [{ text: 'OK', onPress: () => {} }]);
      }
    } else {
      // Signup
      if (!username || !email || !password) {
        showModal('Error', 'Please fill all required fields', [{ text: 'OK', onPress: () => {} }]);
        return;
      }
      if (username.length < 3 || username.length > 50) {
        showModal('Error', 'Username must be between 3 and 50 characters', [{ text: 'OK', onPress: () => {} }]);
        return;
      }
      if (!isValidEmail(email)) {
        showModal('Error', 'Please enter a valid email address', [{ text: 'OK', onPress: () => {} }]);
        return;
      }
      if (password.length < 8) {
        showModal('Error', 'Password must be at least 8 characters', [{ text: 'OK', onPress: () => {} }]);
        return;
      }
      const users = JSON.parse(await AsyncStorage.getItem('users') || '[]');
      if (users.some((u: any) => u.email === email)) {
        showModal('Error', 'User already exists', [{ text: 'OK', onPress: () => {} }]);
        return;
      }
      let userId;
      do {
        userId = Math.floor(Math.random() * 90000) + 10000; // Random 5-digit number
      } while (users.some((u: any) => u.userId === userId));
      const newUser = { username, email, password, avatar: selectedAvatar, userId, played: 0, wins: 0 };
      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      setUsername('');
      setEmail('');
      setPassword('');
      setSelectedAvatar(0);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={{ alignItems: 'center', marginTop: 24, paddingHorizontal: 24 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 20 }}>
          <MaterialIcons name="sports-cricket" size={36} color="white" />
        </View>
        <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginTop: 12 }}>HandCricket</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>Enter the digital arena</Text>
      </View>

      {/* Toggle */}
      <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
        <View style={{ height: 44, width: '100%', backgroundColor: colors.surface, borderRadius: 22, padding: 2, borderWidth: 1, borderColor: colors.surfaceBorder, flexDirection: 'row' }}>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: isLogin ? colors.primary : 'transparent' }}
            onPress={() => setIsLogin(true)}
          >
            <Text style={{ color: isLogin ? 'white' : colors.textSecondary, fontSize: 11, fontWeight: 'bold' }}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: !isLogin ? colors.primary : 'transparent' }}
            onPress={() => setIsLogin(false)}
          >
            <Text style={{ color: !isLogin ? 'white' : colors.textSecondary, fontSize: 11, fontWeight: 'bold' }}>Signup</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Form */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {isLogin && (
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>
            Welcome back
          </Text>
        )}

        {!isLogin && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, marginLeft: 4, marginBottom: 8,  }}>Username</Text>
            <View style={{ position: 'relative' }}>
              <MaterialIcons name="account-circle" size={20} color={colors.textSecondary} style={{ position: 'absolute', left: 16, top: 14 }} />
              <TextInput
                style={{ width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 24, height: 48, paddingLeft: 48, paddingRight: 24, color: colors.textPrimary, fontSize: 14,  }}
                placeholder="PitchKing"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>
        )}

        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, marginLeft: 4, marginBottom: 8,  }}>Email Address</Text>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name="alternate-email" size={20} color={colors.textSecondary} style={{ position: 'absolute', left: 16, top: 14 }} />
            <TextInput
              style={{ width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 24, height: 48, paddingLeft: 48, paddingRight: 24, color: colors.textPrimary, fontSize: 14,  }}
              placeholder="player@stadium.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2, marginLeft: 4, marginBottom: 8,  }}>Password</Text>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name="lock" size={20} color={colors.textSecondary} style={{ position: 'absolute', left: 16, top: 14 }} />
            <TextInput
              style={{ width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 24, height: 48, paddingLeft: 48, paddingRight: 24, color: colors.textPrimary, fontSize: 14,  }}
              placeholder="Your secret code"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {!isLogin && (
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2,  }}>Choose Avatar</Text>
              <Text style={{ color: colors.primary, fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1,  }}>Swipe</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -8, paddingHorizontal: 8 }}>
              {avatars.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ marginHorizontal: 8, marginVertical: 4 }}
                  onPress={() => setSelectedAvatar(index)}
                >
                  <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: selectedAvatar === index ? colors.primary : 'transparent', padding: 2, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <View style={{ width: '100%', height: '100%', borderRadius: 30, backgroundColor: selectedAvatar === index ? colors.primary + '20' : '#ffffff08', alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialIcons name={avatar.icon as any} size={36} color={selectedAvatar === index ? colors.primary : colors.textMuted} />
                    </View>
                  </View>
                  {selectedAvatar === index && (
                    <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.primary, borderRadius: 8, padding: 2 }}>
                      <MaterialIcons name="check" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 }}>
        <TouchableOpacity
          style={{ width: '100%', height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}
          onPress={handleSubmit}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'black', textTransform: 'uppercase', letterSpacing: 1 }}>
            {isLogin ? 'Login' : 'Start Playing'}
          </Text>
          <MaterialIcons name="sports-cricket" size={20} color="white" />
        </TouchableOpacity>
        <Text style={{ color: colors.textSecondary, fontSize: 9, textAlign: 'center', marginTop: 24,  }}>
          {isLogin ? 'New to the game? ' : 'Already on the squad? '}
          <Text style={{ color: colors.primary, fontWeight: 'bold', textDecorationLine: 'underline' }} onPress={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Signup' : 'Login'}
          </Text>
        </Text>
      </View>

      {/* Bottom indicator */}
      <View style={{ alignItems: 'center', paddingBottom: 8 }}>
        <View style={{ width: 128, height: 4, backgroundColor: '#ffffff20', borderRadius: 2 }} />
      </View>

      <AlertModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        buttons={modalButtons}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}