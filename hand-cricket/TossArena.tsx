import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
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

  const [currentScreen, setCurrentScreen] = useState<'choose' | 'flipping' | 'result' | 'chooseAction'>('choose');
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null);
  const [tossResult, setTossResult] = useState<'heads' | 'tails' | null>(null);
  const [userWonToss, setUserWonToss] = useState(false);
  const [chosenAction, setChosenAction] = useState<'bat' | 'ball' | null>(null);
  const [timerProgress, setTimerProgress] = useState(100);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const coinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      setCurrentScreen(won ? 'chooseAction' : 'result');
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
    // Proceed to match start
    setTimeout(() => {
      handleStartMatch();
    }, 300);
  }, [currentScreen, handleStartMatch]);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timerProgress / 100);

  useEffect(() => {
    if (currentScreen === 'choose' || currentScreen === 'chooseAction') {
      // Prevent multiple intervals (strict mode / re-renders)
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeLeft(10);
      setTimerProgress(100);
      const isAction = currentScreen === 'chooseAction';
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            if (isAction) {
              handleActionChoice('bat', true); // default bat
            } else {
              handleTossChoice('heads', true);
            }
            return 0;
          }
          const newTime = prev - 1;
          setTimerProgress((newTime / 10) * 100);
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentScreen, handleTossChoice, handleActionChoice]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.backgroundEffects}>
        <View style={[styles.blurCircle1, { backgroundColor: colors.primary + (isDark ? '15' : '08') }]} />
        <View style={[styles.blurCircle2, { backgroundColor: colors.primary + (isDark ? '08' : '05') }]} />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>TOSS ARENA</Text>
        <View style={[styles.oversBadge, { borderColor: colors.primary, backgroundColor: colors.surface }]}>
          <Text style={[styles.oversText, { color: colors.primary }]}>
            {overs} OVERS MATCH
          </Text>
        </View>
        {currentScreen === 'choose' && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            CHOOSE YOUR SIDE!
          </Text>
        )}
        {currentScreen === 'chooseAction' && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            CHOOSE TO BAT OR BOWL!
          </Text>
        )}
        {currentScreen === 'result' && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {userWonToss ? 'YOU WON THE TOSS!' : 'OPPONENT WON THE TOSS'}
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

        {currentScreen === 'result' && (
          <View style={styles.resultContainer}>
            {/* Show loss result */}
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

            <View style={styles.resultTextContainer}>
              <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
                {tossResult === 'heads' ? 'HEADS' : 'TAILS'}
              </Text>
              <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
                OPPONENT WON THE TOSS
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
    fontStyle: 'italic',
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
});
