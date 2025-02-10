import { eq, and, gte, lte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';
import { transactions, months_summary } from '~/db/schema';
import * as schema from '~/db/schema';

/**
 * Initialize Drizzle ORM with SQLite database.
 * @param db - SQLiteDatabase instance from expo-sqlite.
 * @returns Drizzle database instance.
 */
const getDrizzleDb = (db: SQLiteDatabase) => drizzle(db, { schema });

/**
 * Fetch all transactions sorted by date.
 * @param db - SQLiteDatabase instance.
 * @returns List of all transactions.
 */
export const fetchTransactions = async (db: SQLiteDatabase) =>
  getDrizzleDb(db).select().from(transactions).orderBy(transactions.date);

/**
 * Fetch transactions for a specific month.
 * @param db - SQLiteDatabase instance.
 * @param month - Month in 'YYYY-MM' format.
 * @returns Transactions within the given month.
 */
export const fetchTransactionsByMonth = async (db: SQLiteDatabase, month: string) => {
  const startDate = `${month}-01`;
  const endDate = `${month}-31`; // Simplified; use a proper date library for accuracy

  return getDrizzleDb(db)
    .select()
    .from(transactions)
    .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)));
};

/**
 * Fetch all monthly summaries sorted by month.
 * @param db - SQLiteDatabase instance.
 * @returns List of monthly summaries.
 */
export const fetchMonthlySummaries = async (db: SQLiteDatabase) =>
  getDrizzleDb(db).select().from(months_summary).orderBy(months_summary.month);

/**
 * Fetch a specific monthly summary by month.
 * @param db - SQLiteDatabase instance.
 * @param month - Month in 'YYYY-MM' format.
 * @returns Monthly summary for the given month.
 */
export const fetchMonthlySummary = async (db: SQLiteDatabase, month: string) =>
  getDrizzleDb(db).select().from(months_summary).where(eq(months_summary.month, month));
