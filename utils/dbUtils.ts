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
      await db.execAsync('DELETE FROM transactions;');

      // Reset SQLite auto-increment counters
      await db.execAsync(`
        DELETE FROM sqlite_sequence WHERE name='Transactions';
      `);
    });

    console.log('Database has been reset.');
  }

  return { resetDatabase };
}
