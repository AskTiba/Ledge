import { categories, transactions } from '~/db/schema';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import AsyncStorage from 'expo-sqlite/kv-store';
import { eq } from 'drizzle-orm';

// Function to seed categories
async function seedCategories(db: ExpoSQLiteDatabase) {
  try {
    const existingCategories = await db.select().from(categories);

    if (existingCategories.length === 0) {
      console.log('Seeding categories...');
      await db.insert(categories).values([
        { name: 'Employment & Business', type: 'income' },
        { name: 'Investments & Passive Income', type: 'income' },
        { name: 'Bonuses & Unexpected Income', type: 'income' },
        { name: 'Refunds & Financial Returns', type: 'income' },
        { name: 'Grants & Scholarships', type: 'income' },
        { name: 'Other Income Sources', type: 'income' },
        { name: 'Housing & Utilities', type: 'expense' },
        { name: 'Food & Dining', type: 'expense' },
        { name: 'Transportation', type: 'expense' },
        { name: 'Entertainment & Leisure', type: 'expense' },
        { name: 'Health & Insurance', type: 'expense' },
        { name: 'Education', type: 'expense' },
        { name: 'Subscriptions & Digital Services', type: 'expense' },
        { name: 'Shopping & Personal Expenses', type: 'expense' },
        { name: 'Travel & Vacations', type: 'expense' },
        { name: 'Charity & Social Contributions', type: 'expense' },
        { name: 'Childcare & Family', type: 'expense' },
        { name: 'Pets', type: 'expense' },
        { name: 'Debt & Financial Obligations', type: 'expense' },
        { name: 'Miscellaneous & Other Expenses', type: 'expense' },
      ]);

      console.log('✅ Categories seeded successfully!');
    } else {
      console.log('✅ Categories already exist.');
    }
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
}

// Function to seed transactions
async function seedTransactions(db: ExpoSQLiteDatabase) {
  try {
    const categoriesList = await db.select().from(categories);

    if (categoriesList.length === 0) {
      console.error('❌ No categories found. Transactions seeding skipped!');
      return;
    }

    const categoryMap = Object.fromEntries(categoriesList.map((c) => [c.name, c.id]));

    console.log('Seeding transactions...');
    await db.insert(transactions).values([
      {
        amount: 600,
        type: 'income',
        category_id: categoryMap['Employment & Business'],
        date: '2025-02-01',
        note: 'February Salary',
      },
      {
        amount: 300,
        type: 'income',
        category_id: categoryMap['Investments & Passive Income'],
        date: '2025-02-03',
        note: 'Freelance project',
      },
      {
        amount: 300,
        type: 'expense',
        category_id: categoryMap['Housing & Utilities'],
        date: '2025-02-05',
        note: 'Monthly rent',
      },
      {
        amount: 100,
        type: 'expense',
        category_id: categoryMap['Food & Dining'],
        date: '2025-02-07',
        note: 'Supermarket shopping',
      },
      {
        amount: 50,
        type: 'expense',
        category_id: categoryMap['Entertainment & Leisure'],
        date: '2025-02-10',
        note: 'Movie night',
      },
      {
        amount: 75,
        type: 'expense',
        category_id: categoryMap['Health & Insurance'],
        date: '2025-02-10',
        note: 'Visit to the dentist',
      },
      {
        amount: 35,
        type: 'expense',
        category_id: categoryMap['Transportation'],
        date: '2025-02-10',
        note: 'Trip to Comedy Store',
      },
      {
        amount: 20,
        type: 'expense',
        category_id: categoryMap['Childcare & Family'],
        date: '2025-02-10',
        note: 'Night date',
      },
      {
        amount: 40,
        type: 'expense',
        category_id: categoryMap['Health & Insurance'],
        date: '2025-02-10',
        note: 'Ready for Marathon',
      },
    ]);
    console.log('✅ Transactions seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding transactions:', error);
  }
}

// Main function to seed the database
export const seedDatabase = async (db: ExpoSQLiteDatabase) => {
  try {
    const value = AsyncStorage.getItemSync('dbInitialized');
    if (value) {
      console.log('✅ Database already initialized. Skipping seeding.');
      return;
    }

    console.log('🚀 Starting database seeding...');

    await seedCategories(db);
    await seedTransactions(db);

    // Mark the database as initialized
    AsyncStorage.setItemSync('dbInitialized', 'true');
    console.log('✅ Database seeding complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};
