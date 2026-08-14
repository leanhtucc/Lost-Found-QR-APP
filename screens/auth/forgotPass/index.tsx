import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useAuth } from '@hooks/useAuth';
import { validateEmail } from '@services/auth';
import { ResponsiveContainer } from '@components/atoms/ResponsiveContainer';
import { FIND_BACK } from '@constants/theme';
import { ForgotPassBackButton, ForgotPassFormView, ForgotPassSuccessView } from './components';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isLoading, forgotPassword, navigateToRegister, navigateToLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isEmailValid = useMemo(() => email.trim().length > 0, [email]);

  const handleGoBack = () => navigation.goBack();

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
  };

  const handlePasswordReset = async () => {
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      setError(emailResult.error || 'Email không hợp lệ');
      return;
    }

    setError('');
    const success = await forgotPassword(email.trim());
    if (success) setIsSuccess(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-fb-neutral">
      <StatusBar barStyle="light-content" backgroundColor={FIND_BACK.canvas} />

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <ResponsiveContainer className="flex-1 px-6 mt-14 justify-center" variant="form">
          <ForgotPassBackButton onPress={handleGoBack} />

          {isSuccess ? (
            <ForgotPassSuccessView email={email} onLogin={navigateToLogin} />
          ) : (
            <ForgotPassFormView
              email={email}
              error={error}
              isLoading={isLoading}
              isEmailValid={isEmailValid}
              onEmailChange={handleEmailChange}
              onSubmit={handlePasswordReset}
              onRegister={navigateToRegister}
            />
          )}
        </ResponsiveContainer>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
