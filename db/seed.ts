import { categories } from '~/db/schema';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import AsyncStorage from 'expo-sqlite/kv-store';

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

// Main function to seed the database
export const seedDatabase = async (db: ExpoSQLiteDatabase) => {
  try {
    const value = AsyncStorage.getItemSync('dbInitialized');
    if (value) {
      console.log('✅ Database already initialized. Skipping seeding.');
      return;
    }

    console.log('🚀 Starting database seeding...');

    // Seed only categories
    await seedCategories(db);

    // Mark the database as initialized
    AsyncStorage.setItemSync('dbInitialized', 'true');
    console.log('✅ Database seeding complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};
