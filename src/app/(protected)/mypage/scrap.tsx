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

  // 실제 API는 상태를 recruiting(모집중) / in-progress(진행중) / completed(마감)로 내려줍니다.
  // "진행" 탭은 모집중+진행중을 다 보여주고, "마감" 탭은 완료된 것만 보여줍니다.
  const isOpen = (status: ScrapItem['status']) => status === 'recruiting' || status === 'in-progress';
  const isClosed = (status: ScrapItem['status']) => status === 'completed';

  const filtered = useMemo(() => {
    if (filter === 'ALL') return scraps;
    return scraps.filter((s) => (filter === 'OPEN' ? isOpen(s.status) : isClosed(s.status)));
  }, [scraps, filter]);

  const counts = useMemo(
    () => ({
      ALL: scraps.length,
      OPEN: scraps.filter((s) => isOpen(s.status)).length,
      CLOSED: scraps.filter((s) => isClosed(s.status)).length,
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
