import { eq, and, desc, sql } from 'drizzle-orm';
import { getDb } from './connection';
import { matches, type Match, type NewMatch } from './schema';

const PAGE_SIZE = 10;

export interface MatchFilters {
  userId?: string;
  winner?: 'user' | 'opponent' | 'draw';
}

export interface PaginatedMatches {
  matches: Match[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreateMatchInput {
  userId: string;
  userName?: string;
  userAvatar?: number;
  opponentName?: string;
  opponentAvatar?: string;
  userScore: number;
  userWickets: number;
  opponentScore: number;
  opponentWickets: number;
  userOvers: number;
  userBalls: number;
  opponentOvers: number;
  opponentBalls: number;
  totalOvers: number;
  winner: 'user' | 'opponent' | 'draw';
  playedAt?: Date;
}

class MatchService {
  private get db() {
    return getDb();
  }

  /**
   * Create a new match record
   */
  async createMatch(input: CreateMatchInput): Promise<Match> {
    const userOversDecimal = input.userOvers + input.userBalls / 6;
    const opponentOversDecimal = input.opponentOvers + input.opponentBalls / 6;

    const newMatch: NewMatch = {
      userId: input.userId,
      userName: input.userName ?? 'You',
      userAvatar: input.userAvatar ?? 0,
      opponentName: input.opponentName ?? 'Bot',
      opponentAvatar: input.opponentAvatar ?? 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop',
      userScore: input.userScore,
      userWickets: input.userWickets,
      opponentScore: input.opponentScore,
      opponentWickets: input.opponentWickets,
      userOvers: userOversDecimal,
      opponentOvers: opponentOversDecimal,
      totalOvers: input.totalOvers,
      winner: input.winner,
      playedAt: input.playedAt ?? new Date(),
      isDeleted: false,
    };

    const result = await this.db.insert(matches).values(newMatch).returning();
    return result[0];
  }

  /**
   * Get paginated matches for a user
   */
  async getMatches(
    userId: string,
    page: number = 1,
    filters?: MatchFilters
  ): Promise<PaginatedMatches> {
    const offset = (page - 1) * PAGE_SIZE;

    // Build where conditions
    const conditions = [
      eq(matches.userId, userId),
      eq(matches.isDeleted, false),
    ];

    if (filters?.winner) {
      conditions.push(eq(matches.winner, filters.winner));
    }

    const whereClause = and(...conditions);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(matches)
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // Get paginated matches
    const matchList = await this.db
      .select()
      .from(matches)
      .where(whereClause)
      .orderBy(desc(matches.playedAt))
      .limit(PAGE_SIZE)
      .offset(offset);

    return {
      matches: matchList,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Get all matches for a user (non-paginated, for export/backup)
   */
  async getAllMatches(userId: string): Promise<Match[]> {
    return this.db
      .select()
      .from(matches)
      .where(and(eq(matches.userId, userId), eq(matches.isDeleted, false)))
      .orderBy(desc(matches.playedAt));
  }

  /**
   * Get a single match by ID
   */
  async getMatchById(matchId: number): Promise<Match | null> {
    const result = await this.db
      .select()
      .from(matches)
      .where(and(eq(matches.id, matchId), eq(matches.isDeleted, false)))
      .limit(1);

    return result[0] ?? null;
  }

  /**
   * Soft delete a match
   */
  async deleteMatch(matchId: number): Promise<boolean> {
    const result = await this.db
      .update(matches)
      .set({ isDeleted: true })
      .where(eq(matches.id, matchId))
      .returning();

    return result.length > 0;
  }

  /**
   * Hard delete a match (use with caution)
   */
  async hardDeleteMatch(matchId: number): Promise<boolean> {
    const result = await this.db
      .delete(matches)
      .where(eq(matches.id, matchId))
      .returning();

    return result.length > 0;
  }

  /**
   * Get match statistics for a user
   */
  async getMatchStats(userId: string): Promise<{
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
  }> {
    const result = await this.db
      .select({
        totalMatches: sql<number>`count(*)`,
        wins: sql<number>`sum(case when ${matches.winner} = 'user' then 1 else 0 end)`,
        losses: sql<number>`sum(case when ${matches.winner} = 'opponent' then 1 else 0 end)`,
        draws: sql<number>`sum(case when ${matches.winner} = 'draw' then 1 else 0 end)`,
      })
      .from(matches)
      .where(and(eq(matches.userId, userId), eq(matches.isDeleted, false)));

    const stats = result[0] ?? { totalMatches: 0, wins: 0, losses: 0, draws: 0 };
    const totalMatches = stats.totalMatches || 0;
    const winRate = totalMatches > 0 ? (stats.wins || 0) / totalMatches : 0;

    return {
      totalMatches,
      wins: stats.wins || 0,
      losses: stats.losses || 0,
      draws: stats.draws || 0,
      winRate,
    };
  }

  /**
   * Clear all matches for a user (soft delete all)
   */
  async clearAllMatches(userId: string): Promise<number> {
    const result = await this.db
      .update(matches)
      .set({ isDeleted: true })
      .where(and(eq(matches.userId, userId), eq(matches.isDeleted, false)))
      .returning();

    return result.length;
  }
}

export const matchService = new MatchService();
