import { View, Text, ViewStyle } from 'react-native';
import React from 'react';

interface CardProps extends React.PropsWithChildren {
  style?: ViewStyle;
}

export default function Card({ children, style = {} }: CardProps) {
  return (
    <View
      className="rounded-xl bg-white p-5"
      style={{
        elevation: 8,
        shadowColor: '#000',
        shadowRadius: 8,
        shadowOffset: { height: 6, width: 0 },
        shadowOpacity: 0.15,
        ...style,
      }}>
      {children}
    </View>
  );
}
