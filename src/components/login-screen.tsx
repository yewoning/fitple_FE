import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { AuthInput } from '@/components/auth-input';
import { AuthScreenLayout } from '@/components/auth-screen-layout';
import { PrimaryButton } from '@/components/primary-button';
import { AuthApiError, signin } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import { LOGIN_ID_MESSAGE, LOGIN_ID_PATTERN } from '@/utils/auth-validation';

interface LoginFormValues {
  loginId: string;
  password: string;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ loginId?: string | string[]; notice?: string | string[] }>();
  const authenticate = useAuthStore((state) => state.authenticate);
  const [requestError, setRequestError] = useState<string | null>(null);
  const notice = firstParam(params.notice);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      loginId: firstParam(params.loginId) ?? '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setRequestError(null);

    try {
      await signin(values);
      authenticate(values.loginId);
      router.replace('/auth-complete' as Href);
    } catch (error) {
      setRequestError(
        error instanceof AuthApiError
          ? error.message
          : '로그인하지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  });

  return (
    <AuthScreenLayout title={<>로그인하고{`\n`}팀원을 만나보세요!</>}>
      <View className="gap-5">
        {notice ? (
          <Text accessibilityLiveRegion="polite" className="font-sans text-sm text-blue-2">
            {notice}
          </Text>
        ) : null}

        <Controller
          control={control}
          name="loginId"
          rules={{
            required: '아이디를 입력해주세요.',
            pattern: { value: LOGIN_ID_PATTERN, message: LOGIN_ID_MESSAGE },
          }}
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              error={error?.message}
              label="아이디"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="아이디"
              returnKeyType="next"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: '비밀번호를 입력해주세요.' }}
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <AuthInput
              autoCapitalize="none"
              editable={!isSubmitting}
              error={error?.message}
              label="비밀번호"
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={onSubmit}
              placeholder="비밀번호"
              returnKeyType="done"
              secureTextEntry
              value={value}
            />
          )}
        />

        {requestError ? (
          <Text accessibilityLiveRegion="assertive" className="font-sans text-sm text-red-600">
            {requestError}
          </Text>
        ) : null}

        <View className="mt-3">
          <PrimaryButton
            label="로그인"
            loading={isSubmitting}
            loadingLabel="로그인 중..."
            onPress={onSubmit}
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
}
