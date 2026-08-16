import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type Href, useRouter } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { AuthInput } from '@/components/auth-input';
import { AuthScreenLayout } from '@/components/auth-screen-layout';
import { PrimaryButton } from '@/components/primary-button';
import { AuthApiError, checkLoginId, signin, signup } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import type { SignupRequest } from '@/types/auth';
import {
  LOGIN_ID_MESSAGE,
  LOGIN_ID_PATTERN,
  PASSWORD_MESSAGE,
  PASSWORD_PATTERN,
} from '@/utils/auth-validation';

interface LoginIdCheckState {
  loginId: string;
  available: boolean;
  message: string;
}

export function SignupScreen() {
  const router = useRouter();
  const authenticate = useAuthStore((state) => state.authenticate);
  const [loginIdCheck, setLoginIdCheck] = useState<LoginIdCheckState | null>(null);
  const [isCheckingLoginId, setIsCheckingLoginId] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const {
    control,
    getValues,
    handleSubmit,
    setError,
    trigger,
    watch,
    formState: { isSubmitting },
  } = useForm<SignupRequest>({
    defaultValues: {
      name: '',
      loginId: '',
      password: '',
      passwordConfirm: '',
    },
    mode: 'onTouched',
  });

  const currentLoginId = watch('loginId');
  const loginIdCheckUnavailable = isCheckingLoginId || isSubmitting;
  const isCurrentLoginIdAvailable =
    loginIdCheck?.available === true && loginIdCheck.loginId === currentLoginId;

  const handleCheckLoginId = async () => {
    const isValid = await trigger('loginId');

    if (!isValid) {
      return;
    }

    const loginId = getValues('loginId');
    setIsCheckingLoginId(true);
    setRequestError(null);

    try {
      const response = await checkLoginId(loginId);
      const available = response.data?.available === true;
      setLoginIdCheck({ loginId, available, message: response.message });

      if (!available) {
        setError('loginId', { type: 'validate', message: response.message });
      }
    } catch (error) {
      const message =
        error instanceof AuthApiError
          ? error.message
          : '아이디 중복확인에 실패했습니다. 잠시 후 다시 시도해주세요.';
      setLoginIdCheck(null);
      setRequestError(message);
    } finally {
      setIsCheckingLoginId(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const hasAvailableLoginId =
      loginIdCheck?.available === true && loginIdCheck.loginId === values.loginId;

    if (!hasAvailableLoginId) {
      setError('loginId', {
        type: 'validate',
        message: '아이디 중복확인을 완료해주세요.',
      });
      return;
    }

    setRequestError(null);

    try {
      await signup({ ...values, name: values.name.trim() });
    } catch (error) {
      setRequestError(
        error instanceof AuthApiError
          ? error.message
          : '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.',
      );
      return;
    }

    try {
      await signin({ loginId: values.loginId, password: values.password });
      authenticate(values.loginId);
      router.replace('/auth-complete' as Href);
    } catch {
      const notice = encodeURIComponent('회원가입은 완료되었습니다. 로그인해주세요.');
      const loginId = encodeURIComponent(values.loginId);
      router.replace(`/login?loginId=${loginId}&notice=${notice}` as Href);
    }
  });

  return (
    <AuthScreenLayout title={<>회원가입하고{`\n`}다양한 프로젝트에{`\n`}참여해보세요</>}>
      <View className="gap-5">
        <Controller
          control={control}
          name="name"
          rules={{
            validate: (value) => value.trim().length > 0 || '이름을 입력해주세요.',
          }}
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthInput
              autoCapitalize="words"
              editable={!isSubmitting}
              error={error?.message}
              label="이름"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="이름"
              returnKeyType="next"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="loginId"
          rules={{
            required: '아이디를 입력해주세요.',
            pattern: { value: LOGIN_ID_PATTERN, message: LOGIN_ID_MESSAGE },
          }}
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <View className="gap-2">
              <Text className="font-sans text-sm font-medium text-gray-6">아이디</Text>
              <View className="flex-row gap-2">
                <TextInput
                  accessibilityLabel="아이디"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className={`h-14 flex-1 rounded-2xl border bg-white px-4 font-sans text-base text-black ${
                    error ? 'border-red-500' : 'border-gray-2'
                  }`}
                  editable={!loginIdCheckUnavailable}
                  onBlur={onBlur}
                  onChangeText={(nextValue) => {
                    onChange(nextValue);
                    if (loginIdCheck?.loginId !== nextValue) {
                      setLoginIdCheck(null);
                    }
                  }}
                  placeholder="아이디"
                  placeholderTextColor="#a8adbe"
                  returnKeyType="next"
                  value={value}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: loginIdCheckUnavailable,
                    busy: isCheckingLoginId,
                  }}
                  className={`h-14 justify-center rounded-2xl px-4 ${
                    loginIdCheckUnavailable ? 'bg-gray-3' : 'bg-gray-6'
                  }`}
                  disabled={loginIdCheckUnavailable}
                  onPress={handleCheckLoginId}
                  style={({ pressed }) => ({
                    opacity: pressed && !loginIdCheckUnavailable ? 0.8 : 1,
                  })}
                >
                  <Text className="font-sans text-sm font-semibold text-gray-1">
                    {isCheckingLoginId ? '확인 중...' : '중복확인'}
                  </Text>
                </Pressable>
              </View>
              {error ? (
                <Text accessibilityLiveRegion="polite" className="font-sans text-sm text-red-600">
                  {error.message}
                </Text>
              ) : loginIdCheck ? (
                <Text
                  accessibilityLiveRegion="polite"
                  className={`font-sans text-sm ${
                    loginIdCheck.available ? 'text-blue-2' : 'text-red-600'
                  }`}
                >
                  {loginIdCheck.message}
                </Text>
              ) : (
                <Text className="font-sans text-sm text-gray-5">6~12자 영문, 숫자로 입력해주세요.</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: '비밀번호를 입력해주세요.',
            pattern: { value: PASSWORD_PATTERN, message: PASSWORD_MESSAGE },
          }}
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthInput
              autoCapitalize="none"
              editable={!isSubmitting}
              error={error?.message}
              label="비밀번호"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="비밀번호"
              returnKeyType="next"
              secureTextEntry
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="passwordConfirm"
          rules={{
            required: '비밀번호를 다시 입력해주세요.',
            validate: (value) => value === getValues('password') || '비밀번호가 일치하지 않습니다.',
          }}
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthInput
              autoCapitalize="none"
              editable={!isSubmitting}
              error={error?.message}
              label="비밀번호 확인"
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={onSubmit}
              placeholder="비밀번호 확인"
              returnKeyType="done"
              secureTextEntry
              value={value}
            />
          )}
        />

        <Text className="font-sans text-sm leading-5 text-gray-5">{PASSWORD_MESSAGE}</Text>

        {requestError ? (
          <Text accessibilityLiveRegion="assertive" className="font-sans text-sm text-red-600">
            {requestError}
          </Text>
        ) : null}

        <View className="mt-3">
          <PrimaryButton
            disabled={isCheckingLoginId || !isCurrentLoginIdAvailable}
            label="회원가입"
            loading={isSubmitting}
            loadingLabel="가입 중..."
            onPress={onSubmit}
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
}
