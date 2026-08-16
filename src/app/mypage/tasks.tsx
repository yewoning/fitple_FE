import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { useMyTodayTasksQuery } from '@/hooks/useMypage';
import { TodayTask } from '@/types';

type FilterKey = 'ALL' | 'TODO' | 'DONE';

// 마이페이지 > 오늘의 과제 (프로젝트에 속하지 않은, 내 전체 과제 모아보기)
export default function MyTodayTasksScreen() {
  const { data } = useMyTodayTasksQuery();
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
    <SafeAreaView className="flex-1 bg-gray-1">
      <ScreenHeader title="오늘의 과제" />
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
            className="flex-row items-center gap-3 py-3"
            onPress={() => toggleTask(item.taskId)}
            activeOpacity={0.7}
          >
            <View
              className={`h-5 w-5 rounded-md border-[1.5px] ${
                item.status === 'DONE' ? 'border-sky-blue bg-sky-blue' : 'border-gray-3 bg-white'
              }`}
            />
            <Text
              className={`flex-1 font-sans text-[15px] ${
                item.status === 'DONE' ? 'text-gray-4 line-through' : 'text-black'
              }`}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View className="h-px bg-gray-2" />}
      />
    </SafeAreaView>
  );
}
