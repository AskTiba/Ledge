import { View, Text } from 'react-native'
import React from 'react'
import { MonthSummary } from '~/db/schema'

export default function MontlySummary({ summary }: { summary: MonthSummary }) {
  return (
    <View className="p-4 bg-white border-b border-gray-200">
    <Text className="text-lg font-bold mb-2">{summary.month}</Text>
    <Text>Income: ${summary.total_income.toFixed(2)}</Text>
    <Text>Expenses: ${summary.total_expense.toFixed(2)}</Text>
    <Text>Net Balance: ${summary.net_balance.toFixed(2)}</Text>
  </View>
  )
}