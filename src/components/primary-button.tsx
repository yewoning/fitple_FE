import { ActivityIndicator, Pressable, Text } from 'react-native';

/**
 * accent는 같은 자리에 번갈아 뜨는 버튼을 색으로 구분해야 할 때 쓴다(예: 프로젝트 상세의
 * '지원하기' vs 게시자 전용 '지원자 관리'). 노란 배경 위에서는 흰 글씨의 명도 대비가
 * 1.4:1 수준이라 읽을 수 없어, 배경과 글자색을 항상 한 쌍으로 묶어서 바꾼다.
 */
const VARIANT_STYLE = {
  primary: { background: 'bg-sky-blue', text: 'text-gray-1' },
  accent: { background: 'bg-yellow-3', text: 'text-black' },
} as const;

interface PrimaryButtonProps {
  label: string;
  loadingLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: keyof typeof VARIANT_STYLE;
  onPress: () => void;
}

export function PrimaryButton({
  label,
  loadingLabel = '처리 중...',
  disabled = false,
  loading = false,
  variant = 'primary',
  onPress,
}: PrimaryButtonProps) {
  const unavailable = disabled || loading;
  const { background, text } = VARIANT_STYLE[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      className={`h-[55px] flex-row items-center justify-center gap-2 rounded-full shadow-lg shadow-gray-5-overlay ${
        unavailable ? 'bg-gray-3' : background
      }`}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed && !unavailable ? 0.8 : 1 })}
    >
      {loading ? <ActivityIndicator color="#f6f8fb" /> : null}
      <Text className={`font-sans-semibold text-base ${unavailable ? 'text-gray-1' : text}`}>
        {loading ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}
