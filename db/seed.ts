import { categories, transactions } from '~/db/schema';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import AsyncStorage from 'expo-sqlite/kv-store';
import { eq } from 'drizzle-orm';

// Function to seed categories if they don't already exist
async function seedCategories(db: ExpoSQLiteDatabase) {
  const existingCategories = await db.select().from(categories);

  if (existingCategories.length === 0) {
    await db.insert(categories).values([
      // Income Categories
      { name: 'Salary', type: 'income' },
      { name: 'Freelancing', type: 'income' },
      { name: 'Investments', type: 'income' },
      { name: 'Gifts', type: 'income' },
      { name: 'Refunds', type: 'income' },
      { name: 'Side Hustles', type: 'income' },
      { name: 'Rental Income', type: 'income' },
      { name: 'Dividends', type: 'income' },
      { name: 'Royalties', type: 'income' },
      { name: 'Bonuses', type: 'income' },
      { name: 'Grants', type: 'income' },
      { name: 'Pension', type: 'income' },
      { name: 'Scholarships', type: 'income' },
      { name: 'Business Profits', type: 'income' },
      { name: 'Stock Trading', type: 'income' },
      { name: 'Crypto Earnings', type: 'income' },
      { name: 'Consulting', type: 'income' },
      { name: 'Affiliate Marketing', type: 'income' },
      { name: 'Selling Used Items', type: 'income' },
      { name: 'Tax Refunds', type: 'income' },
      { name: 'Crowdfunding', type: 'income' },
      { name: 'Lottery & Gambling Winnings', type: 'income' },
      { name: 'Other Income', type: 'income' },

      // Expense Categories
      { name: 'Utilities', type: 'expense' },
      { name: 'Electricity', type: 'expense' },
      { name: 'Water', type: 'expense' },
      { name: 'Internet', type: 'expense' },
      { name: 'Phone Bill', type: 'expense' },
      { name: 'Housing', type: 'expense' },
      { name: 'Rent/Mortgage', type: 'expense' },
      { name: 'Groceries', type: 'expense' },
      { name: 'Transportation', type: 'expense' },
      { name: 'Car Maintenance', type: 'expense' },
      { name: 'Public Transport', type: 'expense' },
      { name: 'Fuel', type: 'expense' },
      { name: 'Entertainment', type: 'expense' },
      { name: 'Movies & Shows', type: 'expense' },
      { name: 'Concerts & Events', type: 'expense' },
      { name: 'Gaming', type: 'expense' },
      { name: 'Dining Out', type: 'expense' },
      { name: 'Health', type: 'expense' },
      { name: 'Insurance', type: 'expense' },
      { name: 'Medical Bills', type: 'expense' },
      { name: 'Prescriptions', type: 'expense' },
      { name: 'Fitness & Gym', type: 'expense' },
      { name: 'Education', type: 'expense' },
      { name: 'Student Loans', type: 'expense' },
      { name: 'Online Courses', type: 'expense' },
      { name: 'Books & Supplies', type: 'expense' },
      { name: 'Subscriptions', type: 'expense' },
      { name: 'Streaming Services', type: 'expense' },
      { name: 'Cloud Storage', type: 'expense' },
      { name: 'Shopping', type: 'expense' },
      { name: 'Clothing & Fashion', type: 'expense' },
      { name: 'Electronics', type: 'expense' },
      { name: 'Home Improvement', type: 'expense' },
      { name: 'Travel', type: 'expense' },
      { name: 'Vacation', type: 'expense' },
      { name: 'Flight Tickets', type: 'expense' },
      { name: 'Hotel Accommodation', type: 'expense' },
      { name: 'Charity & Donations', type: 'expense' },
      { name: 'Gifts & Celebrations', type: 'expense' },
      { name: 'Childcare', type: 'expense' },
      { name: 'Babysitting', type: 'expense' },
      { name: 'School Fees', type: 'expense' },
      { name: 'Pets', type: 'expense' },
      { name: 'Pet Food', type: 'expense' },
      { name: 'Veterinary Bills', type: 'expense' },
      { name: 'Debt Payments', type: 'expense' },
      { name: 'Loan Repayments', type: 'expense' },
      { name: 'Credit Card Payments', type: 'expense' },
      { name: 'Bank Fees', type: 'expense' },
      { name: 'Taxes', type: 'expense' },
      { name: 'Miscellaneous', type: 'expense' },
      { name: 'Other Expenses', type: 'expense' },
    ]);

    console.log('Categories seeded!');
  } else {
    console.log('Categories already exist!');
  }
}

// Function to generate random transaction data for multiple years
// Function to seed transactions if they don't already exist
async function seedTransactions(db: ExpoSQLiteDatabase) {
  const existingTransactions = await db.select().from(transactions);

  if (existingTransactions.length === 0) {
    const categoriesList = await db.select().from(categories);
    const categoryMap = Object.fromEntries(categoriesList.map((c) => [c.name, c.id]));

    await db.insert(transactions).values([
      {
        amount: 600,
        type: 'income',
        category_id: categoryMap['Salary'],
        date: '2025-02-01',
        note: 'February Salary',
      },
      {
        amount: 300,
        type: 'income',
        category_id: categoryMap['Freelancing'],
        date: '2025-02-03',
        note: 'Freelance project',
      },
      {
        amount: 300,
        type: 'expense',
        category_id: categoryMap['Rent/Mortgage'],
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
      {
        amount: 75,
        type: 'expense',
        category_id: categoryMap['Health'],
        date: '2025-02-10',
        note: 'Visit to the dentist',
      },
      {
        amount: 35,
        type: 'expense',
        category_id: categoryMap['Fuel'],
        date: '2025-02-10',
        note: 'Trip to Comeedy Store',
      },
      {
        amount: 20,
        type: 'expense',
        category_id: categoryMap['Babysitting'],
        date: '2025-02-10',
        note: 'Night date',
      },
      {
        amount: 40,
        type: 'expense',
        category_id: categoryMap['Fitness & Gym'],
        date: '2025-02-10',
        note: 'Ready for Marathon',
      },
    ]);
    console.log('Transactions seeded!');
  } else {
    console.log('Transactions already exist!');
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

  // Mark the database as initialized in AsyncStorage
  AsyncStorage.setItemSync('dbInitialized', 'true');

  console.log('Seeding complete!');
};
