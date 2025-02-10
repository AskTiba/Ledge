import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Transactions Table
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(), // Stores income/expense amount
  type: text('type', { enum: ['income', 'expense'] }).notNull(), // Either 'income' or 'expense'
  category_id: integer('category_id')
    .notNull()
    .references(() => categories.id), // References categories table
  date: text('date').notNull(), // Transaction date in YYYY-MM-DD
  note: text('note'), // Optional note
  created_at: text('created_at').default('CURRENT_TIMESTAMP'), // Auto timestamp
});

// Categories Table
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(), // Unique category name
  type: text('type', { enum: ['income', 'expense'] }).notNull(), // Category type
});

// Export Types for Use in the App
export type Transaction = typeof transactions.$inferSelect;
export type Category = typeof categories.$inferSelect;
