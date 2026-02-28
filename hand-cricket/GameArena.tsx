import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { useTheme } from './ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Constants for layout - matching the design grid-cols-3 gap-4
const CONTAINER_PADDING = 20;
const CARD_PADDING = 24;
const BUTTON_GAP = 16;
const AVAILABLE_WIDTH = SCREEN_WIDTH - (CONTAINER_PADDING * 2) - (CARD_PADDING * 2);
const BUTTON_SIZE = (AVAILABLE_WIDTH - (BUTTON_GAP * 2)) / 3;

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
  gameOver: boolean;
  winner: 'user' | 'bot' | null;
}

export default function GameArena() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const overs = (route.params as any)?.overs || 5;

  // Game state - start fresh with first innings
  const [gameState, setGameState] = useState<GameState>({
    userScore: 0,
    userWickets: 0,
    botScore: 0,
    botWickets: 0,
    userOvers: 0,
    userBalls: 0,
    botOvers: 0,
    botBalls: 0,
    target: null,
    isFirstInnings: true,
    userBatting: true, // User bats first
    gameOver: false,
    winner: null,
  });

  // Timer state
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerProgress, setTimerProgress] = useState(100);
  const [userSelectedNumber, setUserSelectedNumber] = useState<number | null>(null);
  const [botSelectedNumber, setBotSelectedNumber] = useState<number | null>(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

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
    
    if (isBotThinking || userSelectedNumber !== null || gameState.gameOver) {
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
  }, [isBotThinking, userSelectedNumber, gameState.gameOver]);

  // Process game logic after both players have selected
  const processGameLogic = useCallback((userNum: number, botNum: number) => {
    setGameState(prev => {
      const newState = { ...prev };
      const currentBatsman = prev.userBatting ? 'user' : 'bot';
      const currentBowler = prev.userBatting ? 'bot' : 'user';
      
      // Check if batsman is out (same number selected)
      if (userNum === botNum) {
        // Wicket falls
        if (currentBatsman === 'user') {
          newState.userWickets = 1;
        } else {
          newState.botWickets = 1;
        }
        
        // Check if first innings just ended
        if (prev.isFirstInnings) {
          newState.isFirstInnings = false;
          newState.target = (currentBatsman === 'user' ? newState.userScore : newState.botScore) + 1;
          // Swap roles for second innings
          newState.userBatting = !prev.userBatting;
          
          if (currentBatsman === 'user') {
            setResultMessage(`You're OUT! Target: ${newState.target} runs`);
          } else {
            setResultMessage(`Bot is OUT! Target: ${newState.target} runs`);
          }
          setShowResultModal(true);
        } else {
          // Second innings - game over
          newState.gameOver = true;
          // If batsman was out, bowler wins
          newState.winner = currentBowler === 'user' ? 'user' : 'bot';
          setResultMessage(newState.winner === 'user' ? 'You WIN!' : 'Bot WINS!');
          setShowResultModal(true);
        }
      } else {
        // Add runs to batsman
        const runs = prev.userBatting ? userNum : botNum;
        if (currentBatsman === 'user') {
          newState.userScore += runs;
        } else {
          newState.botScore += runs;
        }
        
        // Check if target chased in second innings
        if (!prev.isFirstInnings && prev.target) {
          const batsmanScore = currentBatsman === 'user' ? newState.userScore : newState.botScore;
          if (batsmanScore >= prev.target) {
            newState.gameOver = true;
            newState.winner = currentBatsman === 'user' ? 'user' : 'bot';
            setResultMessage(newState.winner === 'user' ? 'You chased the target! You WIN!' : 'Bot chased the target! Bot WINS!');
            setShowResultModal(true);
          }
        }
      }
      
      // Update balls and overs
      if (prev.userBatting) {
        newState.userBalls += 1;
        if (newState.userBalls >= 6) {
          newState.userBalls = 0;
          newState.userOvers += 1;
          // Check if over finished - swap roles
          if (newState.userOvers < overs && !newState.gameOver && newState.userWickets === 0) {
            newState.userBatting = false;
            setResultMessage('Over finished! Swapping roles.');
            setShowResultModal(true);
          }
          // Check if all overs completed in first innings
          if (newState.userOvers >= overs && prev.isFirstInnings && newState.userWickets === 0) {
            newState.isFirstInnings = false;
            newState.target = newState.userScore + 1;
            newState.userBatting = false;
            setResultMessage(`First innings over! Target: ${newState.target} runs`);
            setShowResultModal(true);
          }
        }
      } else {
        newState.botBalls += 1;
        if (newState.botBalls >= 6) {
          newState.botBalls = 0;
          newState.botOvers += 1;
          // Check if over finished - swap roles
          if (newState.botOvers < overs && !newState.gameOver && newState.botWickets === 0) {
            newState.userBatting = true;
            setResultMessage('Over finished! Swapping roles.');
            setShowResultModal(true);
          }
          // Check if all overs completed in first innings
          if (newState.botOvers >= overs && prev.isFirstInnings && newState.botWickets === 0) {
            newState.isFirstInnings = false;
            newState.target = newState.botScore + 1;
            newState.userBatting = true;
            setResultMessage(`First innings over! Target: ${newState.target} runs`);
            setShowResultModal(true);
          }
        }
      }
      
      // Check if all overs completed in second innings without chasing target
      if (!newState.isFirstInnings && !newState.gameOver) {
        if (newState.userOvers >= overs || newState.botOvers >= overs) {
          newState.gameOver = true;
          const userScore = newState.userScore;
          const botScore = newState.botScore;
          
          if (prev.target) {
            // Whoever was batting second failed to chase
            const currentBatsmanScore = currentBatsman === 'user' ? userScore : botScore;
            if (currentBatsmanScore < prev.target) {
              newState.winner = currentBowler === 'user' ? 'user' : 'bot';
            } else {
              newState.winner = currentBatsman === 'user' ? 'user' : 'bot';
            }
          } else {
            newState.winner = userScore > botScore ? 'user' : (botScore > userScore ? 'bot' : null);
          }
          
          if (newState.winner === 'user') {
            setResultMessage('You WIN!');
          } else if (newState.winner === 'bot') {
            setResultMessage('Bot WINS!');
          } else {
            setResultMessage('It\'s a TIE!');
          }
          setShowResultModal(true);
        }
      }
      
      return newState;
    });
  }, [overs]);

  const handleMoveSelect = useCallback((number: number) => {
    if (userSelectedNumber !== null || isBotThinking || gameState.gameOver) return;
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setSelectedMove(number);
    setUserSelectedNumber(number);
    setIsBotThinking(true);

    botTimerRef.current = setTimeout(() => {
      const botNumber = Math.floor(Math.random() * 6) + 1;
      setBotSelectedNumber(botNumber);
      setIsBotThinking(false);
      
      // Process game logic
      processGameLogic(number, botNumber);
      
      // Reset for next turn after showing result
      setTimeout(() => {
        setUserSelectedNumber(null);
        setBotSelectedNumber(null);
        setSelectedMove(null);
      }, 2000);
    }, 1500);
  }, [userSelectedNumber, isBotThinking, gameState.gameOver, processGameLogic]);

  const resetGame = () => {
    setGameState({
      userScore: 0,
      userWickets: 0,
      botScore: 0,
      botWickets: 0,
      userOvers: 0,
      userBalls: 0,
      botOvers: 0,
      botBalls: 0,
      target: null,
      isFirstInnings: true,
      userBatting: true,
      gameOver: false,
      winner: null,
    });
    setShowResultModal(false);
    setUserSelectedNumber(null);
    setBotSelectedNumber(null);
    setSelectedMove(null);
  };

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

  // Platform-specific glass effect colors
  // Android needs different alpha values because it renders transparency differently
  const isAndroid = Platform.OS === 'android';
  const glassBg = isDark 
    ? (isAndroid ? 'rgba(40,60,50,0.7)' : 'rgba(255,255,255,0.08)')
    : (isAndroid ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)');
  const glassBorder = isDark 
    ? (isAndroid ? 'rgba(100,150,120,0.3)' : 'rgba(255,255,255,0.15)')
    : (isAndroid ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)');
  const glassButtonBg = isDark 
    ? (isAndroid ? 'rgba(50,70,60,0.6)' : 'rgba(255,255,255,0.1)')
    : (isAndroid ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)');

  const renderHeader = () => (
    <View style={[styles.header, { 
      backgroundColor: isDark ? 'rgba(10,26,17,0.3)' : 'rgba(255,255,255,0.3)',
      borderBottomColor: glassBorder,
    }]}>
      <View style={styles.headerContent}>
        <MaterialIcons name="sports-cricket" size={28} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Game Arena</Text>
      </View>
    </View>
  );

  const renderLiveScoreCard = () => (
    <View style={[styles.glassPanel, { backgroundColor: glassBg, borderColor: glassBorder }]}>
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
        <View style={[styles.stadiumImage, { borderColor: glassBorder }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=200&h=200&fit=crop' }}
            style={styles.stadiumImg}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );

  const renderYouVsBot = () => (
    <View style={[styles.glassPanel, { backgroundColor: glassBg, borderColor: glassBorder }]}>
      <Text style={[styles.vsLabel, { color: colors.textSecondary }]}>YOU vs BOT</Text>
      
      <View style={styles.vsContent}>
        {/* User Side */}
        <View style={styles.playerSide}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={gameState.userBatting ? [colors.primary, '#86efac'] : ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']}
              style={styles.avatarGradient}
            >
              <View style={[styles.avatarInner, { backgroundColor: colors.surface }]}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              </View>
            </LinearGradient>
            {gameState.userBatting && (
              <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                <MaterialIcons name="sports-cricket" size={14} color="#fff" />
              </View>
            )}
            {!gameState.userBatting && (
              <View style={[styles.roleBadge, { backgroundColor: '#334155' }]}>
                <MaterialIcons name="sports-baseball" size={14} color="#fff" />
              </View>
            )}
          </View>
          <Text style={[styles.playerLabel, { color: colors.textSecondary }]}>YOU</Text>
          <View style={[styles.numberBox, { borderColor: userSelectedNumber !== null ? colors.primary : glassBorder }]}>
            {userSelectedNumber !== null ? (
              <LinearGradient
                colors={[colors.primary, '#15cc25']}
                style={styles.numberBoxGradient}
              >
                <Text style={[styles.numberText, { color: '#fff' }]}>
                  {userSelectedNumber}
                </Text>
              </LinearGradient>
            ) : (
              <Text style={[styles.numberText, { color: colors.textSecondary }]}>
                -
              </Text>
            )}
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
              stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}
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
            <LinearGradient
              colors={!gameState.userBatting ? [colors.primary, '#86efac'] : ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']}
              style={styles.avatarGradient}
            >
              <View style={[styles.avatarInner, { backgroundColor: colors.surface }]}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop' }}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              </View>
            </LinearGradient>
            {!gameState.userBatting && (
              <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                <MaterialIcons name="sports-cricket" size={14} color="#fff" />
              </View>
            )}
            {gameState.userBatting && (
              <View style={[styles.roleBadge, { backgroundColor: '#334155' }]}>
                <MaterialIcons name="sports-baseball" size={14} color="#fff" />
              </View>
            )}
          </View>
          <Text style={[styles.playerLabel, { color: colors.textSecondary }]}>BOT</Text>
          <View style={[styles.numberBox, { borderColor: glassBorder, backgroundColor: glassButtonBg }]}>
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
    <View style={[styles.glassPanel, { backgroundColor: glassBg, borderColor: glassBorder }]}>
      <Text style={[styles.moveTitle, { color: colors.textPrimary }]}>CHOOSE YOUR MOVE</Text>
      
      <View style={styles.moveGrid}>
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.moveButton}
            onPress={() => handleMoveSelect(num)}
            activeOpacity={0.8}
            disabled={userSelectedNumber !== null || isBotThinking}
          >
            {selectedMove === num ? (
              <LinearGradient
                colors={[colors.primary, '#15cc25']}
                style={[styles.moveButtonInner, styles.moveButtonActive, { borderColor: colors.primary }]}
              >
                <Text style={[styles.moveButtonText, { color: '#fff' }]}>
                  {num}
                </Text>
              </LinearGradient>
            ) : (
              <View style={[styles.moveButtonInner, { borderColor: glassBorder, backgroundColor: glassButtonBg }]}>
                <Text style={[styles.moveButtonText, { color: colors.textPrimary }]}>
                  {num}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Effects */}
      <View style={styles.backgroundEffects}>
        <View style={[styles.stadiumGradient, { backgroundColor: isDark ? '#0a1a11' : '#f0f4f8' }]} />
        <View style={[styles.blurCircle1, { backgroundColor: isDark ? 'rgba(25,230,43,0.2)' : 'rgba(25,230,43,0.15)' }]} />
        <View style={[styles.blurCircle2, { backgroundColor: isDark ? 'rgba(35,72,50,0.3)' : 'rgba(144,202,249,0.3)' }]} />
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

      {/* Result Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showResultModal}
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#142a1d' : '#fff' }]}>
            <Text style={[styles.modalText, { color: colors.textPrimary }]}>{resultMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (gameState.gameOver) {
                  resetGame();
                } else {
                  setShowResultModal(false);
                }
              }}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                {gameState.gameOver ? 'Play Again' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    zIndex: -1,
  },
  stadiumGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurCircle1: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.15,
  },
  blurCircle2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.12,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
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
    padding: CONTAINER_PADDING,
    gap: 16,
    paddingBottom: 40,
  },
  glassPanel: {
    borderRadius: 40,
    padding: CARD_PADDING,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 3,
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
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  stadiumImg: {
    width: '100%',
    height: '100%',
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
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
    borderWidth: 1,
    overflow: 'hidden',
  },
  numberBoxGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'space-between',
  },
  moveButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    marginBottom: BUTTON_GAP,
  },
  moveButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  moveButtonActive: {
    shadowColor: '#19e62b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  moveButtonText: {
    fontSize: 32,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '900',
  },
});