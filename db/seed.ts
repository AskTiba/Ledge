import { categories, transactions, months_summary } from '~/db/schema';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import AsyncStorage from 'expo-sqlite/kv-store';
import { eq } from 'drizzle-orm';

// Function to seed categories if they don't already exist
async function seedCategories(db: ExpoSQLiteDatabase) {
  const existingCategories = await db.select().from(categories);

  if (existingCategories.length === 0) {
    await db.insert(categories).values([
      { name: 'Salary', type: 'income' },
      { name: 'Freelancing', type: 'income' },
      { name: 'Rent', type: 'expense' },
      { name: 'Groceries', type: 'expense' },
      { name: 'Entertainment', type: 'expense' },
    ]);
    console.log('Categories seeded!');
  } else {
    console.log('Categories already exist!');
  }
}

// Function to seed transactions if they don't already exist
async function seedTransactions(db: ExpoSQLiteDatabase) {
  const existingTransactions = await db.select().from(transactions);

  if (existingTransactions.length === 0) {
    const categoriesList = await db.select().from(categories);
    const categoryMap = Object.fromEntries(categoriesList.map((c) => [c.name, c.id]));

    await db.insert(transactions).values([
      {
        amount: 1500,
        type: 'income',
        category_id: categoryMap['Salary'],
        date: '2025-02-01',
        note: 'February Salary',
      },
      {
        amount: 500,
        type: 'income',
        category_id: categoryMap['Freelancing'],
        date: '2025-02-03',
        note: 'Freelance project',
      },
      {
        amount: 300,
        type: 'expense',
        category_id: categoryMap['Rent'],
        date: '2025-02-05',
        note: 'Monthly rent',
      },
      {
        amount: 100,
        type: 'expense',
        category_id: categoryMap['Groceries'],
        date: '2025-02-07',
        note: 'Supermarket shopping',
      },
      {
        amount: 50,
        type: 'expense',
        category_id: categoryMap['Entertainment'],
        date: '2025-02-10',
        note: 'Movie night',
      },
    ]);
    console.log('Transactions seeded!');
  } else {
    console.log('Transactions already exist!');
  }
}

// Function to seed the monthly summary if it doesn't already exist
async function seedMonthlySummary(db: ExpoSQLiteDatabase) {
  const month = '2025-02';
  const existingSummary = await db
    .select()
    .from(months_summary)
    .where(eq(months_summary.month, month));

  if (existingSummary.length === 0) {
    const transactionsList = await db.select().from(transactions);

    const totalIncome = transactionsList
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactionsList
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    await db.insert(months_summary).values({
      month,
      total_income: totalIncome,
      total_expense: totalExpense,
      net_balance: netBalance,
    });

    console.log('Monthly summary seeded!');
  } else {
    console.log('Monthly summary already exists!');
  }
}

// Main function to run the seeding process
export const seedDatabase = async (db: ExpoSQLiteDatabase) => {
  const value = AsyncStorage.getItemSync('dbInitialized');
  if (value) return; // Return if the database has already been initialized

  console.log('Seeding database...');

  // Step-by-step seeding process
  await seedCategories(db);
  await seedTransactions(db);
  await seedMonthlySummary(db);

  // Mark the database as initialized in AsyncStorage
  AsyncStorage.setItemSync('dbInitialized', 'true');

  console.log('Seeding complete!');
};
