import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { categories, transactions, months_summary } from '~/db/schema';
import { useSQLiteContext } from 'expo-sqlite';
import * as schema from '~/db/schema';
import { eq } from 'drizzle-orm';
import { StatusBar } from 'expo-status-bar';
import { router, Stack } from 'expo-router';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons'; // For icons
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'; // For loading states
import { ProgressBar } from 'react-native-paper'; // For progress bar

export default function Index() {
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [transactionList, setTransactionList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current; // For fade-in animation

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  // Get the current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories data first
        const categoriesData = await drizzleDb.query.categories.findMany();
        console.log(categoriesData);
        setCategoryList(categoriesData || []);

        // Fetch monthly summary for the current month
        const summary = await drizzleDb.query.months_summary.findMany();
        console.log(summary);
        setMonthlySummary(summary?.[0] || null);

        // Fetch transactions for the current month
        const transactionsData = await drizzleDb.query.transactions.findMany();
        console.log(transactionsData);
        setTransactionList(transactionsData || []);
        setFilteredTransactions(transactionsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchData();
  }, [currentMonth]);

  // Filter transactions based on search query
  useEffect(() => {
    const filtered = transactionList.filter((item) =>
      item.note?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTransactions(filtered);
  }, [searchQuery, transactionList]);

  // Handle long press to delete a transaction
  const handleLongPress = (item: any) => {
    setSelectedTransaction(item);
    setIsDeleteModalVisible(true);
  };

  // Delete a transaction
  const deleteTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      await drizzleDb.delete(transactions).where(transactions.id.eq(selectedTransaction.id));
      const updatedTransactions = transactionList.filter((t) => t.id !== selectedTransaction.id);
      setTransactionList(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
      setIsDeleteModalVisible(false);
      Alert.alert('Success', 'Transaction deleted successfully.');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Error', 'Failed to delete transaction.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-white p-4">
        <Stack.Screen options={{ headerTitle: 'Ledge', headerShadowVisible: false }} />
        <StatusBar style="dark" />
        <SkeletonPlaceholder>
          <SkeletonPlaceholder.Item padding={16}>
            <SkeletonPlaceholder.Item
              width="100%"
              height={100}
              borderRadius={12}
              marginBottom={16}
            />
            <SkeletonPlaceholder.Item width="100%" height={60} borderRadius={12} marginBottom={8} />
            <SkeletonPlaceholder.Item width="100%" height={60} borderRadius={12} marginBottom={8} />
            <SkeletonPlaceholder.Item width="100%" height={60} borderRadius={12} marginBottom={8} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </View>
    );
  }

  // Empty state
  if (transactionList.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Stack.Screen options={{ headerTitle: 'Ledge', headerShadowVisible: false }} />
        <StatusBar style="dark" />
        <MaterialIcons name="receipt" size={64} color="#6b7280" />
        <Text className="mt-4 text-lg text-gray-600">No transactions found for this month.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerTitle: 'Ledge',
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="#4b5563" />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar style="dark" />

      {/* Monthly Summary Section */}
      <View className="rounded-b-3xl bg-[#6366f1] p-6 shadow-lg">
        <Text className="text-2xl font-bold text-white">Monthly Summary</Text>
        <View className="mt-4">
          <Text className="text-lg text-white">
            💰 Total Income: ${monthlySummary.total_income}
          </Text>
          <Text className="text-lg text-white">
            💸 Total Expense: ${monthlySummary.total_expense}
          </Text>
          <Text className="mt-2 text-xl font-bold text-white">
            🏦 Net Balance: ${monthlySummary.net_balance}
          </Text>
        </View>
        <ProgressBar
          progress={monthlySummary.total_expense / monthlySummary.total_income || 0}
          color="#ffffff"
          className="mt-4 h-2 rounded-full"
        />
      </View>

      {/* Search Bar */}
      <View className="p-4">
        <View className="flex-row items-center rounded-lg bg-gray-100 px-4 py-2">
          <FontAwesome name="search" size={16} color="#6b7280" />
          <TextInput
            placeholder="Search transactions..."
            className="ml-2 flex-1"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Transactions Section */}
      <Animated.FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const category =
            categoryList.find((cat) => cat.id === item.category_id)?.name || 'Unknown';

          return (
            <TouchableOpacity onLongPress={() => handleLongPress(item)} activeOpacity={0.8}>
              <Animated.View
                className="mb-4 rounded-lg bg-white p-4 shadow-sm"
                style={{
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name={item.type === 'income' ? 'trending-up' : 'trending-down'}
                      size={20}
                      color={item.type === 'income' ? '#10b981' : '#ef4444'}
                      className="mr-2"
                    />
                    <View>
                      <Text className="font-bold text-gray-800">{category}</Text>
                      <Text className="text-sm text-gray-500">{item.note}</Text>
                    </View>
                  </View>
                  <Text
                    className={`text-lg font-bold ${
                      item.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`}>
                    ${item.amount}
                  </Text>
                </View>
                <Text className="mt-2 text-xs text-gray-400">{item.date}</Text>
              </Animated.View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        className="absolute bottom-8 right-8 rounded-full bg-[#6366f1] p-4 shadow-lg"
        onPress={() => {
          console.log('Add Transaction');
          router.push('/AddTransaction');
        }}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="w-80 rounded-lg bg-white p-6">
            <Text className="mb-4 text-lg font-bold">Delete Transaction</Text>
            <Text className="mb-6 text-gray-600">
              Are you sure you want to delete this transaction?
            </Text>
            <View className="flex-row justify-end">
              <Pressable className="mr-2 px-4 py-2" onPress={() => setIsDeleteModalVisible(false)}>
                <Text className="text-gray-600">Cancel</Text>
              </Pressable>
              <Pressable className="rounded-lg bg-red-500 px-4 py-2" onPress={deleteTransaction}>
                <Text className="text-white">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
