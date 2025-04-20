import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

function getCurrentDateInVietnam() {
  const now = new Date()
  return new Date(now.getTime() + 7 * 60 * 60 * 1000) // Thêm 7 giờ vào thời gian UTC
}

export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey(),
  userId: text('user_id').notNull(), // Jira accountId
  title: text('title').notNull(),
  completed: integer('completed').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const mergeRequests = sqliteTable('merge_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  sourceBranch: text('source_branch').notNull(),
  targetBranch: text('target_branch').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['pending', 'merged', 'rejected'] }).notNull().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => getCurrentDateInVietnam()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => getCurrentDateInVietnam())
})

export type MergeRequest = typeof mergeRequests.$inferSelect
export type NewMergeRequest = typeof mergeRequests.$inferInsert
