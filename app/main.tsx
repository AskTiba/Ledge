import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import Header from '~/components/Header';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function Main() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const [transactionsData, setTransactionsData] = useState<schema.Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const transactionsResult = await drizzleDb.query.transactions.findMany();
        setTransactionsData(transactionsResult || []);
      } catch (err) {
        console.error('Database fetch error:', err);
        setError('Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  // Group transactions by month
  const groupedTransactions = transactionsData.reduce(
    (acc, transaction) => {
      const month = transaction.date.slice(0, 7); // Extract YYYY-MM
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(transaction);
      return acc;
    },
    {} as Record<string, schema.Transaction[]>
  );

  // Extract unique months from transactions
  const months = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  // Calculate the total income, expense, and net balance for the selected month
  const calculateMonthlySummary = (month: string) => {
    const transactionsForMonth = groupedTransactions[month] || [];

    const totalIncome = transactionsForMonth
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpense = transactionsForMonth
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const netBalance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, netBalance };
  };

  const { totalIncome, totalExpense, netBalance } = calculateMonthlySummary(selectedMonth);

  // Render each transaction as a card
  const renderTransactionCard = ({ item }: { item: schema.Transaction }) => (
    <TouchableOpacity
      onLongPress={() => console.log('delete transaction')}
      className="mb-3 rounded-lg bg-white p-4 shadow-xl">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-semibold">${item.amount.toFixed(2)}</Text>
        <Text
          className={`text-sm font-medium ${
            item.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
          {item.type}
        </Text>
      </View>
      {/* <Text className="mb-1 text-gray-600">Category: {item.type}</Text> */}
      <Text className="mb-1 text-gray-600">Date: {dayjs(item.date).format('MMM D, YYYY')}</Text>
      {item.note && <Text className="text-gray-600">Note: {item.note}</Text>}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <Stack.Screen
        options={{
          headerTitle: 'Transactions',
          // headerTitleAlign: 'center',
          headerRight: () => (
            <View className="flex-row items-center justify-between px-4">
              <Text className="text-xl font-bold">Transactions</Text>
              <View className="rounded-lg border border-gray-300">
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                  style={{ width: 150 }}>
                  {months.map((month) => (
                    <Picker.Item
                      key={month}
                      label={dayjs(month).format('MMMM YYYY')}
                      value={month}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          ),
        }}
      />
      {/* Monthly Summary Dashboard */}
      <View className="bg-white p-4 shadow-sm">
        <Text className="mb-1 px-3 text-lg font-semibold">Monthly Summary</Text>
        <View className="flex-row justify-between">
          <View className="mr-2 flex-1 rounded-lg bg-green-50 p-3">
            <Text className="text-gray-600">Income</Text>
            <Text className="text-xl font-bold text-green-600">${totalIncome.toFixed(2)}</Text>
          </View>
          <View className="mx-2 flex-1 rounded-lg bg-red-50 p-3">
            <Text className="text-gray-600">Expense</Text>
            <Text className="text-xl font-bold text-red-600">${totalExpense.toFixed(2)}</Text>
          </View>
          <View className="ml-2 flex-1 rounded-lg bg-blue-50 p-3">
            <Text className="text-gray-600">Net Balance</Text>
            <Text className="text-xl font-bold text-blue-600">${netBalance.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={groupedTransactions[selectedMonth] || []}
        keyExtractor={(transaction) => transaction.id.toString()}
        renderItem={renderTransactionCard}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="mt-4 text-center text-gray-500">No transactions for this month.</Text>
        }
      />
    </View>
  );
}
