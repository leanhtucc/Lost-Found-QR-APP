import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Delete } from 'lucide-react-native';

interface CustomNumpadProps {
  onPressDigit: (digit: string) => void;
  onPressBackspace: () => void;
}

const numpadLayout = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'delete'],
];

const letterMapping: Record<string, string> = {
  '1': '',
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
  '0': '',
};

export const CustomNumpad: React.FC<CustomNumpadProps> = ({ onPressDigit, onPressBackspace }) => {
  return (
    <View className="w-full px-4 pt-4 pb-8">
      {numpadLayout.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between mb-4">
          {row.map((btn, colIndex) => {
            if (btn === '') {
              return <View key={colIndex} className="flex-1 items-center justify-center h-16" />;
            }

            if (btn === 'delete') {
              return (
                <TouchableOpacity
                  key={colIndex}
                  className="flex-1 items-center justify-center h-16 active:opacity-60"
                  onPress={onPressBackspace}
                >
                  <Delete size={28} color="#FFFFFF" strokeWidth={1.5} />
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={btn}
                className="flex-1 items-center justify-center h-16 active:opacity-60"
                onPress={() => onPressDigit(btn)}
              >
                <Text className="text-[26px] text-white font-medium">{btn}</Text>
                {letterMapping[btn] ? (
                  <Text className="text-[10px] text-gray-400 font-medium tracking-widest mt-1">
                    {letterMapping[btn]}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};
