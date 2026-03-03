import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';
import { useUser } from './UserContext';
import { initDb, matchService } from './db';

const GAME_STATE_KEY = 'handcricket_saved_game';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user, updateUser } = useUser(); // Global user from context (auto-synced)
  const [selectedOvers, setSelectedOvers] = useState(1);
  const [savedGame, setSavedGame] = useState<{ gameState: any; overs: number } | null>(null);
  const navigation = useNavigation();

  // Fetch and cache stats
  const refreshStats = useCallback(async () => {
    if (!user?.userId) return;

    try {
      await initDb();
      const stats = await matchService.getMatchStats(user.userId);
      
      // Update global context and local storage
      const updates = {
        played: stats.totalMatches,
        wins: stats.wins,
      };
      
      await updateUser(updates);
      
      // Explicitly cache in local storage for redundancy/quick access if needed
      await AsyncStorage.setItem(`stats_${user.userId}`, JSON.stringify(updates));
    } catch (error) {
      console.error('Failed to refresh stats:', error);
      
      // Try to load from cache if DB fails
      const cachedStats = await AsyncStorage.getItem(`stats_${user.userId}`);
      if (cachedStats) {
        updateUser(JSON.parse(cachedStats));
      }
    }
  }, [user?.userId, updateUser]);

  // Check for saved game
  const checkSavedGame = useCallback(async () => {
    try {
      const savedGameData = await AsyncStorage.getItem(GAME_STATE_KEY);
      if (savedGameData) {
        const parsed = JSON.parse(savedGameData);
        if (!parsed.gameState?.gameOver) {
          setSavedGame(parsed);
          // Don't auto-select overs - let user choose
        } else {
          setSavedGame(null);
        }
      } else {
        setSavedGame(null);
      }
    } catch (err) {
      console.error('Failed to check saved game:', err);
      setSavedGame(null);
    }
  }, []);

  // Refresh stats and check saved game whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshStats();
      checkSavedGame();
    }, [refreshStats, checkSavedGame])
  );

  // Redirect if no user (in effect to avoid render update error)
  useEffect(() => {
    if (!user) {
      navigation.navigate('Auth' as never);
    }
  }, [user, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: 20, paddingTop: 60, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.primary, overflow: 'hidden', padding: 1 }}>
              {user.avatar !== undefined && user.avatar >= 0 && user.avatar < 5 ? (
                <View style={{ width: '100%', height: '100%', borderRadius: 18, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name={['sports-cricket', 'front-hand', 'sports-baseball', 'military-tech', 'emoji-events'][user.avatar] as any} size={24} color={colors.primary} />
                </View>
              ) : (
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJdcvYai3dXGZ1XFOog2z_7GQ8Of8eY25wGZf2osLzSoVkcgmAmAqAUi7QhWb_MXKihG20Vkt0Y_S4YdFz8Nijc4aF5tM3ZOPlrPS7lcaprvFfsKCvR9J_EXC4FBcMbxm39gD9Im--Ns7ndQOBZ0DWHslaoEqaOKYUtaJhDh28Y8nDDmyt2pSP0FvzKcMU6zYO_FDzB8e0P-D3ql4u_Z9ywcib49dhAKi1_NM_KfdXqr0L_38QLSVIhIyrjI_ZQklZN_mMNPnwlSk' }}
                  style={{ width: '100%', height: '100%', borderRadius: 18 }}
                />
              )}
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.textPrimary }}>{user.username}</Text>
              <Text style={{ fontSize: 10, fontWeight: '900', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 }}>Pro League</Text>
            </View>
          </View>
          <TouchableOpacity
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
            onPress={() => navigation.navigate('GameRules' as never)}
          >
            <MaterialIcons name="menu-book" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>User ID</Text>
            <Text style={{ fontSize: 14, fontWeight: '900', color: isDark ? colors.primary : colors.textPrimary }}>#{user.userId}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>Played</Text>
            <Text style={{ fontSize: 14, fontWeight: '900', color: colors.textPrimary }}>{user.played}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>Wins</Text>
            <Text style={{ fontSize: 14, fontWeight: '900', color: colors.textPrimary }}>{user.wins}</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8 }} contentContainerStyle={{ paddingBottom: 100, gap: 24 }}>
          {/* Bot Match Card */}
          <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 32, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
            <ImageBackground
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc5MWFyJCFXbdfU9goPJ_WWFFGwuHOn3LY3MnX-CCj5BDcfxwqJ2eVmthpa-MtBtVQ2JKIcPGg3kVZtGexdzTvSznKhUJ064lIuKDGKUfFxHDTzrY0Kd-oNXieskKBiQZ-wThDCWEBpb-VyjNfsw2TIC1RexgjoFJ6D4U9lU0WiNB-mOnDPz9KArNrbM_sEaS9QShRmMCf3XxJKX_8JnCUd35JIcCcaEwFy0CzGRMSqkZFdGjO4nJhwPGyIaBax3ZI2Lp4Btn7DYE' }}
              style={{ height: 176, justifyContent: 'flex-end', padding: 16 }}
            >
              <LinearGradient
                colors={['transparent', isDark ? 'rgba(10,26,17,0.9)' : 'rgba(255,255,255,0.8)']}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 100 }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <View style={{ backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 }}>Solo Play</Text>
                </View>
              </View>
              <Text style={{ fontSize: 24, fontWeight: '900', fontStyle: 'italic', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 }}>Bot Match</Text>
            </ImageBackground>
            <View style={{ padding: 20, gap: 20 }}>
              {savedGame && (
                <View style={{ backgroundColor: colors.primary + '15', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.primary + '30' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 }}>Match In Progress</Text>
                      <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                        {savedGame.gameState.userScore} - {savedGame.gameState.botScore} • {savedGame.overs} Overs
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.primary,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 20,
                        shadowColor: colors.primary,
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                      onPress={() => navigation.navigate('GameArena', { overs: savedGame.overs, resume: true })}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '900', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 }}>Resume</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>Select Match Duration</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[1, 3, 5].map((overs) => (
                    <TouchableOpacity
                      key={overs}
                      onPress={() => setSelectedOvers(overs)}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 16,
                        backgroundColor: selectedOvers === overs ? colors.primary : colors.surfaceBorder,
                        borderWidth: 1,
                        borderColor: selectedOvers === overs ? colors.primary : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: selectedOvers === overs ? colors.textPrimary : colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {overs} OVER{overs > 1 ? 'S' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 56,
                  backgroundColor: colors.primary,
                  borderRadius: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colors.primary,
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={async () => {
                  // Clear saved game if starting a new game with different overs
                  if (savedGame && savedGame.overs !== selectedOvers) {
                    await AsyncStorage.removeItem(GAME_STATE_KEY);
                  }
                  navigation.navigate('TossArena', { overs: selectedOvers });
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 }}>Play Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Friend Match Card */}
          <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 32, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, height: 382, position: 'relative', opacity: isDark ? 0.6 : 1 }}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2yu5Qsf0vr3zdYDVK-ASmbtTE6OIUkTm5iWOFwvl1XmgzcQxp6mjPdHBlOS6Zhxi8AeSzOX7XIUX4TFbtVY-MgfMAB3kWTwgpjoOAlU86YU3PN9TkasEivi-ltZX3croXOsvwg5WF4H-o8VhyHbtXZKRQDn6Ee-PO0HK-ZqgrTErc6_2Beg3N8ANuf7SIteep_ApGw3WF4M3T8alEDfMUy1YsbP9o0NOq6DO1vjsW3Cv4LxKYx1U55k2UuPmTVZBIuCOK1LPCLlM' }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3, resizeMode: 'cover' }}
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingTop: 16, paddingBottom: 16 }}>
              <MaterialIcons name="sports-cricket" size={144} color="rgba(0,0,0,0.1)" style={{ transform: [{ scaleX: -1 }] }} />
              <MaterialIcons name="sports-cricket" size={144} color="rgba(0,0,0,0.1)" />
            </View>
            <View style={{ padding: 20, zIndex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', fontStyle: 'italic', color: isDark ? colors.textMuted : colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Friend Match</Text>
              <Text style={{ fontSize: 12, color: isDark ? colors.textMuted : colors.textMuted, marginTop: 4 }}>Play with friends locally or online.</Text>
            </View>
            <View
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 2, backgroundColor: isDark ? 'rgba(10,26,17,0.85)' : 'rgba(255,255,255,0.8)' }}
            >
              <View style={{ alignItems: 'center', gap: 12 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary + '10', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name="lock-clock" size={36} color={colors.primary} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '900', fontStyle: 'italic', color: isDark ? colors.primary : colors.textPrimary, textTransform: 'uppercase', letterSpacing: 1 }}>Coming Soon</Text>
                <Text style={{ fontSize: 10, fontWeight: isDark ? '500' : 'bold', color: isDark ? 'rgba(255,255,255,0.7)' : colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>Multiplayer mode is in development</Text>
              </View>
            </View>
          </View>
        </ScrollView>
    </View>
  );
}