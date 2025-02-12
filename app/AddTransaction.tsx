import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Button } from '~/components/Button';
import { Category, transactions } from '~/db/schema';
import * as schema from '~/db/schema';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useNavigation } from 'expo-router';
import { eq } from 'drizzle-orm';

export default function AddTransaction() {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: '',
      note: '',
      date: date.toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const type = currentTab === 0 ? 'expense' : 'income';
        const result = await drizzleDb.query.categories.findMany({
          where: (categories, { eq }) => eq(categories.type, type),
        });
        setCategories(result);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [currentTab]);

  const onSubmit = async (data: { amount: string; note: string; date: string }) => {
    if (!selectedCategory) {
      console.error('Please select a category.');
      return;
    }

    try {
      const category = categories.find((cat) => cat.name === selectedCategory);
      if (!category) {
        console.error('Selected category not found.');
        return;
      }

      const newTransaction = await drizzleDb
        .insert(transactions)
        .values({
          amount: parseFloat(data.amount),
          type: currentTab === 0 ? 'expense' : 'income',
          category_id: category.id,
          date: data.date,
          note: data.note,
        })
        .returning();

      console.log('Transaction added:', newTransaction);

      // Navigate back to the main screen and pass the new transaction
      router.replace({
        pathname: '/main', // Change this to your actual main screen route
        params: { newTransaction: JSON.stringify(newTransaction[0]) },
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setValue('date', currentDate.toISOString().split('T')[0]);
  };

  return (
    <View className="mx-3 flex-1">
      <Stack.Screen options={{ headerTitle: 'New Entry', headerTitleAlign: 'center' }} />

      <Controller
        control={control}
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="mt-3 rounded-lg border pl-4"
            placeholder="Amount"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
          />
        )}
        name="amount"
      />
      {errors.amount && <Text className="text-red-500">{errors.amount.message}</Text>}

      <Controller
        control={control}
        rules={{ required: 'Description is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="mt-3 rounded-lg border pl-4"
            placeholder="Description"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="note"
      />
      {errors.note && <Text className="text-red-500">{errors.note.message}</Text>}

      <Controller
        control={control}
        rules={{ required: 'Date is required' }}
        render={({ field: { value } }) => (
          <TouchableOpacity onPress={() => setShowDatePicker(true)} className="mt-3">
            <TextInput
              className="rounded-lg border pl-4"
              placeholder="Date"
              value={value}
              editable={false}
            />
          </TouchableOpacity>
        )}
        name="date"
      />
      {errors.date && <Text className="text-red-500">{errors.date.message}</Text>}

      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
      )}

      <View className="my-4">
        <SegmentedControl
          values={['Expense', 'Income']}
          selectedIndex={currentTab}
          onChange={(event) => setCurrentTab(event.nativeEvent.selectedSegmentIndex)}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className=" max-h-screen">
        <View className="flex-col gap-2">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              className={`rounded-lg p-3 ${selectedCategory === cat.name ? 'bg-blue-500' : 'bg-gray-300'}`}
              onPress={() => setSelectedCategory(cat.name)}>
              <Text
                className={`text-center font-medium ${selectedCategory === cat.name ? 'text-white' : 'text-gray-700'}`}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Button className="my-4" title="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
