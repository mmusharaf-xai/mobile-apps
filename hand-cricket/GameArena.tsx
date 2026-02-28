import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from './ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GameState {
  userScore: number;
  userWickets: number;
  botScore: number;
  botWickets: number;
  userOvers: number;
  userBalls: number;
  botOvers: number;
  botBalls: number;
  target: number | null;
  isFirstInnings: boolean;
  userBatting: boolean;
}

export default function GameArena() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const overs = (route.params as any)?.overs || 5;

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    userScore: 24,
    userWickets: 1,
    botScore: 0,
    botWickets: 0,
    userOvers: 1,
    userBalls: 4,
    botOvers: 0,
    botBalls: 0,
    target: 48,
    isFirstInnings: false,
    userBatting: true,
  });

  // Timer state
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerProgress, setTimerProgress] = useState(100);
  const [userSelectedNumber, setUserSelectedNumber] = useState<number | null>(null);
  const [botSelectedNumber, setBotSelectedNumber] = useState<number | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timerProgress / 100);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Don't start timer if waiting for bot or user has selected
    if (isBotThinking || userSelectedNumber !== null) {
      return;
    }

    setTimeLeft(10);
    setTimerProgress(100);
    
    let time = 10;
    const tick = () => {
      time -= 1;
      setTimeLeft(time);
      setTimerProgress((time / 10) * 100);
      if (time > 0) {
        timerRef.current = setTimeout(tick, 1000);
      } else {
        // Auto-select random number when timer runs out
        handleMoveSelect(Math.floor(Math.random() * 6) + 1);
      }
    };
    timerRef.current = setTimeout(tick, 1000);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isBotThinking, userSelectedNumber]);

  const handleMoveSelect = useCallback((number: number) => {
    if (userSelectedNumber !== null || isBotThinking) return;
    
    // Clear timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setSelectedMove(number);
    setUserSelectedNumber(number);
    setIsBotThinking(true);

    // Bot selects after a delay (simulating thinking)
    botTimerRef.current = setTimeout(() => {
      const botNumber = Math.floor(Math.random() * 6) + 1;
      setBotSelectedNumber(botNumber);
      setIsBotThinking(false);
      
      // Reset for next turn after showing result
      setTimeout(() => {
        setUserSelectedNumber(null);
        setBotSelectedNumber(null);
        setSelectedMove(null);
      }, 2000);
    }, 1500);
  }, [userSelectedNumber, isBotThinking]);

  const getCurrentScore = () => {
    if (gameState.userBatting) {
      return `${gameState.userScore}/${gameState.userWickets}`;
    }
    return `${gameState.botScore}/${gameState.botWickets}`;
  };

  const getCurrentOvers = () => {
    if (gameState.userBatting) {
      return `(${gameState.userOvers}.${gameState.userBalls}/${overs})`;
    }
    return `(${gameState.botOvers}.${gameState.botBalls}/${overs})`;
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: isDark ? 'rgba(10,26,17,0.95)' : 'rgba(255,255,255,0.95)' }]}>
      <View style={styles.headerContent}>
        <MaterialIcons name="sports-cricket" size={28} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Game Arena</Text>
      </View>
    </View>
  );

  const renderLiveScoreCard = () => (
    <View style={[styles.scoreCard, { 
      backgroundColor: isDark ? 'rgba(20,42,29,0.6)' : 'rgba(255,255,255,0.6)',
      borderColor: isDark ? colors.surfaceBorder : 'rgba(255,255,255,0.6)',
    }]}>
      <View style={styles.scoreCardContent}>
        <View style={styles.scoreLeft}>
          <Text style={[styles.liveLabel, { color: colors.primary }]}>LIVE SCOREBOARD</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreMain, { color: colors.textPrimary }]}>
              {getCurrentScore()}
            </Text>
            <Text style={[styles.scoreOvers, { color: colors.textSecondary }]}>
              {getCurrentOvers()}
            </Text>
          </View>
          {!gameState.isFirstInnings && gameState.target && (
            <View style={[styles.targetBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <Text style={[styles.targetText, { color: colors.textSecondary }]}>
                Target: {gameState.target} runs
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.stadiumImage, { borderColor: isDark ? colors.surfaceBorder : 'rgba(255,255,255,0.6)' }]}>
          <MaterialIcons name="stadium" size={48} color={colors.primary} />
        </View>
      </View>
    </View>
  );

  const renderYouVsBot = () => (
    <View style={[styles.vsCard, { 
      backgroundColor: isDark ? 'rgba(20,42,29,0.6)' : 'rgba(255,255,255,0.6)',
      borderColor: isDark ? colors.surfaceBorder : 'rgba(255,255,255,0.6)',
    }]}>
      <Text style={[styles.vsLabel, { color: colors.textSecondary }]}>YOU vs BOT</Text>
      
      <View style={styles.vsContent}>
        {/* User Side */}
        <View style={styles.playerSide}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarGradient, { 
              backgroundColor: gameState.userBatting ? colors.primary : colors.surfaceBorder 
            }]}>
              <View style={[styles.avatarInner, { backgroundColor: colors.surface }]}>
                <MaterialIcons name="person" size={32} color={colors.textPrimary} />
              </View>
            </View>
            {gameState.userBatting && (
              <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                <MaterialIcons name="sports-cricket" size={14} color="#fff" />
              </View>
            )}
            {!gameState.userBatting && (
              <View style={[styles.roleBadge, { backgroundColor: '#1e293b' }]}>
                <MaterialIcons name="sports-baseball" size={14} color="#fff" />
              </View>
            )}
          </View>
          <Text style={[styles.playerLabel, { color: colors.textSecondary }]}>YOU</Text>
          <View style={[styles.numberBox, { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
            borderColor: userSelectedNumber !== null ? colors.primary : (isDark ? colors.surfaceBorder : 'rgba(255,255,255,0.7)'),
          }]}>
            <Text style={[styles.numberText, { color: colors.primary }]}>
              {userSelectedNumber !== null ? userSelectedNumber : '-'}
            </Text>
          </View>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <Svg width={80} height={80} viewBox="0 0 100 100" style={styles.timerSvg}>
            <Circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={isDark ? colors.surfaceBorder : '#e0e0e0'}
              strokeWidth="4"
            />
            <Circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={colors.primary}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </Svg>
          <View style={styles.timerTextContainer}>
            <Text style={[styles.vsText, { color: colors.textSecondary }]}>VS</Text>
            <Text style={[styles.timerNumber, { color: colors.textPrimary }]}>
              {timeLeft.toString().padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* Bot Side */}
        <View style={styles.playerSide}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarGradient, { 
              backgroundColor: !gameState.userBatting ? colors.primary : colors.surfaceBorder 
            }]}>
              <View style={[styles.avatarInner, { backgroundColor: colors.surface }]}>
                <MaterialIcons name="smart-toy" size={32} color={colors.textPrimary} />
              </View>
            </View>
            {!gameState.userBatting && (
              <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                <MaterialIcons name="sports-cricket" size={14} color="#fff" />
              </View>
            )}
            {gameState.userBatting && (
              <View style={[styles.roleBadge, { backgroundColor: '#1e293b' }]}>
                <MaterialIcons name="sports-baseball" size={14} color="#fff" />
              </View>
            )}
          </View>
          <Text style={[styles.playerLabel, { color: colors.textSecondary }]}>BOT</Text>
          <View style={[styles.numberBox, { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
            borderColor: isDark ? colors.surfaceBorder : 'rgba(255,255,255,0.7)',
          }]}>
            {isBotThinking ? (
              <View style={styles.thinkingDots}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.6 }]} />
                <View style={[styles.dot, { backgroundColor: colors.primary, opacity: 0.3 }]} />
              </View>
            ) : (
              <Text style={[styles.numberText, { color: colors.textSecondary }]}>
                {botSelectedNumber !== null ? botSelectedNumber : '-'}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderChooseMove = () => (
    <View style={[styles.moveCard, { 
      backgroundColor: isDark ? 'rgba(20,42,29,0.6)' : 'rgba(255,255,255,0.6)',
      borderColor: isDark ? colors.surfaceBorder : 'rgba(255,255,255,0.6)',
    }]}>
      <Text style={[styles.moveTitle, { color: colors.textPrimary }]}>CHOOSE YOUR MOVE</Text>
      
      <View style={styles.moveGrid}>
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.moveButton,
              {
                backgroundColor: selectedMove === num 
                  ? colors.primary 
                  : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'),
                borderColor: selectedMove === num 
                  ? colors.primary 
                  : (isDark ? colors.surfaceBorder : 'rgba(255,255,255,0.7)'),
              },
            ]}
            onPress={() => handleMoveSelect(num)}
            activeOpacity={0.8}
            disabled={userSelectedNumber !== null || isBotThinking}
          >
            <Text style={[
              styles.moveButtonText,
              { color: selectedMove === num ? '#fff' : colors.textPrimary },
            ]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Effects */}
      <View style={styles.backgroundEffects}>
        <View style={[styles.blurCircle1, { backgroundColor: colors.primary + (isDark ? '15' : '08') }]} />
        <View style={[styles.blurCircle2, { backgroundColor: isDark ? '#23483215' : '#e3f2fd' }]} />
      </View>

      {renderHeader()}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderLiveScoreCard()}
        {renderYouVsBot()}
        {renderChooseMove()}
      </ScrollView>
    </View>
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
    zIndex: -1,
  },
  blurCircle1: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
  },
  blurCircle2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  scoreCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderTopWidth: 2,
  },
  scoreCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLeft: {
    flex: 1,
  },
  liveLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  scoreMain: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
  },
  scoreOvers: {
    fontSize: 18,
    fontWeight: '700',
  },
  targetBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  targetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stadiumImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  vsCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderLeftWidth: 2,
  },
  vsLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.6,
  },
  vsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playerSide: {
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    padding: 2,
    borderRadius: 40,
  },
  avatarInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  playerLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  numberBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  timerContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerSvg: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 10,
    fontWeight: '900',
    marginBottom: -4,
  },
  timerNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  thinkingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moveCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderBottomWidth: 2,
  },
  moveTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  moveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  moveButton: {
    width: (SCREEN_WIDTH - 80) / 3,
    height: (SCREEN_WIDTH - 80) / 3,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  moveButtonText: {
    fontSize: 32,
    fontWeight: '900',
  },
});