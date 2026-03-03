import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const matches = sqliteTable('matches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull().default('You'),
  userAvatar: integer('user_avatar').default(0),
  opponentName: text('opponent_name').notNull().default('Bot'),
  opponentAvatar: text('opponent_avatar').default('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop'),
  userScore: integer('user_score').notNull().default(0),
  userWickets: integer('user_wickets').notNull().default(0),
  opponentScore: integer('opponent_score').notNull().default(0),
  opponentWickets: integer('opponent_wickets').notNull().default(0),
  userOvers: real('user_overs').notNull().default(0),
  opponentOvers: real('opponent_overs').notNull().default(0),
  totalOvers: integer('total_overs').notNull().default(1),
  winner: text('winner').notNull().default('draw'), // 'user', 'opponent', 'draw'
  playedAt: integer('played_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
});

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
