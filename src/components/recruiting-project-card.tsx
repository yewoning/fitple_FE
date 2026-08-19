import { Image, Pressable, Text, View } from 'react-native';
import { StatusBadge } from '@/components/project-card';
import { formatDDayValue, getDDayLabel } from '@/utils/dday';
import type { RecruitingProjectCardData } from '@/types/project';

const FALLBACK_ICON = require('../../assets/icons/idea.webp');

export interface RecruitingProjectCardProps {
  data: RecruitingProjectCardData;
  /** 지원 현황처럼 카드의 프로젝트 상태와 별개인 상태(대기중/선정/미선정)를 덧붙일 때 쓴다. */
  statusLabel?: string;
  onPress?: () => void;
}

function getDDayText(data: RecruitingProjectCardData): string | null {
  if (typeof data.dDay === 'number') return formatDDayValue(data.dDay);
  if (data.deadline) return getDDayLabel(data.deadline);
  return null;
}

export function RecruitingProjectCard({ data, statusLabel, onPress }: RecruitingProjectCardProps) {
  const dDayText = getDDayText(data);
  const iconSource = data.imageUrl ? { uri: data.imageUrl } : (data.icon ?? FALLBACK_ICON);

  return (
    <Pressable
      accessibilityLabel={data.projectName}
      accessibilityRole="button"
      className="w-full flex-row items-center gap-3 py-1"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="h-20 w-20 items-center justify-center rounded-2xl bg-white">
        <Image source={iconSource} resizeMode="contain" style={{ width: 48, height: 48 }} />
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

        {data.subInfo ? (
          <View className="mt-1.5 flex-row items-center gap-1">
            <Text className="font-sans-medium text-xs text-dark-blue">모집 역할</Text>
            <Text className="min-w-0 flex-1 font-sans text-xs text-gray-5" numberOfLines={1}>
              {data.subInfo}
            </Text>
          </View>
        ) : null}

        {statusLabel || dDayText ? (
          <View className="mt-1.5 flex-row items-center justify-between">
            <Text className="font-sans-medium text-xs text-gray-5">{statusLabel ?? ''}</Text>
            <Text className="font-sans-semibold text-xs text-dark-blue">{dDayText ?? ''}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
