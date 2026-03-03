import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useUser } from './UserContext';
import { initDb, matchService, type Match, type PaginatedMatches } from './db';

const PAGE_SIZE = 10;

// Skeleton Loader Component
function SkeletonCard({ colors, isDark }: { colors: any; isDark: boolean }) {
  return (
    <View
      style={{
        backgroundColor: isDark ? colors.surface : '#ffffff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDark ? colors.surfaceBorder : '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Top Row Skeleton */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        {/* Avatar Skeletons */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.surfaceBorder,
              marginRight: -12,
            }}
          />
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.surfaceBorder,
            }}
          />
        </View>

        {/* Result Badge Skeleton */}
        <View
          style={{
            width: 60,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.surfaceBorder,
          }}
        />
      </View>

      {/* Bottom Row Skeleton */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        {/* Score Skeleton */}
        <View>
          <View
            style={{
              width: 100,
              height: 14,
              borderRadius: 4,
              backgroundColor: colors.surfaceBorder,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              width: 140,
              height: 28,
              borderRadius: 4,
              backgroundColor: colors.surfaceBorder,
            }}
          />
        </View>

        {/* Duration Skeleton */}
        <View style={{ alignItems: 'flex-end' }}>
          <View
            style={{
              width: 80,
              height: 10,
              borderRadius: 4,
              backgroundColor: colors.surfaceBorder,
              marginBottom: 6,
            }}
          />
          <View
            style={{
              width: 100,
              height: 24,
              borderRadius: 8,
              backgroundColor: colors.surfaceBorder,
            }}
          />
        </View>
      </View>
    </View>
  );
}

// Skeleton List Component
function SkeletonList({ count, colors, isDark }: { count: number; colors: any; isDark: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} colors={colors} isDark={isDark} />
      ))}
    </>
  );
}

// Avatar component with tooltip
interface AvatarWithTooltipProps {
  avatarUrl?: string;
  avatarIcon?: number;
  name: string;
  isUser?: boolean;
  colors: any;
}

function AvatarWithTooltip({ avatarUrl, avatarIcon, name, isUser = false, colors }: AvatarWithTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipOpacity = useState(new Animated.Value(0))[0];

  const handlePressIn = () => {
    setShowTooltip(true);
    Animated.timing(tooltipOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(tooltipOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setShowTooltip(false));
  };

  const avatarIcons = ['sports-cricket', 'front-hand', 'sports-baseball', 'military-tech', 'emoji-events'];
  const hasValidIcon = avatarIcon !== undefined && avatarIcon >= 0 && avatarIcon < 5;

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: '#fff',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {isUser && hasValidIcon ? (
          <View style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MaterialIcons name={avatarIcons[avatarIcon!] as any} size={24} color={colors.primary} />
          </View>
        ) : (
          <MaterialIcons name="smart-toy" size={24} color={isUser ? colors.primary : '#64748b'} />
        )}
      </TouchableOpacity>

      {showTooltip && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 56,
            left: '50%',
            transform: [{ translateX: -50 }],
            backgroundColor: colors.textPrimary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            opacity: tooltipOpacity,
            zIndex: 100,
            minWidth: 80,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 11,
              fontWeight: '700',
              textAlign: 'center',
            }}
          >
            {name}
          </Text>
          {/* Tooltip arrow */}
          <View
            style={{
              position: 'absolute',
              bottom: -6,
              width: 0,
              height: 0,
              borderLeftWidth: 6,
              borderRightWidth: 6,
              borderTopWidth: 6,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: colors.textPrimary,
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}

// Match Card Component
interface MatchCardProps {
  match: Match;
  colors: any;
  isDark: boolean;
}

function MatchCard({ match, colors, isDark }: MatchCardProps) {
  const isWin = match.winner === 'user';
  const resultColor = isWin ? colors.primary : '#ef4444';
  const scoreColor = isWin ? colors.primary : '#ef4444';

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
    const displayHours = (d.getHours() % 12 || 12).toString().padStart(2, '0');
    return `${day} ${month}, ${displayHours}:${minutes} ${ampm}`;
  };

  const formatOvers = (overs: number) => {
    const fullOvers = Math.floor(overs);
    const balls = Math.round((overs - fullOvers) * 6);
    return balls > 0 ? `${fullOvers}.${balls}` : `${fullOvers}`;
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? colors.surface : '#ffffff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isDark ? colors.surfaceBorder : '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Top Row: Avatars and Result */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        {/* Avatars */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginRight: -12 }}>
            <AvatarWithTooltip
              avatarIcon={match.userAvatar}
              name={match.userName}
              isUser={true}
              colors={colors}
            />
          </View>
          <AvatarWithTooltip
            name={match.opponentName}
            colors={colors}
          />
        </View>

        {/* Result and Date */}
        <View style={{ alignItems: 'flex-end' }}>
          <View
            style={{
              backgroundColor: resultColor,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              shadowColor: resultColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 10,
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {isWin ? 'Win' : 'Loss'}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: colors.textSecondary,
              marginTop: 8,
            }}
          >
            {formatDate(match.playedAt)}
          </Text>
        </View>
      </View>

      {/* Bottom Row: Match Details */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        {/* Score */}
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: 4,
            }}
          >
            You vs {match.opponentName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '900',
                color: scoreColor,
                letterSpacing: -1,
              }}
            >
              {match.userScore}/{match.userWickets}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.textSecondary,
                marginHorizontal: 8,
                fontStyle: 'italic',
              }}
            >
              vs
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '900',
                color: colors.textPrimary,
                letterSpacing: -1,
              }}
            >
              {match.opponentScore}/{match.opponentWickets}
            </Text>
          </View>
        </View>

        {/* Match Duration */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 9,
              fontWeight: '900',
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            Match Duration
          </Text>
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 8,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 11,
                fontWeight: '900',
              }}
            >
              {match.totalOvers} Over{match.totalOvers > 1 ? 's' : ''} Match
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNext: () => void;
  onPrev: () => void;
  colors: any;
}

