import { ActivityIndicator, Pressable, Text } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  loadingLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}

export function PrimaryButton({
  label,
  loadingLabel = '처리 중...',
  disabled = false,
  loading = false,
  onPress,
}: PrimaryButtonProps) {
  const unavailable = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      className={`h-14 flex-row items-center justify-center gap-2 rounded-full ${
        unavailable ? 'bg-gray-3' : 'bg-sky-blue'
      }`}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed && !unavailable ? 0.8 : 1 })}
    >
      {loading ? <ActivityIndicator color="#f6f8fb" /> : null}
      <Text className="font-sans text-base font-semibold text-gray-1">
        {loading ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}
