import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { useMyTodayTasksQuery, useUpdateMyTaskStatusMutation } from '@/hooks/useMypage';
import { TodayTask } from '@/types';

type FilterKey = 'ALL' | 'TODO' | 'DONE';

// 마이페이지 > 오늘의 과제 (프로젝트에 속하지 않은, 내 전체 과제 모아보기)
// 스크린샷 기준: 카드 없이 한 줄에 "프로젝트명 + 과제내용", 체크박스는 오른쪽, 구분선은 헤어라인.
export default function MyTodayTasksScreen() {
  const { data } = useMyTodayTasksQuery();
  const updateTaskStatusMutation = useUpdateMyTaskStatusMutation();
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

  // 체크박스를 누르면 화면에서 바로 상태를 바꾸고(낙관적 업데이트), 서버에도 저장해서
  // 채팅방 쪽 '오늘의 과제'와 항상 같은 상태를 보여주도록 합니다.
  const toggleTask = (taskId: number) => {
    const target = tasks.find((t) => t.taskId === taskId);
    if (!target) return;
    if (!target.projectId) {
      // mock 데이터 등 projectId가 없는 항목은 로컬 상태만 바꿉니다.
      setTasks((prev) =>
        prev.map((t) => (t.taskId === taskId ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' } : t))
      );
      return;
    }
    const previousStatus = target.status;
    const nextStatus = previousStatus === 'DONE' ? 'TODO' : 'DONE';
    setTasks((prev) => prev.map((t) => (t.taskId === taskId ? { ...t, status: nextStatus } : t)));
    updateTaskStatusMutation.mutate(
      { projectId: target.projectId, taskId, status: nextStatus },
      {
        onError: (error: any) => {
          setTasks((prev) =>
            prev.map((t) => (t.taskId === taskId ? { ...t, status: previousStatus } : t))
          );
          Alert.alert(
            '과제 상태 저장 실패',
            error?.message ?? '알 수 없는 오류로 과제 상태를 저장하지 못했어요.'
          );
        },
      }
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