function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onNext,
  onPrev,
  colors,
}: PaginationProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
      }}
    >
      {/* Previous Button */}
      <TouchableOpacity
        onPress={onPrev}
        disabled={!hasPrevPage}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: 44,
          paddingHorizontal: 12,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: hasPrevPage ? 2 : 1,
          borderColor: hasPrevPage ? colors.primary : colors.surfaceBorder,
          opacity: hasPrevPage ? 1 : 0.5,
          minWidth: 80,
        }}
      >
        <MaterialIcons
          name="chevron-left"
          size={20}
          color={hasPrevPage ? colors.primary : colors.textSecondary}
        />
        <Text
          style={{
            fontSize: 10,
            fontWeight: hasPrevPage ? '900' : '700',
            color: hasPrevPage ? colors.primary : colors.textSecondary,
            textTransform: 'uppercase',
            textAlign: 'center',
            includeFontPadding: false,
          }}
        >
          Prev
        </Text>
      </TouchableOpacity>

      {/* Page Indicator */}
      <View
        style={{
          flex: 1,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary + '10',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.primary + '20',
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '900',
            color: colors.primary,
            letterSpacing: 1,
          }}
        >
          {currentPage}{' '}
          <Text
            style={{
              fontSize: 11,
              fontWeight: '500',
              color: colors.textSecondary,
              fontStyle: 'italic',
            }}
          >
            of
          </Text>{' '}
          {totalPages}
        </Text>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        onPress={onNext}
        disabled={!hasNextPage}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: 44,
          paddingHorizontal: 12,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: hasNextPage ? 2 : 1,
          borderColor: hasNextPage ? colors.primary : colors.surfaceBorder,
          opacity: hasNextPage ? 1 : 0.5,
          minWidth: 80,
        }}
      >
        <Text
          style={{
            fontSize: 10,
            fontWeight: hasNextPage ? '900' : '700',
            color: hasNextPage ? colors.primary : colors.textSecondary,
            textTransform: 'uppercase',
            textAlign: 'center',
            includeFontPadding: false,
          }}
        >
          Next
        </Text>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={hasNextPage ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

// Empty State Component
function EmptyState({ colors }: { colors: any }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.primary + '10',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <MaterialIcons name="history" size={40} color={colors.primary} />
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: '900',
          color: colors.textPrimary,
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        No Matches Yet
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 20,
        }}
      >
        Play your first match and it will appear here!
      </Text>
    </View>
  );
}

// Main History Screen
export default function HistoryScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const [matches, setMatches] = useState<Match[]>([]);
  const [pagination, setPagination] = useState<PaginatedMatches | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false); // For pagination loading
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize database
  useEffect(() => {
    const setupDb = async () => {
      try {
        await initDb();
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError('Failed to initialize database');
      }
    };
    setupDb();
  }, []);

  // Load matches
  const loadMatches = useCallback(async (page: number, isRefresh = false) => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      // Use pageLoading for pagination (not first load, not refresh)
      const isPagination = !isRefresh && page > 1;
      
      if (isRefresh) {
        setRefreshing(true);
      } else if (isPagination) {
        setPageLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await matchService.getMatches(user.userId, page);
      setMatches(result.matches);
      setPagination(result);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to load matches:', err);
      setError('Failed to load match history');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setPageLoading(false);
    }
  }, [user?.userId]);

  // Initial load
  useEffect(() => {
    loadMatches(1);
  }, [loadMatches]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadMatches(currentPage, true);
  }, [currentPage, loadMatches]);

  // Handle page navigation
  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage) {
      loadMatches(currentPage + 1);
    }
  }, [currentPage, pagination?.hasNextPage, loadMatches]);

  const handlePrevPage = useCallback(() => {
    if (pagination?.hasPrevPage) {
      loadMatches(currentPage - 1);
    }
  }, [currentPage, pagination?.hasPrevPage, loadMatches]);

  // Loading state (only for initial load)
  if (loading && !refreshing && !pageLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 40,
        }}
      >
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.textPrimary,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => loadMatches(1)}
          style={{
            marginTop: 20,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: colors.primary,
            borderRadius: 24,
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '900',
              fontSize: 14,
            }}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: Platform.OS === 'ios' ? 60 : 20,
          paddingHorizontal: 16,
          paddingBottom: 16,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceBorder,
          minHeight: Platform.OS === 'ios' ? 100 : 80,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '900',
            color: colors.textPrimary,
            textTransform: 'uppercase',
            fontStyle: 'italic',
            letterSpacing: 1,
            textAlign: 'center',
            includeFontPadding: false,
          }}
        >
          Match History
        </Text>
      </View>

      {/* Pagination */}
      {pagination && pagination.totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
          colors={colors}
        />
      )}

      {/* Match List */}
      {matches.length === 0 && !pageLoading ? (
        <EmptyState colors={colors} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {pageLoading ? (
            <SkeletonList count={PAGE_SIZE} colors={colors} isDark={isDark} />
          ) : (
            matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                colors={colors}
                isDark={isDark}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}