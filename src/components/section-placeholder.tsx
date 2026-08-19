import { ActivityIndicator, Text, View } from 'react-native';

export interface SectionPlaceholderProps {
  isLoading: boolean;
  /** 조회에 실패했을 때 보여줄 문구. null이면 실패하지 않은 것으로 본다. */
  errorMessage: string | null;
  /** 조회는 성공했지만 결과가 0건일 때 보여줄 문구. */
  emptyMessage: string;
}

/**
 * 홈 섹션의 로딩·실패·0건 상태를 한 곳에서 처리한다.
 * 실패를 빈 목록으로 감추면 사용자가 "데이터가 없다"와 "불러오지 못했다"를 구분할 수 없다.
 * 표현은 projects-screen.tsx의 기존 패턴을 따른다.
 */
export function SectionPlaceholder({ isLoading, errorMessage, emptyMessage }: SectionPlaceholderProps) {
  if (isLoading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator color="#828797" />
      </View>
    );
  }

  return (
    <View className="items-center py-8">
      <Text className="font-sans text-sm text-gray-5">{errorMessage ?? emptyMessage}</Text>
    </View>
  );
}
