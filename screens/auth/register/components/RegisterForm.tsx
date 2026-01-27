import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { InputField } from '../../../../components/InputField';

interface RegisterFormProps {
  onSubmit: (fullName: string, phone: string, email: string, password: string) => void;
  isLoading: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (fullName && phone && email && password) {
      onSubmit(fullName, phone, email, password);
    }
  };

  return (
    <View className="gap-4">
      {/* Full Name Input */}
      <View className="relative">
        <View className="absolute left-3 top-4 z-10">
          <User size={20} color="#6B7280" />
        </View>
        <InputField
          placeholder="Họ và tên"
          value={fullName}
          onChangeText={setFullName}
          className="pl-10 h-12 rounded-xl bg-gray-50 border-0"
        />
      </View>

      {/* Phone Input */}
      <View className="relative">
        <View className="absolute left-3 top-4 z-10">
          <Phone size={20} color="#6B7280" />
        </View>
        <InputField
          placeholder="Số điện thoại liên hệ"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          className="pl-10 h-12 rounded-xl bg-gray-50 border-0"
        />
      </View>

      {/* Email Input */}
      <View className="relative">
        <View className="absolute left-3 top-4 z-10">
          <Mail size={20} color="#6B7280" />
        </View>
        <InputField
          placeholder="Mã sinh viên @stu.ptit.edu.vn"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="pl-10 h-12 rounded-xl bg-gray-50 border-0"
        />
      </View>

      {/* Password Input */}
      <View className="relative">
        <View className="absolute left-3 top-4 z-10">
          <Lock size={20} color="#6B7280" />
        </View>
        <InputField
          secureTextEntry={!showPassword}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          className="pl-10 pr-10 h-12 rounded-xl bg-gray-50 border-0"
        />
        <TouchableOpacity
          className="absolute right-3 top-4 z-10"
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`h-12 rounded-xl justify-center items-center mt-2 ${
          isLoading ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'
        }`}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white text-base font-semibold">Tạo tài khoản</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
