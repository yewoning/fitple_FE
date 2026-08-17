import { Text, View } from 'react-native';
import { StatusBadge } from '@/components/project-card';
import { getDDayLabel } from '@/utils/dday';
import type { ProjectCardData } from '@/types/project';

export interface RecommendedProjectRowProps {
  data: ProjectCardData;
}

export function RecommendedProjectRow({ data }: RecommendedProjectRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-2 py-1.5">
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1">
          <Text
            className="shrink font-sans text-base font-bold leading-none text-black"
            style={{ letterSpacing: 0.16 }}
            numberOfLines={1}
          >
            {data.projectName}
          </Text>
          <StatusBadge status={data.status} />
        </View>

        <View className="mt-1 flex-row items-center gap-1">
          <Text className="font-sans text-xs font-medium text-dark-blue">모집 역할</Text>
          <Text className="font-sans text-xs text-gray-5" numberOfLines={1}>
            {data.subInfo}
          </Text>
        </View>
      </View>

      <Text className="font-sans text-xs font-semibold text-dark-blue">
        {getDDayLabel(data.deadline)}
      </Text>
    </View>
  );
}
