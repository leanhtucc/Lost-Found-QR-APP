import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ title, variant = 'primary', ...props }) => {
  const variantStyles = {
    primary: 'bg-blue-600',
    secondary: 'bg-green-600',
    danger: 'bg-red-600',
  };

  return (
    <TouchableOpacity className={`px-6 py-3 rounded-lg ${variantStyles[variant]}`} {...props}>
      <Text className="text-white text-center font-semibold">{title}</Text>
    </TouchableOpacity>
  );
};
