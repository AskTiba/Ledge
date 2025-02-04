import { useSQLiteContext } from 'expo-sqlite';

export function useDatabaseUtils() {
  const db = useSQLiteContext();

  async function resetDatabase() {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        DELETE FROM Transactions;
        DELETE FROM Categories;
        DELETE FROM sqlite_sequence WHERE name='Transactions';
        DELETE FROM sqlite_sequence WHERE name='Categories';
      `);
    });
    console.log('Database has been reset.');
  }

  return { resetDatabase };
}
