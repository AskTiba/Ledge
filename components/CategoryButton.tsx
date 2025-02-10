import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

export default function CategoryButton({
  id,
  title,
  isSelected,
  setTypeSelected,
  setCategoryId,
  categoryMap,
}: {
  id: number;
  title: string;
  isSelected: boolean;
  setTypeSelected: React.Dispatch<React.SetStateAction<string>>;
  setCategoryId: React.Dispatch<React.SetStateAction<number>>;
  categoryMap: Record<string, number>;
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        setTypeSelected(title);
        setCategoryId(categoryMap[title]);
      }}
      activeOpacity={0.6}
      style={{
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isSelected ? '#007BFF20' : '#00000020',
        borderRadius: 15,
        marginBottom: 6,
      }}>
      <Text
        style={{
          fontWeight: '700',
          color: isSelected ? '#007BFF' : '#000000',
          marginLeft: 5,
        }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
