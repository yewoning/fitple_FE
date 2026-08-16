import { Text, View } from 'react-native';
import { getDDayLabel } from '@/utils/dday';
import type { ProjectCardData, ProjectStatus } from '@/types/project';

export type ProjectCardVariant = 'carousel' | 'progress' | 'task';

export interface ProjectCardProps {
  data: ProjectCardData;
  variant: ProjectCardVariant;
}

const SUB_INFO_LABEL: Record<ProjectCardVariant, string> = {
  carousel: '모집 역할',
  progress: '나의 담당 업무',
  task: '오늘의 과제',
};

const STATUS_BADGE_CONFIG: Record<
  ProjectStatus,
  { label: string; badgeClassName: string; textClassName: string }
> = {
  recruiting: { label: '모집중', badgeClassName: 'bg-sky-blue', textClassName: 'text-white' },
  'recruit-closed': {
    label: '모집완료',
    badgeClassName: 'bg-gray-2',
    textClassName: 'text-gray-5',
  },
  'in-progress': {
    label: '진행중',
    badgeClassName: 'bg-dark-sky-blue',
    textClassName: 'text-dark-blue',
  },
  completed: { label: '완료', badgeClassName: 'bg-gray-2', textClassName: 'text-gray-5' },
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_BADGE_CONFIG[status];

  return (
    <View className={`rounded-full px-2 py-0.5 ${config.badgeClassName}`}>
      <Text className={`font-sans text-xs font-medium ${config.textClassName}`}>
        {config.label}
      </Text>
    </View>
  );
}

export function ProjectCard({ data, variant }: ProjectCardProps) {
  return (
    <View className="w-full rounded-2xl bg-white-dark-sky-blue p-4">
      <View className="flex-row items-center justify-between gap-2">
        <Text
          className="flex-1 font-sans text-[15px] font-semibold text-black"
          numberOfLines={1}
        >
          {data.projectName}
        </Text>
        <StatusBadge status={data.status} />
      </View>

      <Text className="mt-3 font-sans text-xs text-gray-5">{SUB_INFO_LABEL[variant]}</Text>
      <Text className="mt-1 font-sans text-sm text-black" numberOfLines={2}>
        {data.subInfo}
      </Text>

      <Text className="mt-3 font-sans text-xs font-semibold text-sky-blue">
        {getDDayLabel(data.deadline)}
      </Text>
    </View>
  );
}
