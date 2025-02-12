import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Category, Transaction, transactions } from '~/db/schema';
import { eq, desc } from 'drizzle-orm'; // Import desc for sorting
import { useLocalSearchParams } from 'expo-router';

export default function Main() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  const params = useLocalSearchParams();

  // Fetch data on component mount
  useEffect(() => {
    loadData();
  }, [db]);

  useEffect(() => {
    if (typeof params.newTransaction === 'string') {
      try {
        const transaction = JSON.parse(params.newTransaction); // Parse string back to object
        setTransactionsData((prev) => [transaction, ...prev]); // Add new transaction to the list
      } catch (error) {
        console.error('Error parsing transaction:', error);
      }
    }
  }, [params.newTransaction]);

  const loadData = async () => {
    try {
      const transactionsResult = await drizzleDb.query.transactions.findMany({
        orderBy: (transactions) => [desc(transactions.created_at)], // Sort by created_at in descending order
      });
      setTransactionsData(transactionsResult || []);

      const categoryResult = await drizzleDb.query.categories.findMany();
      setCategoriesData(categoryResult || []);
    } catch (err) {
      console.error('Database fetch error:', err);
      setError('Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a transaction
  const deleteTransaction = async (id: number) => {
    try {
      // Use eq to create a proper SQL condition
      await drizzleDb.delete(transactions).where(eq(transactions.id, id)).execute();

      // Update the state to remove the deleted transaction
      setTransactionsData((prevData) => prevData.filter((transaction) => transaction.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction.');
    }
  };

  // Group transactions by month and sort within each month
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

  // Sort transactions within each month by created_at in descending order
  for (const month in groupedTransactions) {
    groupedTransactions[month].sort(
      (a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
    );
  }


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

  // Helper function to get category name by ID
  const getCategoryNameById = (categoryId: number) => {
    const category = categoriesData.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const renderTransactionCard = ({ item }: { item: schema.Transaction }) => (
    <TouchableOpacity
      onLongPress={() => deleteTransaction(item.id)} // Trigger delete on long press
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
      <Text className="mb-1 text-gray-600">Category: {getCategoryNameById(item.category_id)}</Text>
      <Text className="mb-1 text-gray-600">Date: {dayjs(item.date).format('MMM D, YYYY')}</Text>
      {item.note && <Text className="text-gray-600">Note: {item.note}</Text>}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <Stack.Screen
        options={{
          headerTitle: 'Transactions',
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
      <View className="mx-3 mt-2 rounded-lg bg-white p-4 shadow-xl">
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
        showsVerticalScrollIndicator={false}
        keyExtractor={(transaction) => transaction.id.toString()}
        renderItem={renderTransactionCard}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="mt-10 flex-1 items-center justify-center">
            <LottieView
              autoPlay
              style={{ width: 300, height: 400 }}
              source={require('~/assets/lotties/nodata.json')}
            />
            <Text className="text-base">There is no transaction data for this month</Text>
          </View>
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        className="absolute bottom-10 right-8 rounded-full bg-[#6366f1] p-4 shadow-lg"
        onPress={() => {
          console.log('Add Transaction');
          router.push('./AddTransaction');
        }}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
