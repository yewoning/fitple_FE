import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, ...inputProps }: AuthInputProps) {
  return (
    <View className="gap-2">
      <Text className="font-sans text-sm font-medium text-gray-6">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        className={`h-14 rounded-2xl border bg-white px-4 font-sans text-base text-black ${
          error ? 'border-red-500' : 'border-gray-2'
        }`}
        placeholderTextColor="#a8adbe"
        {...inputProps}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" className="font-sans text-sm text-red-600">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
