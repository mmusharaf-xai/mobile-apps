import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GameRules() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header matching design - safe area for notch + center content */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder, paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <MaterialIcons name="sports-cricket" size={24} color={colors.textPrimary} />
          </View>
          <Text style={[styles.logoText, { color: colors.textPrimary }]}>HandCricket</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Game Rules</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Everything you need to know to win</Text>
        </View>

        {/* Basics section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="sports-cricket" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Basics: How to Play</Text>
          </View>

          <View style={styles.rulesContainer}>
            {/* Rule 1 */}
            <View style={[styles.ruleCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <View style={styles.ruleNumber}>
                <Text style={[styles.ruleNumText, { color: colors.textPrimary }]}>1</Text>
              </View>
              <Text style={[styles.ruleHeading, { color: colors.textPrimary }]}>Input Your Move</Text>
              <Text style={[styles.ruleDesc, { color: colors.textSecondary }]}>
                Select a number from <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>1 to 6</Text>. You and the opponent play simultaneously.
              </Text>
            </View>

            {/* Rule 2 */}
            <View style={[styles.ruleCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <View style={styles.ruleNumber}>
                <Text style={[styles.ruleNumText, { color: colors.textPrimary }]}>2</Text>
              </View>
              <Text style={[styles.ruleHeading, { color: colors.textPrimary }]}>Batting & Scoring</Text>
              <Text style={[styles.ruleDesc, { color: colors.textSecondary }]}>
                If numbers match, you are <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>OUT</Text>. Otherwise, your number is added to your runs.
              </Text>
            </View>

            {/* Rule 3 */}
            <View style={[styles.ruleCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <View style={styles.ruleNumber}>
                <Text style={[styles.ruleNumText, { color: colors.textPrimary }]}>3</Text>
              </View>
              <Text style={[styles.ruleHeading, { color: colors.textPrimary }]}>Chasing the Target</Text>
              <Text style={[styles.ruleDesc, { color: colors.textSecondary }]}>
                Roles swap after a wicket. Match the opponent's number to get them out before they beat your score.
              </Text>
            </View>
          </View>
        </View>

        {/* Pro Tips */}
        <View style={[styles.proTips, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <View style={styles.tipsHeader}>
            <View style={[styles.tipsIcon, { backgroundColor: colors.primary + '20' }]}>
              <MaterialIcons name="tips-and-updates" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.tipsTitle, { color: colors.textPrimary }]}>Pro Tips</Text>
          </View>

          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <MaterialIcons name="verified" size={20} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>Study patterns! The opponent tends to repeat certain sequences.</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="verified" size={20} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>Risk vs Reward: '6' gives max points but is the riskiest move.</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="verified" size={20} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>Stay unpredictable to survive longer at the crease.</Text>
            </View>
          </View>
        </View>

        {/* Ready button */}
        <TouchableOpacity
          style={[styles.readyButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.readyText, { color: colors.textPrimary }]}>Ready to Play?</Text>
          <MaterialIcons name="sports-kabaddi" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
    gap: 40,
  },
  titleSection: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  rulesContainer: {
    gap: 16,
  },
  ruleCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  ruleNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#19e62b',
    marginBottom: 12,
  },
  ruleNumText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  ruleHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  ruleDesc: {
    fontSize: 15,
    lineHeight: 22,
  },
  proTips: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  tipsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tipsList: {
    gap: 20,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 16,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  readyButton: {
    height: 62,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  readyText: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
