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

export default function RootIndex() {
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
            <View className="mr-3">
              <TouchableOpacity onPress={() => bottomSheetRef.current?.snapToIndex(0)}>
                <Text className="text-lg">{dayjs(selectedMonth).format('MMMM YYYY')}</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View className="mx-4 mt-4 rounded-2xl bg-white p-5 shadow-lg">
        <Text className="mb-6 text-center text-2xl font-extrabold text-gray-800">
          Monthly Summary
        </Text>

        {/* Summary Grid */}
        <View className="mb-3 flex-row justify-between">
          {/* Income Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="mr-2 min-w-[30%] flex-1 items-center rounded-2xl bg-green-50 p-4 shadow-sm">
            <Ionicons name="arrow-up-circle" size={28} color="#16a34a" />
            <Text className="mt-1 text-sm font-medium text-gray-500">Income</Text>
            <Text
              className="mt-1 text-2xl font-bold text-green-600"
              numberOfLines={1}
              ellipsizeMode="clip"
              adjustsFontSizeToFit
              minimumFontScale={0.7}>
              ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </TouchableOpacity>

          {/* Expense Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="ml-2 min-w-[30%] flex-1 items-center rounded-2xl bg-red-50 p-4 shadow-sm">
            <Ionicons name="arrow-down-circle" size={28} color="#dc2626" />
            <Text className="mt-1 text-sm font-medium text-gray-500">Expense</Text>
            <Text
              className="mt-1 text-2xl font-bold text-red-600"
              numberOfLines={1}
              ellipsizeMode="clip"
              adjustsFontSizeToFit
              minimumFontScale={0.7}>
              ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Net Balance Full Card */}
        <View
          className={`mt-2 items-center rounded-2xl p-5 ${
            netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'
          } shadow-inner`}>
          <Ionicons name="wallet" size={32} color={netBalance >= 0 ? '#15803d' : '#b91c1c'} />
          <Text className="mt-1 text-base font-medium text-gray-700">Net Balance</Text>
          <Text
            className={`text-3xl font-extrabold ${
              netBalance >= 0 ? 'text-green-700' : 'text-red-700'
            } mt-1`}
            numberOfLines={1}
            ellipsizeMode="clip"
            adjustsFontSizeToFit
            minimumFontScale={0.7}>
            ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
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
