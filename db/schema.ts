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

// Monthly Summary Table
export const months_summary = sqliteTable('months_summary', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  month: text('month').notNull().unique(), // Format YYYY-MM
  total_income: real('total_income').default(0), // Total income for the month
  total_expense: real('total_expense').default(0), // Total expenses for the month
  net_balance: real('net_balance').default(0), // Net balance
});

// Export Types for Use in the App
export type Transaction = typeof transactions.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type MonthSummary = typeof months_summary.$inferSelect;
