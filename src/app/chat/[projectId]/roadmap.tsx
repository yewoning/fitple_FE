import { useLocalSearchParams } from 'expo-router';
import { FlatList, Text, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { useRoadmapQuery } from '@/hooks/useChat';
import { getDDayLabel } from '@/utils/dday';
import { RoadmapPhase } from '@/types';

// 프로젝트 로드맵 화면 스크린샷 기준: 번호 배지 + 세로 타임라인 선, 카드 안에 제목/담당/설명,
// 오른쪽에 D-day + 날짜.
export default function ProjectRoadmapScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId: string }>();
  const projectId = Number(projectIdParam);
  const { data } = useRoadmapQuery(projectId);
  const phases: RoadmapPhase[] = data?.phases ?? [];

  return (
    <CommonLayout header={{ title: '프로젝트 로드맵', showBack: true }} bottomNav={false}>
      <FlatList
        className="bg-gray-1"
        data={phases}
        keyExtractor={(item) => String(item.phaseId)}
        contentContainerClassName="px-5 py-4"
        renderItem={({ item, index }) => (
          <View className="flex-row">
            <View className="mr-3 items-center" style={{ width: 32 }}>
              <View className="h-8 w-8 items-center justify-center rounded-full bg-dark-blue">
                <Text className="font-sans-bold text-xs text-white">
                  {String(item.order).padStart(2, '0')}
                </Text>
              </View>
              {index !== phases.length - 1 ? <View className="mt-1 w-[2px] flex-1 bg-gray-2" /> : null}
            </View>

            <View className="mb-4 flex-1 flex-row items-start justify-between rounded-2xl bg-white p-4">
              <View className="min-w-0 flex-1 pr-3">
                <Text className="font-sans-bold text-[15px] text-black" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="mt-1 font-sans-medium text-xs text-dark-blue" numberOfLines={1}>
                  담당 {item.assignee}
                </Text>
                <Text className="mt-1 font-sans text-xs text-gray-6" numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-sans-bold text-base text-dark-blue">
                  {getDDayLabel(item.deadline)}
                </Text>
                <Text className="mt-1 font-sans text-[11px] text-gray-4">{item.dueDate}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </CommonLayout>
  );
}
