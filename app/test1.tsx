import { View, Text } from 'react-native';
import React from 'react';
import { Button } from '~/components/Button';
import { router } from 'expo-router';
import { useDatabaseUtils } from '~/utils/dbUtils';

export default function Test1() {
  const { resetDatabase } = useDatabaseUtils();
  return (
    <View className="mx-3 flex-1 justify-between">
      <Text>index</Text>
      <View className="my-5">
        <Button className="my-2" title="Main" onPress={() => router.push('./main')} />
        <Button className="my-2" title="Test" onPress={() => router.push('./test')} />
        <Button className="my-2" title="Reset database" onPress={resetDatabase} />
      </View>
    </View>
  );
}
