import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { RecruitingProjectCard } from '@/components/recruiting-project-card';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { useApplicationsQuery } from '@/hooks/useMypage';
import { ApplicationItem } from '@/types';

type FilterKey = 'ALL' | 'SELECTED' | 'NOT_SELECTED';

export default function ApplicationsScreen() {
  const { data } = useApplicationsQuery();
  const applications: ApplicationItem[] = useMemo(() => data?.applications ?? [], [data]);
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const filtered = useMemo(() => {
    if (filter === 'ALL') return applications;
    return applications.filter((a) => (filter === 'SELECTED' ? a.selected : !a.selected));
  }, [applications, filter]);

  const counts = useMemo(
    () => ({
      ALL: applications.length,
      SELECTED: applications.filter((a) => a.selected).length,
      NOT_SELECTED: applications.filter((a) => !a.selected).length,
    }),
    [applications]
  );

  return (
    <CommonLayout header={{ title: '지원 현황', showBack: true }} bottomNav={false}>
      <View className="min-h-0 flex-1 bg-gray-1">
        <SegmentedTabs
          options={[
            { key: 'ALL', label: `전체 ${counts.ALL}` },
            { key: 'SELECTED', label: `선정 ${counts.SELECTED}` },
            { key: 'NOT_SELECTED', label: `미선정 ${counts.NOT_SELECTED}` },
          ]}
          value={filter}
          onChange={(k) => setFilter(k as FilterKey)}
        />
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 pb-8 pt-1"
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => <RecruitingProjectCard data={item} />}
        />
      </View>
    </CommonLayout>
  );
}
