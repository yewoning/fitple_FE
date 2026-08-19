import { Pressable, Text, View } from 'react-native';
import { formatDDayValue, getDDayLabel } from '@/utils/dday';
import type { ProjectCardData, ProjectStatus } from '@/types/project';

function getDDayText(data: ProjectCardData): string | null {
  if (typeof data.dDay === 'number') return formatDDayValue(data.dDay);
  if (data.deadline) return getDDayLabel(data.deadline);
  return null;
}

export type ProjectCardVariant = 'progress' | 'task';

export interface ProjectCardProps {
  data: ProjectCardData;
  variant: ProjectCardVariant;
  onPress?: () => void;
}

const SUB_INFO_LABEL: Record<ProjectCardVariant, string> = {
  progress: '나의 담당 업무',
  task: '오늘의 과제',
};

const STATUS_BADGE_CONFIG: Record<
  ProjectStatus,
  { label: string; badgeClassName: string; textClassName: string }
> = {
  recruiting: { label: '모집중', badgeClassName: 'bg-dark-blue', textClassName: 'text-white' },
  'recruit-closed': {
    label: '모집완료',
    badgeClassName: 'bg-gray-2',
    textClassName: 'text-gray-5',
  },
  'in-progress': {
    label: '진행중',
    badgeClassName: 'bg-dark-blue',
    textClassName: 'text-white',
  },
  completed: { label: '완료', badgeClassName: 'bg-gray-2', textClassName: 'text-gray-5' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_BADGE_CONFIG[status];

  return (
    <View
      className={`items-center justify-center rounded-[4px] px-1.5 py-0.5 ${config.badgeClassName}`}
    >
      <Text className={`font-sans-medium text-[10px] leading-[12px] ${config.textClassName}`}>
        {config.label}
      </Text>
    </View>
  );
}

export function ProjectCard({ data, variant, onPress }: ProjectCardProps) {
  // 이동할 곳이 없는 카드는 버튼으로 알리지 않는다.
  // (스크린리더가 버튼이라고 읽어주는데 눌러도 반응이 없는 상태를 피한다.)
  return (
    <Pressable
      accessibilityLabel={data.projectName}
      accessibilityRole={onPress ? 'button' : undefined}
      className="w-full rounded-2xl bg-white p-3"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="flex-row items-center justify-between gap-1">
        <Text
          className="shrink font-sans-bold text-base leading-none text-black"
          style={{ letterSpacing: 0.16 }}
          numberOfLines={1}
        >
          {data.projectName}
        </Text>
        <StatusBadge status={data.status} />
      </View>

      <View className="mt-1.5 flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text className="font-sans text-xs text-gray-5">{SUB_INFO_LABEL[variant]}</Text>
          <Text className="mt-0.5 font-sans text-sm text-black" numberOfLines={1}>
            {data.subInfo}
          </Text>
        </View>

        <Text className="font-sans-semibold text-xs text-dark-blue">{getDDayText(data)}</Text>
      </View>
    </Pressable>
  );
}
