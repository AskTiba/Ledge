import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Button } from '~/components/Button';
import { Category } from '~/db/schema';
import * as schema from '~/db/schema';
import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import CategoryButton from '~/components/CategoryButton';

export default function AddTransaction() {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [typeSelected, setTypeSelected] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number>(1);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { resetDatabase } = useDatabaseUtils();

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const [category, setCategory] = useState<string>('Expense');
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: '',
      note: '',
      date: '',
    },
  });

  React.useEffect(() => {
    getExpenseType(currentTab);
  }, [currentTab]);

  async function getExpenseType(currentTab: number) {
    const type = currentTab === 0 ? 'expense' : 'income';
    setCategory(type);

    try {
      const result = await drizzleDb.query.categories.findMany();
      setCategories(result);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  const onSubmit = (data: any) => {
    // Include category_id in the data
    const transactionData = {
      ...data,
      category_id: categoryId,
    };
    console.log(transactionData);
  };

  // Filter categories based on the selected segment
  const filteredCategories = categories.filter(
    (cat) => cat.type === (currentTab === 0 ? 'expense' : 'income')
  );

  // Create a map of category names to their IDs
  const categoryMap = filteredCategories.reduce(
    (map, cat) => {
      map[cat.name] = cat.id;
      return map;
    },
    {} as Record<string, number>
  );

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  return (
    <View>
      <View className="mx-3">
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="mt-3 rounded-lg border pl-4"
              placeholder="Amount"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="amount"
        />
        {errors.amount && <Text>This is required.</Text>}
        <Controller
          control={control}
          rules={{
            required: true,
          }}
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
        {errors.note && <Text>This is required.</Text>}
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginTop: 15 }}>
              <TextInput
                className="mt-3 rounded-lg border pl-4"
                placeholder="Date"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={false}
              />
            </TouchableOpacity>
          )}
          name="date"
        />
        {errors.date && <Text>This is required.</Text>}

        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
        )}
        <View className="my-3">
          <SegmentedControl
            values={['Expense', 'Income']}
            style={{ marginBottom: 15 }}
            selectedIndex={currentTab}
            onChange={(event) => {
              setCurrentTab(event.nativeEvent.selectedSegmentIndex);
            }}
          />
          {filteredCategories.map((cat) => (
            <CategoryButton
              key={cat.name}
              id={cat.id}
              title={cat.name}
              isSelected={typeSelected === cat.name}
              setTypeSelected={setTypeSelected}
              setCategoryId={setCategoryId}
              categoryMap={categoryMap}
            />
          ))}
        </View>
        <Button className="" title="Submit" onPress={handleSubmit(onSubmit)} />
        <Button className="my-2" title="Reset database" onPress={resetDatabase} />
      </View>
    </View>
  );
}
