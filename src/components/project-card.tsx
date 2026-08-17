import { Text, View } from 'react-native';
import { getDDayLabel } from '@/utils/dday';
import type { ProjectCardData, ProjectStatus } from '@/types/project';

export type ProjectCardVariant = 'progress' | 'task';

export interface ProjectCardProps {
  data: ProjectCardData;
  variant: ProjectCardVariant;
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
      className={`rounded-[4px] pb-[2px] pl-[2px] pr-[3px] pt-[1px] ${config.badgeClassName}`}
    >
      <Text className={`font-sans text-[10px] font-medium leading-[10px] ${config.textClassName}`}>
        {config.label}
      </Text>
    </View>
  );
}

export function ProjectCard({ data, variant }: ProjectCardProps) {
  return (
    <View className="w-full rounded-2xl bg-white p-3">
      <View className="flex-row items-center justify-between gap-1">
        <Text
          className="shrink font-sans text-base font-bold leading-none text-black"
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

        <Text className="font-sans text-xs font-semibold text-dark-blue">
          {getDDayLabel(data.deadline)}
        </Text>
      </View>
    </View>
  );
}
