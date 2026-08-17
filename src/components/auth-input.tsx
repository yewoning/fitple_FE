import type { ReactNode } from "react";
import type { TextInputProps } from "react-native";
import { Text, TextInput, View } from "react-native";

interface AuthInputProps extends TextInputProps {
  /** 시안에는 라벨 텍스트가 없어 접근성 라벨로만 사용 */
  label: string;
  error?: string;
  successText?: string;
  helperText?: string;
  /** 필드 안쪽 우측에 붙는 요소 (아이디 중복확인 버튼) */
  trailing?: ReactNode;
}

export function AuthInput({
  label,
  error,
  successText,
  helperText,
  trailing,
  ...inputProps
}: AuthInputProps) {
  const message = error ?? successText ?? helperText;
  const messageTone = error
    ? "text-red-600"
    : successText
      ? "text-blue-2"
      : "text-gray-5";

  return (
    <View>
      <View
        className={`h-[55px] flex-row items-center rounded-full bg-white px-7 ${
          error ? "border border-red-500" : ""
        }`}
      >
        <TextInput
          accessibilityLabel={label}
          className="h-full flex-1 p-0 font-sans text-[12px] text-black"
          placeholderTextColor="#828797"
          {...inputProps}
        />
        {trailing}
      </View>

      {message ? (
        <Text
          accessibilityLiveRegion={error || successText ? "polite" : "none"}
          className={`mb-1 ml-3 mt-[14px] font-sans text-[12px] leading-4 ${messageTone}`}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
