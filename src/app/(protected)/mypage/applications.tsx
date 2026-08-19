import { useMemo, useState } from 'react';
import { type Href, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { RecruitingProjectCard } from '@/components/recruiting-project-card';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { useApplicationsQuery } from '@/hooks/useMypage';
import { API_STATUS_TO_PROJECT_STATUS } from '@/services/project';
import { useAuthStore } from '@/store/auth-store';
import type { MyApplicationItem } from '@/types/application';
import type { RecruitingProjectCardData } from '@/types/project';

type FilterKey = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED';

// 지원 상태(PENDING/ACCEPTED/REJECTED)는 프로젝트 상태(모집중/진행중/완료)와 별개다.
// 카드의 배지는 프로젝트 상태를 쓰므로, 지원 상태는 statusLabel로 따로 붙인다.
const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: '대기중',
  ACCEPTED: '선정',
  REJECTED: '미선정',
};

function toCardData(item: MyApplicationItem): RecruitingProjectCardData {
  return {
    id: String(item.applicationId),
    projectName: item.projectTitle,
    status: API_STATUS_TO_PROJECT_STATUS[item.projectStatus] ?? 'recruiting',
    subInfo: item.roles.join(' · '),
    dDay: item.dday,
    imageUrl: item.imageUrl,
  };
}

export default function ApplicationsScreen() {
  const router = useRouter();
  const memberId = useAuthStore((state) => state.memberId);
  const { data, isLoading } = useApplicationsQuery(memberId);
  const applications: MyApplicationItem[] = useMemo(() => data ?? [], [data]);
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const filtered = useMemo(
    () => (filter === 'ALL' ? applications : applications.filter((a) => a.status === filter)),
    [applications, filter]
  );

  const counts = useMemo(
    () => ({
      ALL: applications.length,
      PENDING: applications.filter((a) => a.status === 'PENDING').length,
      ACCEPTED: applications.filter((a) => a.status === 'ACCEPTED').length,
      REJECTED: applications.filter((a) => a.status === 'REJECTED').length,
    }),
    [applications]
  );

  return (
    <CommonLayout header={{ title: '지원 현황', showBack: true }} bottomNav={false}>
      <View className="min-h-0 flex-1 bg-gray-1">
        <SegmentedTabs
          options={[
            { key: 'ALL', label: `전체 ${counts.ALL}` },
            { key: 'PENDING', label: `대기 ${counts.PENDING}` },
            { key: 'ACCEPTED', label: `선정 ${counts.ACCEPTED}` },
            { key: 'REJECTED', label: `미선정 ${counts.REJECTED}` },
          ]}
          value={filter}
          onChange={(k) => setFilter(k as FilterKey)}
        />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#828797" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.applicationId)}
            contentContainerClassName="px-5 pb-8 pt-1"
            ItemSeparatorComponent={() => <View className="h-3" />}
            ListEmptyComponent={
              <Text className="mt-16 text-center font-sans text-sm text-gray-5">
                {filter === 'ALL' ? '아직 지원한 프로젝트가 없어요' : '해당하는 지원이 없어요'}
              </Text>
            }
            renderItem={({ item }) => (
              <RecruitingProjectCard
                data={toCardData(item)}
                statusLabel={APPLICATION_STATUS_LABEL[item.status] ?? item.status}
                onPress={() => router.push(`/project/${item.projectId}` as Href)}
              />
            )}
          />
        )}
      </View>
    </CommonLayout>
  );
}
