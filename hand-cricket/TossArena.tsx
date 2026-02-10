import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useTheme } from './ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

export default function TossArena() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const overs = (route.params as any)?.overs || 5;

  // Platform-specific adjustments for consistent UI (iOS/Android font/padding; Android fonts render bolder/larger, italic causes truncate)
  const titleFontSize = Platform.OS === 'ios' ? 32 : 24;
  const titleLetterSpacing = Platform.OS === 'ios' ? -1 : -0.8;
  const titleFontStyle = Platform.OS === 'ios' ? 'italic' : 'normal';
  const headerPaddingBottom = Platform.OS === 'ios' ? 40 : 55;
  const subtitleMarginTop = Platform.OS === 'ios' ? 16 : 28;

  const [currentScreen, setCurrentScreen] = useState<'choose' | 'flipping' | 'chooseAction' | 'startMatch' | 'botThinking'>('choose');
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null);
  const [tossResult, setTossResult] = useState<'heads' | 'tails' | null>(null);
  const [userWonToss, setUserWonToss] = useState(false);
  const [chosenAction, setChosenAction] = useState<'bat' | 'ball' | null>(null);
  const [botAction, setBotAction] = useState<'bat' | 'ball' | null>(null);
  const [botTimeLeft, setBotTimeLeft] = useState(3);
  const [timerProgress, setTimerProgress] = useState(100);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const coinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const brainScaleAnim = useRef(new Animated.Value(1)).current;
  const botProgressAnim = useRef(new Animated.Value(0)).current;

  const startCoinFlip = useCallback(() => {
    setCurrentScreen('flipping');
    coinAnim.setValue(0);
    scaleAnim.setValue(0.8);

    Animated.parallel([
      Animated.timing(coinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const isHeads = Math.random() > 0.5;
      const result: 'heads' | 'tails' = isHeads ? 'heads' : 'tails';
      setTossResult(result);
      const won = selectedSide === result || (!selectedSide && result === 'heads');
      setUserWonToss(won);
      setCurrentScreen(won ? 'chooseAction' : 'botThinking');
    });
  }, [coinAnim, scaleAnim, selectedSide]);

  const handleTossChoice = useCallback((side: 'heads' | 'tails', isTimeout = false) => {
    if (currentScreen !== 'choose') return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSelectedSide(side);
    setTimeout(() => {
      startCoinFlip();
    }, 300);
  }, [currentScreen, startCoinFlip]);

  const handleStartMatch = () => {
    navigation.goBack();
  };

  // Handle bat/ball choice (screen 2 when user wins toss)
  const handleActionChoice = useCallback((action: 'bat' | 'ball', isTimeout = false) => {
    if (currentScreen !== 'chooseAction') return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setChosenAction(action);
    // Move to screen 3 summary before match
    setTimeout(() => {
      setCurrentScreen('startMatch');
    }, 300);
  }, [currentScreen]);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timerProgress / 100);

  // Robust 10s timer (precise 1s ticks via ref/timeout; green arc shrinks for both screens)
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (currentScreen !== 'choose' && currentScreen !== 'chooseAction') {
      return;
    }
    setTimeLeft(10);
    setTimerProgress(100);
    const isAction = currentScreen === 'chooseAction';
    let time = 10;
    const tick = () => {
      time -= 1;
      setTimeLeft(time);
      setTimerProgress((time / 10) * 100);
      if (time > 0) {
        timerRef.current = setTimeout(tick, 1000);
      } else {
        if (isAction) {
          handleActionChoice('bat', true); // default bat on screen 2
        } else {
          handleTossChoice('heads', true);
        }
      }
    };
    timerRef.current = setTimeout(tick, 1000); // start after first sec
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentScreen, handleTossChoice, handleActionChoice]);

  // Bot thinking 3s loader on loss then random action to screen 3
  useEffect(() => {
    if (currentScreen !== 'botThinking') return;
    botProgressAnim.setValue(0);
    coinAnim.setValue(0);
    setBotTimeLeft(3);
    Animated.loop(
      Animated.sequence([
        Animated.timing(brainScaleAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(brainScaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    Animated.timing(coinAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
    Animated.timing(botProgressAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      brainScaleAnim.stopAnimation();
      const randomNum = Math.floor(Math.random() * 2) + 1;
      const action: 'bat' | 'ball' = randomNum === 2 ? 'ball' : 'bat';
      setBotAction(action);
      setCurrentScreen('startMatch');
    });
    // countdown 3->1 over 3s
    let time = 3;
    const botTimer = setInterval(() => {
      time -= 1;
      setBotTimeLeft(time);
      if (time <= 1) clearInterval(botTimer);
    }, 1000);
    return () => {
      brainScaleAnim.stopAnimation();
      clearInterval(botTimer);
    };
  }, [currentScreen]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.backgroundEffects}>
        <View style={[styles.blurCircle1, { backgroundColor: colors.primary + (isDark ? '15' : '08') }]} />
        <View style={[styles.blurCircle2, { backgroundColor: colors.primary + (isDark ? '08' : '05') }]} />
      </View>

      <View style={[styles.header, { paddingBottom: headerPaddingBottom }]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: titleFontSize, letterSpacing: titleLetterSpacing, fontStyle: titleFontStyle, textAlign: 'center' }]}>TOSS ARENA</Text>
        <View style={[styles.oversBadge, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
          <Text style={[styles.oversText, { color: colors.primary }]}>
            {overs} OVERS MATCH
          </Text>
        </View>
        {currentScreen === 'choose' && (
          <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: subtitleMarginTop }]}>
            CHOOSE YOUR SIDE!
          </Text>
        )}
        {currentScreen === 'chooseAction' && (
          <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: subtitleMarginTop }]}>
            CHOOSE TO BAT OR BOWL!
          </Text>
        )}
        {currentScreen === 'botThinking' && (
          <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: subtitleMarginTop }]}>
            BOT IS THINKING...
          </Text>
        )}
      </View>

      <View style={styles.main}>
        {currentScreen === 'choose' && (
          <>
            <View style={styles.timerContainer}>
              <View style={[styles.timerCircle, { backgroundColor: colors.surface }]}>
                <Svg width="100" height="100" viewBox="0 0 100 100" style={styles.timerSvg}>
                  <Circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={isDark ? '#234832' : '#e0e0e0'}
                    strokeWidth="6"
                  />
                  <Circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={colors.primary}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </Svg>
                <View style={styles.timerTextContainer}>
                  <Text style={[styles.timerNumber, { color: colors.textPrimary }]}>
                    {timeLeft}
                  </Text>
                  <Text style={[styles.timerSec, { color: colors.primary }]}>SEC</Text>
                </View>
              </View>
            </View>

            <View style={styles.coinContainer}>
              <View style={[styles.coinOuter, { borderColor: colors.primary, backgroundColor: colors.surface, shadowColor: colors.primary }]}>
                <LinearGradient
                  colors={['#ffd700', '#f9a825', '#c67c00']}
                  style={styles.coinInner}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.coinHighlight}>
                    <Text style={styles.coinLetter}>H</Text>
                  </View>
                </LinearGradient>
              </View>
              <Text style={[styles.coinLabel, { color: colors.textMuted }]}>HEADS</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.headsButton, { backgroundColor: colors.primary }]}
                onPress={() => handleTossChoice('heads')}
                activeOpacity={0.9}
              >
                <Text style={[styles.buttonText, { color: colors.textPrimary }]}>HEADS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.tailsButton, { borderColor: isDark ? '#234832' : '#e0e0e0', backgroundColor: 'transparent' }]}
                onPress={() => handleTossChoice('tails')}
                activeOpacity={0.9}
              >
                <Text style={[styles.buttonText, { color: colors.textPrimary }]}>TAILS</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              SELECT YOUR SIDE TO ENTER THE MATCH
            </Text>
          </>
        )}

        {currentScreen === 'chooseAction' && (
          <>
            {/* Timer (reused) */}
            <View style={styles.timerContainer}>
              <View style={[styles.timerCircle, { backgroundColor: colors.surface }]}>
                <Svg width="100" height="100" viewBox="0 0 100 100" style={styles.timerSvg}>
                  <Circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={isDark ? '#234832' : '#e0e0e0'}
                    strokeWidth="6"
                  />
                  <Circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={colors.primary}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </Svg>
                <View style={styles.timerTextContainer}>
                  <Text style={[styles.timerNumber, { color: colors.textPrimary }]}>
                    {timeLeft}
                  </Text>
                  <Text style={[styles.timerSec, { color: colors.primary }]}>SEC</Text>
                </View>
              </View>
            </View>

            {/* Coin showing toss result */}
            <View style={styles.coinContainer}>
              <View style={[styles.coinOuter, { borderColor: colors.primary, backgroundColor: colors.surface, shadowColor: colors.primary }]}>
                <LinearGradient
                  colors={['#ffd700', '#f9a825', '#c67c00']}
                  style={styles.coinInner}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.coinHighlight}>
                    <Text style={styles.coinLetter}>{tossResult === 'tails' ? 'T' : 'H'}</Text>
                  </View>
                </LinearGradient>
              </View>
              <Text style={[styles.coinLabel, { color: colors.textMuted }]}>{tossResult?.toUpperCase()}</Text>
            </View>

            {/* Bat/Ball buttons (screen 2) */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.headsButton, { backgroundColor: colors.primary }]}
                onPress={() => handleActionChoice('bat')}
                activeOpacity={0.9}
              >
                <Text style={[styles.buttonText, { color: colors.textPrimary }]}>BAT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.tailsButton, { borderColor: isDark ? '#234832' : '#e0e0e0', backgroundColor: 'transparent' }]}
                onPress={() => handleActionChoice('ball')}
                activeOpacity={0.9}
              >
                <Text style={[styles.buttonText, { color: colors.textPrimary }]}>BALL</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              SELECT TO ENTER THE MATCH
            </Text>
          </>
        )}

        {currentScreen === 'flipping' && (
          <View style={styles.flippingContainer}>
            <Animated.View
              style={[
                styles.coinOuter,
                {
                  transform: [
                    { scale: scaleAnim },
                    { rotateY: coinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1080deg'] }) },
                  ],
                  shadowColor: colors.primary,
                },
              ]}
            >
              <LinearGradient
                colors={['#ffd700', '#f9a825', '#c67c00']}
                style={styles.coinInner}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.coinHighlight}>
                  <Text style={styles.coinLetter}>{selectedSide === 'tails' ? 'T' : 'H'}</Text>
                </View>
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.flippingText, { color: colors.textPrimary }]}>TOSSING THE COIN...</Text>
          </View>
        )}

        {currentScreen === 'botThinking' && (
          <View style={styles.botThinkingContainer}>
            <View style={styles.resultTextContainer}>
              <Text style={[styles.resultTitle, { color: colors.textPrimary, fontSize: 32 }]}>
                BOT WON THE TOSS
              </Text>
            </View>
            <Animated.View
              style={[
                styles.faintCoin,
                {
                  transform: [{ rotate: coinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
                },
              ]}
            >
              <View style={[styles.coinOuter, { borderColor: colors.primary, backgroundColor: colors.surface, shadowColor: colors.primary, opacity: 0.08 }]}>
                <LinearGradient
                  colors={['#ffd700', '#f9a825', '#c67c00']}
                  style={styles.coinInner}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.coinHighlight}>
                    <Text style={[styles.coinLetter, { opacity: 0.4 }]}>?</Text>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>

            {/* robot with pulsing brain */}
            <View style={styles.robotWrapper}>
              <View style={[styles.robotIconBg, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                <MaterialIcons name="smart-toy" size={110} color={colors.textPrimary} />
              </View>
              <Animated.View
                style={[
                  styles.brainOverlay,
                  { transform: [{ scale: brainScaleAnim }] },
                ]}
              >
                <View style={[styles.brainCircle, { backgroundColor: colors.primary }]}>
                  <MaterialIcons name="psychology" size={38} color="#ffffff" />
                </View>
              </Animated.View>
              <View style={[styles.pingRing, { backgroundColor: colors.primary }]} />
            </View>

            {/* thinking text + dots */}
            <View style={styles.thinkingText}>
              <Text style={[styles.botTitle, { color: colors.textPrimary }]}>BOT IS THINKING...</Text>
              <View style={styles.dots}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.6 }]} />
                <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.3 }]} />
              </View>
            </View>

            {/* progress bar */}
            <View style={styles.progressWrapper}>
              <View style={[styles.progressBg, { backgroundColor: isDark ? colors.surfaceBorder : '#e5e7eb' }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: botProgressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    },
                  ]}
                />
              </View>
            </View>

            {/* centered countdown timer (3->1) + calc text on next line */}
            <View style={styles.infoContainer}>
              <View style={[styles.smallTimer, { backgroundColor: colors.surface }]}>
                <MaterialIcons name="timer" size={18} color={colors.textSecondary} />
                <Text style={[styles.smallTimerText, { color: colors.textSecondary }]}>{botTimeLeft}s</Text>
              </View>
              <Text style={[styles.calcText, { color: colors.textMuted }]}>CALCULATING TOSS PROBABILITIES</Text>
            </View>
          </View>
        )}

        {currentScreen === 'startMatch' && (
          <View style={styles.resultContainer}>
            <View style={[styles.coinOuter, { borderColor: colors.primary, backgroundColor: colors.surface, shadowColor: colors.primary }]}>
              <LinearGradient
                colors={['#ffd700', '#f9a825', '#c67c00']}
                style={styles.coinInner}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.coinHighlight}>
                  <Text style={styles.coinLetter}>
                    {(userWonToss ? chosenAction : botAction) === 'ball' ? 'B' : 'A'}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.resultTextContainer}>
              <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
                {userWonToss
                  ? (chosenAction?.toUpperCase() || 'BAT')
                  : `${(botAction?.toUpperCase() || 'BAT')} (BOT)`}
              </Text>
              <Text style={[styles.resultSubtitle, { color: colors.primary }]}>
                MATCH STARTING...
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={handleStartMatch}
            >
              <Text style={[styles.startButtonText, { color: colors.textPrimary }]}>START MATCH</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.backButton, { borderColor: colors.textSecondary }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>BACK TO HOME</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  backgroundEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  blurCircle1: {
    position: 'absolute',
    top: '-10%',
    left: '-20%',
    width: '140%',
    height: '50%',
    borderRadius: 999,
    opacity: 0.1,
  },
  blurCircle2: {
    position: 'absolute',
    top: '40%',
    right: '-10%',
    width: '80%',
    height: '60%',
    borderRadius: 999,
    opacity: 0.05,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  oversBadge: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  oversText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timerSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  timerNumber: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 36,
  },
  timerSec: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -4,
  },
  coinContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  coinOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 16,
  },
  coinInner: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#fff176',
    overflow: 'hidden',
  },
  coinHighlight: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#fff17640',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  coinLetter: {
    fontSize: 72,
    fontWeight: '900',
    color: '#5d4037',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  coinLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  button: {
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  headsButton: {
    shadowColor: '#19e62b',
  },
  tailsButton: {
    borderWidth: 2,
    shadowColor: 'transparent',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  footerText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  flippingContainer: {
    alignItems: 'center',
  },
  flippingText: {
    marginTop: 40,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  resultContainer: {
    alignItems: 'center',
    width: '100%',
  },
  resultTextContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  resultTitle: {
    fontSize: 48,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  startButton: {
    width: '100%',
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#19e62b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  backButton: {
    width: '100%',
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  botThinkingContainer: {
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  faintCoin: {
    position: 'absolute',
    top: -80,
    opacity: 0.05,
    zIndex: 1,
  },
  robotWrapper: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotIconBg: {
    width: 160,
    height: 160,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  brainOverlay: {
    position: 'absolute',
    top: -20,
    right: -20,
    zIndex: 2,
  },
  brainCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#fff',
  },
  pingRing: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.15,
  },
  thinkingText: {
    alignItems: 'center',
    marginBottom: 30,
  },
  botTitle: {
    fontSize: 26,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressWrapper: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 20,
  },
  progressBg: {
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    shadowColor: '#19e62b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  infoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  smallTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  smallTimerText: {
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calcText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.7,
  },
});
