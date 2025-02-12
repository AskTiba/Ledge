import React, { useState, useEffect, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '~/db/schema';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Category, Transaction, transactions } from '~/db/schema';
import { eq, desc } from 'drizzle-orm';
import { useLocalSearchParams } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';

export default function Main() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  const bottomSheetRef = useRef<BottomSheet>(null);

  const params = useLocalSearchParams();

  // Fetch data on component mount
  useEffect(() => {
    loadData();
  }, [db]);

  useEffect(() => {
    if (typeof params.newTransaction === 'string') {
      try {
        const transaction = JSON.parse(params.newTransaction);
        setTransactionsData((prev) => [transaction, ...prev]);
      } catch (error) {
        console.error('Error parsing transaction:', error);
      }
    }
  }, [params.newTransaction]);

  const loadData = async () => {
    try {
      const transactionsResult = await drizzleDb.query.transactions.findMany({
        orderBy: (transactions) => [desc(transactions.created_at)],
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

  const deleteTransaction = async (id: number) => {
    try {
      await drizzleDb.delete(transactions).where(eq(transactions.id, id)).execute();
      setTransactionsData((prevData) => prevData.filter((transaction) => transaction.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction.');
    }
  };

  const groupedTransactions = transactionsData.reduce(
    (acc, transaction) => {
      const month = transaction.date.slice(0, 7);
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(transaction);
      return acc;
    },
    {} as Record<string, schema.Transaction[]>
  );

  for (const month in groupedTransactions) {
    groupedTransactions[month].sort(
      (a, b) => dayjs(b.created_at).unix() - dayjs(a.created_at).unix()
    );
  }

  const months = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

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

  const getCategoryNameById = (categoryId: number) => {
    const category = categoriesData.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const renderTransactionCard = ({ item }: { item: schema.Transaction }) => (
    <TouchableOpacity
      onLongPress={() => deleteTransaction(item.id)}
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

  const handleMonthYearSelection = (month: string) => {
    setSelectedMonth(month);
    bottomSheetRef.current?.close();
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Stack.Screen
        options={{
          headerTitle: '',
          headerRight: () => (
            <View className='mr-3'>
              <TouchableOpacity onPress={() => bottomSheetRef.current?.snapToIndex(0)}>
                <Text className="text-lg">{dayjs(selectedMonth).format('MMMM YYYY')}</Text>
              </TouchableOpacity>
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

      {/* Bottom Sheet for Month and Year Selection */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // Initially closed
        snapPoints={['75%']}
        enablePanDownToClose
        backgroundComponent={({ style }) => <View style={[style, { backgroundColor: '#fff' }]} />}>
        <ScrollView className="p-4">
          {months.map((month) => (
            <TouchableOpacity
              key={month}
              className="border-b border-gray-200 py-3"
              onPress={() => handleMonthYearSelection(month)}>
              <Text className="text-base text-gray-800">{dayjs(month).format('MMMM YYYY')}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}
