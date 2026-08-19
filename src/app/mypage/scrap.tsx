import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { RecruitingProjectCard } from '@/components/recruiting-project-card';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { useScrapsQuery } from '@/hooks/useMypage';
import { ScrapItem } from '@/types';

type FilterKey = 'ALL' | 'OPEN' | 'CLOSED';

export default function ScrapScreen() {
  const { data } = useScrapsQuery();
  const scraps: ScrapItem[] = useMemo(() => data?.scraps ?? [], [data]);
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const filtered = useMemo(() => {
    if (filter === 'ALL') return scraps;
    return scraps.filter((s) => (filter === 'OPEN' ? s.status === 'recruiting' : s.status === 'recruit-closed'));
  }, [scraps, filter]);

  const counts = useMemo(
    () => ({
      ALL: scraps.length,
      OPEN: scraps.filter((s) => s.status === 'recruiting').length,
      CLOSED: scraps.filter((s) => s.status === 'recruit-closed').length,
    }),
    [scraps]
  );

  return (
    <CommonLayout header={{ title: '스크랩', showBack: true }} bottomNav={false}>
      <View className="min-h-0 flex-1 bg-gray-1">
        <SegmentedTabs
          options={[
            { key: 'ALL', label: `전체 ${counts.ALL}` },
            { key: 'OPEN', label: `진행 ${counts.OPEN}` },
            { key: 'CLOSED', label: `마감 ${counts.CLOSED}` },
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
