import { Pressable, Text, View } from 'react-native';
import { StatusBadge } from '@/components/project-card';
import { formatDDayValue, getDDayLabel } from '@/utils/dday';
import type { ProjectCardData } from '@/types/project';

export interface RecommendedProjectRowProps {
  data: ProjectCardData;
  onPress?: () => void;
}

function getDDayText(data: ProjectCardData): string | null {
  if (typeof data.dDay === 'number') return formatDDayValue(data.dDay);
  if (data.deadline) return getDDayLabel(data.deadline);
  return null;
}

export function RecommendedProjectRow({ data, onPress }: RecommendedProjectRowProps) {
  return (
    <Pressable
      accessibilityLabel={data.projectName}
      accessibilityRole="button"
      className="flex-row items-center justify-between gap-2 py-1.5"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1">
          <Text
            className="shrink font-sans-bold text-base leading-none text-black"
            style={{ letterSpacing: 0.16 }}
            numberOfLines={1}
          >
            {data.projectName}
          </Text>
          <StatusBadge status={data.status} />
        </View>

        <View className="mt-1 flex-row items-center gap-1">
          <Text className="font-sans-medium text-xs text-dark-blue">모집 역할</Text>
          <Text className="font-sans text-xs text-gray-5" numberOfLines={1}>
            {data.subInfo}
          </Text>
        </View>
      </View>

      <Text className="font-sans-semibold text-xs text-dark-blue">{getDDayText(data)}</Text>
    </Pressable>
  );
}
