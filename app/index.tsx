import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { categories, transactions, months_summary } from '~/db/schema'; // Your schema setup
import { useSQLiteContext } from 'expo-sqlite';
import * as schema from '~/db/schema';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import Card from '~/components/nativewindui/Card';

export default function Index() {
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [transactionList, setTransactionList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  // Get the current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
  console.log('Current Month:', currentMonth);

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories data first
        let categoriesData;
        try {
          categoriesData = await drizzleDb.query.categories.findMany();
          console.log('Categories Data:', categoriesData);
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
        setCategoryList(categoriesData || []);

        // Fetch monthly summary for the current month
        let summary;
        try {
          summary = await drizzleDb.query.months_summary.findMany();
          console.log('Monthly Summary:', summary);
        } catch (error) {
          console.error('Error fetching monthly summary:', error);
        }
        setMonthlySummary(summary?.[0] || null);

        // Fetch transactions for the current month
        let transactionsData;
        try {
          transactionsData = await drizzleDb.query.transactions.findMany();
          console.log('Transactions Data:', transactionsData);
        } catch (error) {
          console.error('Error fetching transactions:', error);
        }
        setTransactionList(transactionsData || []);
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };

    fetchData();
  }, [currentMonth]);

  // If no data, show loading or empty state
  if (!monthlySummary || !transactionList || !categoryList) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  if (transactionList.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg">No transactions found for this month.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Stack.Screen options={{ headerTitle: 'Ledge', headerShadowVisible: false }} />
      <StatusBar style="dark" />
      {/* Monthly Summary Section */}
      <View className="mb-6 rounded-lg bg-gray-100 p-4 shadow-lg">
        <Text className="text-xl font-semibold text-gray-700">Monthly Summary</Text>
        <Text className="mt-2 text-lg text-gray-600">
          Total Income: ${monthlySummary.total_income}
        </Text>
        <Text className="text-lg text-gray-600">
          Total Expense: ${monthlySummary.total_expense}
        </Text>
        <Text className="text-lg font-bold text-green-600">
          Net Balance: ${monthlySummary.net_balance}
        </Text>
      </View>

      {/* Transactions Section */}
      <FlatList
        data={transactionList || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const category =
            categoryList.find((cat) => cat.id === item.category_id)?.name || 'Unknown';

          return (
            <View className="mb-4 rounded-lg bg-blue-100 p-3 shadow-sm">
              <Text className="font-bold text-gray-700">{category}</Text>
              <Text className="text-sm text-gray-500">{item.note}</Text>
              <Text
                className={`mt-2 ${item.type === 'income' ? 'text-green-500' : 'text-red-500'} font-bold`}>
                ${item.amount}
              </Text>
              <Text className="text-xs text-gray-400">{item.date}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}
