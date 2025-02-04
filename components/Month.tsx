import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import React, { useRef, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';

const Months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ITEM_WIDTH = 120; // Width for each month item
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Month() {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const flashListRef = useRef<FlashList<string>>(null);

  // Duplicate the Months array for infinite scrolling
  const infiniteMonths = [...Months, ...Months, ...Months];

  // Handle month selection and scroll to the selected item
  const handleMonthPress = (item: string, index: number) => {
    setSelectedMonth(item);

    // Calculate the offset to center the selected item
    const offset = index * ITEM_WIDTH - (SCREEN_WIDTH / 2 - ITEM_WIDTH / 2);

    // Ensure the offset stays within bounds
    const maxOffset = (infiniteMonths.length - 1) * ITEM_WIDTH;
    const targetOffset = Math.max(0, Math.min(offset, maxOffset));

    // Scroll to the calculated offset
    flashListRef.current?.scrollToOffset({
      offset: targetOffset,
      animated: true,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Month Selector */}
      <View className="flex-1 justify-center">
        <FlashList
          ref={flashListRef}
          data={infiniteMonths}
          keyExtractor={(item, index) => `${item}-${index}`} // Unique key for each item
          estimatedItemSize={ITEM_WIDTH} // Optimize performance
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SCREEN_WIDTH / 2 - ITEM_WIDTH / 2 }} // Center items initially
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => handleMonthPress(item, index)}
              className={`mx-2 items-center justify-center rounded-lg p-4 ${
                selectedMonth === item ? 'bg-emerald-500 shadow-lg' : 'bg-gray-700'
              }`}
              style={{
                width: ITEM_WIDTH,
                shadowColor: selectedMonth === item ? '#34D399' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
              }}>
              <Text
                className={`text-lg ${
                  selectedMonth === item ? 'font-bold text-white' : 'font-medium text-gray-300'
                }`}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Selected Month Display */}
      {selectedMonth && (
        <View className="absolute bottom-10 w-full items-center">
          <Text className="text-2xl font-bold text-white">Selected: {selectedMonth}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
