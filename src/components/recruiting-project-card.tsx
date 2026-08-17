import { Image, Text, View } from 'react-native';
import { StatusBadge } from '@/components/project-card';
import { getDDayLabel } from '@/utils/dday';
import type { RecruitingProjectCardData } from '@/types/project';

export interface RecruitingProjectCardProps {
  data: RecruitingProjectCardData;
}

export function RecruitingProjectCard({ data }: RecruitingProjectCardProps) {
  return (
    <View className="w-full flex-row items-center gap-3 py-1">
      <View className="h-20 w-20 items-center justify-center rounded-2xl bg-white">
        <Image source={data.icon} resizeMode="contain" style={{ width: 48, height: 48 }} />
      </View>

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

        <View className="mt-1.5 flex-row items-center gap-1">
          <Text className="font-sans-medium text-xs text-dark-blue">모집 역할</Text>
          <Text className="min-w-0 flex-1 font-sans text-xs text-gray-5" numberOfLines={1}>
            {data.subInfo}
          </Text>
        </View>

        <View className="mt-1.5 flex-row justify-end">
          <Text className="font-sans-semibold text-xs text-dark-blue">
            {getDDayLabel(data.deadline)}
          </Text>
        </View>
      </View>
    </View>
  );
}
