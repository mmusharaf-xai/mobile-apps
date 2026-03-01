import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useUser } from './UserContext';

interface GameCompletionParams {
  overs: number;
  userScore: number;
  userWickets: number;
  botScore: number;
  botWickets: number;
  userOvers: number;
  userBalls: number;
  botOvers: number;
  botBalls: number;
  winner: 'user' | 'bot' | null;
}

export default function GameCompletion() {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  const {
    overs,
    userScore,
    userWickets,
    botScore,
    botWickets,
    userOvers,
    userBalls,
    botOvers,
    botBalls,
    winner,
  } = (route.params || {}) as GameCompletionParams;

  const title = winner === 'user' ? 'Congratulations!' : 'Good Effort!';
  const resultLine = winner === 'user'
    ? `You Won By ${Math.max(userScore - botScore, 1)} Runs`
    : `Bot Won By ${Math.max(botScore - userScore, 1)} Runs`;

  const oversPlayed = useMemo(() => {
    const userInnings = `${userOvers}.${userBalls}`;
    const botInnings = `${botOvers}.${botBalls}`;
    return winner === 'user' ? `${userInnings} / ${overs}` : `${botInnings} / ${overs}`;
  }, [botBalls, botOvers, overs, userBalls, userOvers, winner]);

  const userAvatar = user?.avatar !== undefined && user.avatar >= 0 && user.avatar < 5
    ? ['sports-cricket', 'front-hand', 'sports-baseball', 'military-tech', 'emoji-events'][user.avatar]
    : null;

  const isAndroid = Platform.OS === 'android';
  const pageBackground = isDark ? '#0a1a11' : '#f0f4f8';
  const safeAreaBackground = isAndroid && !isDark ? '#ffffff' : pageBackground;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeAreaBackground }]}
    >
      {isAndroid && (
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={safeAreaBackground} />
      )}
      <View style={styles.backgroundEffects}>
        <View style={[styles.stadiumGradient, { backgroundColor: pageBackground }]} />
        {!isAndroid && <View style={[styles.dotPattern, { borderColor: colors.primary + '20' }]} />}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.glassPanel, { backgroundColor: isDark ? 'rgba(20,40,29,0.7)' : (isAndroid ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.5)'), borderColor: isDark ? 'rgba(100,150,120,0.35)' : 'rgba(255,255,255,0.7)' }]}
        >
          <View style={styles.trophyWrap}>
            <LinearGradient
              colors={[colors.primary, '#22c55e']}
              style={styles.trophyGradient}
            >
              <MaterialIcons name="emoji-events" size={48} color="#fff" />
            </LinearGradient>
            <View style={[styles.trophyBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)' }]}
            >
              <MaterialIcons name="star" size={16} color={colors.primary} />
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.resultLine, { color: colors.primary }]}>{resultLine}</Text>
          </View>

          <View style={[styles.scoreCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : (isAndroid ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.2)'), borderColor: isDark ? 'rgba(255,255,255,0.12)' : (isAndroid ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)') }]}
          >
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Your Score</Text>
              <Text style={[styles.scoreValue, { color: colors.textPrimary }]}>{userScore}/{userWickets}</Text>
            </View>
            <View style={[styles.scoreDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)' }]} />
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Bot Score</Text>
              <Text style={[styles.scoreValue, { color: colors.textPrimary }]}>{botScore}/{botWickets}</Text>
            </View>
            <View style={[styles.scoreDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)' }]} />
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Overs Played</Text>
              <Text style={[styles.scoreValue, { color: colors.textPrimary }]}>{oversPlayed}</Text>
            </View>
          </View>

          <View style={styles.avatarRow}>
            <View style={styles.avatarColumn}>
              <View style={[styles.avatarFrame, { borderColor: '#fff' }]}
              >
                {userAvatar ? (
                  <View style={[styles.avatarIconWrap, { backgroundColor: colors.primary + '20' }]}>
                    <MaterialIcons name={userAvatar as any} size={32} color={colors.primary} />
                  </View>
                ) : (
                  <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmmXZVo4op-z_y54Iq6tbd0otBBx5DjkZ2nb58iaRruLzm1RRZj2V7MgFydokNPhOKNwSmzTfSy_v09S_3DTVk1G_Xd0G_F-0ScGu1-D8JDa4G4WIffdpcnWPDPzVnwvLgC6dQWPQ7xJN0e-wWyMYDWWsonOfWdKTL3wLS1B_d15NcVX_aPAYlXhxsJtxYCper0P7kBmhwzZlul2Ssw2WKK6DkgAxJ5V5al47EsHM2Q8_4dmnAMqeNAlZcn-HLLUKd8b9CM6xCAfs' }}
                    style={styles.avatarImg}
                  />
                )}
              </View>
              <Text style={[styles.avatarLabel, { color: colors.textMuted }]}>Champion</Text>
            </View>
            <View style={[styles.avatarDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }]} />
            <View style={[styles.avatarColumn, { opacity: 0.6 }]}
            >
              <View style={styles.avatarFrame}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgs9rTYN-r7F98qrKwAy0rlWn1NuuX0pCnoBF64V2HIemkI5uoTSe2YEZt6P99zdxrqHwI6YA--D5Q0YbAzivcLW62ghUpS5jG0VzWxHH-BkTeFAgyVlroEaLUCkJhbGuY25We5-4Cx_TSPA0SvhNbK34S-JxtQn03gSWiVzbIVN4o_GksFci0dv_5DeUv9zwzOm_PbKJQj5ZWk4oEbVOEXVKOZrwJvthV5nAPJpIltOf4AKmTblctVpJlx70b_TSc-VKUDl6WL9E' }}
                  style={[styles.avatarImg, styles.avatarGray]}
                />
              </View>
              <Text style={[styles.avatarLabel, { color: colors.textMuted }]}>Runner Up</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionStack}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={() => navigation.replace('GameArena' as never, { overs } as never)}
          >
            <MaterialIcons name="replay" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>PLAY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)' }]}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] })}
          >
            <MaterialIcons name="home" size={22} color={colors.textPrimary} />
            <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>GO HOME</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stadiumGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dotPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 0.5,
    borderStyle: 'dotted',
    opacity: 0.15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 20,
  },
  glassPanel: {
    borderRadius: 40,
    padding: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 4,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  trophyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  trophyGradient: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#19e62b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
  },
  trophyBadge: {
    position: 'absolute',
    top: -6,
    right: 90,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  titleBlock: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultLine: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreCard: {
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scoreDivider: {
    height: 1,
    opacity: 0.6,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  avatarFrame: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  avatarGray: {
    opacity: 0.6,
  },
  avatarIconWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  avatarDivider: {
    height: 1,
    flex: 1,
    marginHorizontal: 10,
  },
  actionStack: {
    gap: 14,
  },
  primaryButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
