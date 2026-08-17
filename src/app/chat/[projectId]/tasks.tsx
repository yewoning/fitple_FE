import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { useTodayTasksQuery } from '@/hooks/useChat';
import { TodayTask } from '@/types';

type FilterKey = 'ALL' | 'TODO' | 'DONE';

// 채팅방 > 오늘의 과제 (특정 프로젝트에 속한 과제 목록)
// 스크린샷 기준: 카드 없이 한 줄에 "프로젝트명 + 과제내용", 체크박스는 오른쪽, 구분선은 헤어라인.
export default function ProjectTodayTasksScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId: string }>();
  const projectId = Number(projectIdParam);
  const { data } = useTodayTasksQuery(projectId, 'ALL');
  const [tasks, setTasks] = useState<TodayTask[]>([]);
  const [filter, setFilter] = useState<FilterKey>('ALL');

  useEffect(() => {
    if (data?.tasks) setTasks(data.tasks);
  }, [data]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter]
  );

  const counts = useMemo(
    () => ({
      ALL: tasks.length,
      TODO: tasks.filter((t) => t.status === 'TODO').length,
      DONE: tasks.filter((t) => t.status === 'DONE').length,
    }),
    [tasks]
  );

  const toggleTask = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' } : t))
    );
  };

  return (
    <CommonLayout header={{ title: '오늘의 과제', showBack: true }} bottomNav={false}>
      <View className="min-h-0 flex-1 bg-gray-1">
        <SegmentedTabs
          options={[
            { key: 'ALL', label: `전체 ${counts.ALL}` },
            { key: 'TODO', label: `진행 ${counts.TODO}` },
            { key: 'DONE', label: `완료 ${counts.DONE}` },
          ]}
          value={filter}
          onChange={(k) => setFilter(k as FilterKey)}
        />
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.taskId)}
          contentContainerClassName="px-5 pt-1"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center gap-3 py-3.5"
              onPress={() => toggleTask(item.taskId)}
              activeOpacity={0.7}
            >
              <Text className="min-w-0 flex-1 font-sans text-[14px] leading-5 text-black" numberOfLines={1}>
                <Text className="font-sans-bold">{item.projectName}</Text>
                <Text> {item.title}</Text>
              </Text>
              <View
                className={`h-5 w-5 rounded-md border-[1.5px] ${
                  item.status === 'DONE' ? 'border-sky-blue bg-sky-blue' : 'border-gray-3 bg-white'
                }`}
              />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View className="h-px bg-gray-2" />}
        />
      </View>
    </CommonLayout>
  );
}
