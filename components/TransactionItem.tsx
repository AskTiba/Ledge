import { View, Text } from 'react-native';
import React from 'react';
import { Transaction } from '~/db/schema';

export default function TransactionItem({ transaction }: { transaction: Transaction }) {
  return (
    <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-semibold">${item.amount.toFixed(2)}</Text>
        <Text
          className={`text-sm font-medium ${
            item.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
          {item.type}
        </Text>
      </View>
      <Text className="mb-1 text-gray-600">Category: {item.category_id}</Text>
      <Text className="mb-1 text-gray-600">Date: {dayjs(item.date).format('MMM D, YYYY')}</Text>
      {item.note && <Text className="text-gray-600">Note: {item.note}</Text>}
    </View>
  );
}
