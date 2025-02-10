import { View, Text, Dimensions } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { sql } from 'drizzle-orm/sql/sql';
import LottieView from 'lottie-react-native';
import { Button } from '~/components/Button';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export default function Test() {
  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      setDimensions({ window, screen });
    });
    return () => subscription?.remove();
  }, []);

  const animation = useRef<LottieView>(null);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const [isLoading, setIsLoading] = useState(true);
  const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM

  // Fetch database information
  useEffect(() => {
    const fetchData = async () => {
      try {
        await drizzleDb.$client.execAsync('VACUUM');

        // ✅ Get list of tables
        const tables = await drizzleDb
          .select({ name: sql<string>`name` })
          .from(sql`sqlite_master`)
          .where(sql`type = 'table'`);

        const tableNames = tables.map((table) => table.name);
        console.log('Tables in database:', tableNames);

        // // ✅ Reusable function to check table fields
        // const getTableFields = async (tableName: string) => {
        //   const fields = await drizzleDb.$client.getAllSync(`PRAGMA table_info(${tableName})`);
        //   console.log(`Fields in ${tableName}:`, fields);
        //   return fields;
        // };

        // // ✅ Check transactions & categories fields
        // if (tableNames.includes('transactions')) await getTableFields('transactions');
        // if (tableNames.includes('categories')) await getTableFields('categories');

        // ✅ Fetch categories
        const categoriesData = await drizzleDb.query.categories.findMany();
        console.log('Categories Data:', categoriesData);

        // ✅ Fetch transactions
        const transactionsData = await drizzleDb.query.transactions.findMany();
        // console.log('Transactions Data:', transactionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentMonth]);

  return (
    <View className="mx-4 flex-1 items-center justify-center bg-transparent">
      <LottieView
        autoPlay
        ref={animation}
        style={{ width: 200, height: 200 }}
        source={require('~/assets/lotties/loading.json')}
      />
      <View className="pt-5">
        <Button
          title="Restart Animation"
          onPress={() => {
            animation.current?.reset();
            animation.current?.play();
          }}
        />
      </View>

      {/* ✅ Optimized Dimensions Rendering */}
      {Object.entries(dimensions).map(([type, values]) => (
        <View key={type}>
          <Text className="my-3 text-base">
            {type.charAt(0).toUpperCase() + type.slice(1)} Dimensions
          </Text>
          {Object.entries(values).map(([key, value]) => (
            <Text key={key}>
              {key} - {value}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
