import { useSQLiteContext } from 'expo-sqlite';
import { eq } from 'drizzle-orm';
import { transactions, categories } from '~/db/schema'; // Import table schemas
import { AsyncStorage } from 'expo-sqlite/kv-store';

export function useDatabaseUtils() {
  const db = useSQLiteContext();

  async function resetDatabase() {
    await AsyncStorage.removeItem('dbInitialized');
    console.log('AsyncStorage reset. The database will reseed on next run.');
    
    await db.withTransactionAsync(async () => {
      // Delete all rows from Transactions & Categories
      await db.execAsync('DELETE FROM categories;');
      await db.execAsync('DELETE FROM transactions;');
      await db.execAsync('DELETE FROM months_summary;');

      // Reset SQLite auto-increment counters
      await db.execAsync(`
        DELETE FROM sqlite_sequence WHERE name='Transactions';
        DELETE FROM sqlite_sequence WHERE name='Categories';
        DELETE FROM sqlite_sequence WHERE name='months_summary';
      `);
    });

    console.log('Database has been reset.');
  }

  return { resetDatabase };
}
