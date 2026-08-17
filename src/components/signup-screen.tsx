import { AuthInput } from "@/components/auth-input";
import { AuthScreenLayout } from "@/components/auth-screen-layout";
import { PrimaryButton } from "@/components/primary-button";
import { ApiError } from "@/services/api-client";
import { checkLoginId, signin, signup } from "@/services/auth";
import { useAuthStore } from "@/store/auth-store";
import type { SignupRequest } from "@/types/auth";
import {
  LOGIN_ID_MESSAGE,
  LOGIN_ID_PATTERN,
  PASSWORD_MESSAGE,
  PASSWORD_PATTERN,
} from "@/utils/auth-validation";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

interface LoginIdCheckState {
  loginId: string;
  available: boolean;
  message: string;
}

export function SignupScreen() {
  const router = useRouter();
  const authenticate = useAuthStore((state) => state.authenticate);
  const [loginIdCheck, setLoginIdCheck] = useState<LoginIdCheckState | null>(
    null,
  );
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
      name: "",
      loginId: "",
      password: "",
      passwordConfirm: "",
    },
    mode: "onTouched",
  });

  const currentLoginId = watch("loginId");
  const loginIdCheckUnavailable = isCheckingLoginId || isSubmitting;
  const isCurrentLoginIdAvailable =
    loginIdCheck?.available === true && loginIdCheck.loginId === currentLoginId;

  const handleCheckLoginId = async () => {
    const isValid = await trigger("loginId");

    if (!isValid) {
      return;
    }

    const loginId = getValues("loginId");
    setIsCheckingLoginId(true);
    setRequestError(null);

    try {
      const response = await checkLoginId(loginId);
      const available = response.data?.available === true;
      setLoginIdCheck({ loginId, available, message: response.message });

      if (!available) {
        setError("loginId", { type: "validate", message: response.message });
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "아이디 중복확인에 실패했습니다. 잠시 후 다시 시도해주세요.";
      setLoginIdCheck(null);
      setRequestError(message);
    } finally {
      setIsCheckingLoginId(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const hasAvailableLoginId =
      loginIdCheck?.available === true &&
      loginIdCheck.loginId === values.loginId;

    if (!hasAvailableLoginId) {
      setError("loginId", {
        type: "validate",
        message: "아이디 중복확인을 완료해주세요.",
      });
      return;
    }

    setRequestError(null);

    try {
      await signup({ ...values, name: values.name.trim() });
    } catch (error) {
      setRequestError(
        error instanceof ApiError
          ? error.message
          : "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
      return;
    }

    try {
      await signin({ login_id: values.loginId, password: values.password });
      authenticate(values.loginId);
      router.replace("/auth-complete" as Href);
    } catch {
      const notice = encodeURIComponent(
        "회원가입은 완료되었습니다. 로그인해주세요.",
      );
      const loginId = encodeURIComponent(values.loginId);
      router.replace(`/login?loginId=${loginId}&notice=${notice}` as Href);
    }
  });

  return (
    <AuthScreenLayout
      title={
        <>
          <Text className="font-sans-semibold">회원가입</Text>하고{`\n`}
          <Text className="font-sans-semibold">다양한 프로젝트</Text>에
          {`\n`}
          참여해보세요
        </>
      }
      footer={
        <View className="mt-auto pt-9">
          {requestError ? (
            <Text
              accessibilityLiveRegion="assertive"
              className="mb-3 ml-3 font-sans text-[12px] leading-4 text-red-600"
            >
              {requestError}
            </Text>
          ) : null}

          <PrimaryButton
            disabled={isCheckingLoginId || !isCurrentLoginIdAvailable}
            label="다음"
            loading={isSubmitting}
            loadingLabel="가입 중..."
            onPress={onSubmit}
          />
        </View>
      }
    >
      <View className="gap-[11px]">
        <Controller
          control={control}
          name="name"
          rules={{
            validate: (value) =>
              value.trim().length > 0 || "이름을 입력해주세요.",
          }}
          render={({
            field: { onBlur, onChange, value },
            fieldState: { error },
          }) => (
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
            required: "아이디를 입력해주세요.",
            pattern: { value: LOGIN_ID_PATTERN, message: LOGIN_ID_MESSAGE },
          }}
          render={({
            field: { onBlur, onChange, value },
            fieldState: { error },
          }) => (
            <AuthInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loginIdCheckUnavailable}
              error={error?.message}
              helperText={LOGIN_ID_MESSAGE}
              label="아이디"
              onBlur={onBlur}
              onChangeText={(nextValue) => {
                onChange(nextValue);
                if (loginIdCheck?.loginId !== nextValue) {
                  setLoginIdCheck(null);
                }
              }}
              placeholder="아이디"
              returnKeyType="next"
              successText={
                loginIdCheck?.available ? loginIdCheck.message : undefined
              }
              trailing={
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: loginIdCheckUnavailable,
                    busy: isCheckingLoginId,
                  }}
                  disabled={loginIdCheckUnavailable}
                  hitSlop={12}
                  onPress={handleCheckLoginId}
                  style={({ pressed }) => ({
                    opacity: pressed && !loginIdCheckUnavailable ? 0.6 : 1,
                  })}
                >
                  <Text
                    className={`font-sans-semibold text-[13px] ${
                      loginIdCheckUnavailable ? "text-gray-4" : "text-gray-6"
                    }`}
                  >
                    {isCheckingLoginId ? "확인 중" : "중복확인"}
                  </Text>
                </Pressable>
              }
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: "비밀번호를 입력해주세요.",
            pattern: { value: PASSWORD_PATTERN, message: PASSWORD_MESSAGE },
          }}
          render={({
            field: { onBlur, onChange, value },
            fieldState: { error },
          }) => (
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
            required: "비밀번호를 다시 입력해주세요.",
            validate: (value) =>
              value === getValues("password") ||
              "비밀번호가 일치하지 않습니다.",
          }}
          render={({
            field: { onBlur, onChange, value },
            fieldState: { error },
          }) => (
            <AuthInput
              autoCapitalize="none"
              editable={!isSubmitting}
              error={error?.message}
              helperText={PASSWORD_MESSAGE}
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
      </View>
    </AuthScreenLayout>
  );
}
