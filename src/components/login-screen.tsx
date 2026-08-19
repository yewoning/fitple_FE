import { AuthInput } from "@/components/auth-input";
import { AuthScreenLayout } from "@/components/auth-screen-layout";
import { PrimaryButton } from "@/components/primary-button";
import { DATA_MODE } from "@/config/demo";
import { ApiError } from "@/services/api-client";
import { signin } from "@/services/auth";
import { getMyProfile } from "@/services/member";
import { getProfile } from "@/services/profile";
import { useAuthStore } from "@/store/auth-store";
import { LOGIN_ID_MESSAGE, LOGIN_ID_PATTERN } from "@/utils/auth-validation";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";

interface LoginFormValues {
  loginId: string;
  password: string;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const IDENTITY_MISMATCH_MESSAGE =
  "이전 계정 세션이 남아 있어 로그인 정보를 확인할 수 없습니다. 앱을 완전히 종료한 뒤 다시 시도해주세요.";

/**
 * signin이 준 memberId가 실제 로그인된 세션의 주인과 같은지 확인합니다.
 *
 * 백엔드에 로그아웃 API가 없어서, 같은 기기에서 계정을 바꿔도 이전 JSESSIONID가 남습니다.
 * 그 상태로 로그인하면 앱이 이전 계정의 memberId를 들고 다니게 되고, 채팅 메시지가 엉뚱한
 * 사람 이름으로 저장됩니다(= 다른 사람이 보낸 메시지가 내 메시지처럼 보이는 문제).
 *
 * 세션 기준 이름(GET /api/profile)과 memberId 기준 이름(GET /api/members/me)을 맞대봐서
 * 다르면 로그인을 막습니다. 확인이 불가능한 경우(목업 모드 / 이름 없음 / 조회 실패)는
 * 통과시킵니다 — 이 검증은 보조 장치이지 로그인의 조건이 아니기 때문입니다.
 */
async function isIdentityConsistent(memberId: number, sessionName: string | undefined) {
  // 목업 모드엔 서버 세션 자체가 없어서 비교할 대상이 없습니다.
  if (DATA_MODE === "mock-only") return true;
  if (!sessionName?.trim()) return true;

  let memberName: string | undefined;
  try {
    memberName = (await getMyProfile(memberId)).name;
  } catch {
    return true;
  }

  if (!memberName?.trim() || memberName === sessionName) return true;

  console.warn(
    `[auth] 로그인 정체성 불일치: signin memberId=${memberId} → "${memberName}", 세션 → "${sessionName}"`,
  );
  return false;
}

export function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    loginId?: string | string[];
    notice?: string | string[];
  }>();
  const authenticate = useAuthStore((state) => state.authenticate);
  const [requestError, setRequestError] = useState<string | null>(null);
  const notice = firstParam(params.notice);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      loginId: firstParam(params.loginId) ?? "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    setRequestError(null);

    let signinResponse;

    try {
      signinResponse = await signin({ login_id: values.loginId, password: values.password });
    } catch (error) {
      setRequestError(
        error instanceof ApiError
          ? error.message
          : "로그인하지 못했습니다. 잠시 후 다시 시도해주세요.",
      );
      return;
    }

    try {
      const profile = await getProfile();
      const hasProfile = Boolean(profile.profileSummary?.trim());

      if (!(await isIdentityConsistent(signinResponse.memberId, profile.name))) {
        setRequestError(IDENTITY_MISMATCH_MESSAGE);
        return;
      }

      authenticate(values.loginId, signinResponse.memberId);
      router.replace((hasProfile ? "/home" : "/profile-setup") as Href);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        authenticate(values.loginId, signinResponse.memberId);
        router.replace("/profile-setup" as Href);
        return;
      }

      setRequestError(
        error instanceof ApiError
          ? error.message
          : "로그인은 완료되었지만 프로필 정보를 확인하지 못했습니다. 다시 시도해주세요.",
      );
    }
  });

  return (
    <AuthScreenLayout
      title={
        <>
          <Text className="font-sans-semibold">로그인</Text>하고{`\n`}
          <Text className="font-sans-semibold">팀원을 만나보세요!</Text>
        </>
      }
    >
      <View className="gap-[11px]">
        {notice ? (
          <Text
            accessibilityLiveRegion="polite"
            className="ml-3 font-sans text-[12px] leading-4 text-blue-2"
          >
            {notice}
          </Text>
        ) : null}

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
              editable={!isSubmitting}
              error={error?.message}
              label="이메일 주소 또는 아이디"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="이메일 주소 또는 아이디"
              returnKeyType="next"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: "비밀번호를 입력해주세요." }}
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
              onSubmitEditing={onSubmit}
              placeholder="비밀번호"
              returnKeyType="done"
              secureTextEntry
              value={value}
            />
          )}
        />

        {requestError ? (
          <Text
            accessibilityLiveRegion="assertive"
            className="ml-3 font-sans text-[12px] leading-4 text-red-600"
          >
            {requestError}
          </Text>
        ) : null}

        <PrimaryButton
          label="로그인"
          loading={isSubmitting}
          loadingLabel="로그인 중..."
          onPress={onSubmit}
        />
      </View>
    </AuthScreenLayout>
  );
}
