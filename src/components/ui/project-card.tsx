import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { ProjectSummary } from '@/types';

import { StatusBadge } from './badge';

// 스크랩 / 지원 현황 화면 스크린샷 기준 카드 UI
export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <View className="flex-row gap-3 rounded-2xl bg-white p-3.5 shadow-sm shadow-gray-5-overlay">
      <View className="h-12 w-12 items-center justify-center rounded-xl bg-white-dark-sky-blue">
        <Ionicons name="folder-outline" size={22} color="#4876ee" />
      </View>
      <View className="flex-1 gap-1.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-shrink font-sans text-[15px] font-semibold text-black" numberOfLines={1}>
            {project.title}
          </Text>
          <StatusBadge status={project.recruitStatus} />
        </View>
        <Text className="font-sans text-[13px] text-gray-6" numberOfLines={1}>
          모집 역할 {project.roles.join(' · ')}
        </Text>
        {project.dDay ? (
          <Text className="self-end font-sans text-[13px] font-bold text-gray-6">{project.dDay}</Text>
        ) : null}
      </View>
    </View>
  );
}
