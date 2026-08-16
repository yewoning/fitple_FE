import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProjectCard } from '@/components/ui/project-card';
import { ScreenHeader } from '@/components/ui/screen-header';
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
    return scraps.filter((s) => (filter === 'OPEN' ? s.recruitStatus === '모집중' : s.recruitStatus === '마감'));
  }, [scraps, filter]);

  const counts = useMemo(
    () => ({
      ALL: scraps.length,
      OPEN: scraps.filter((s) => s.recruitStatus === '모집중').length,
      CLOSED: scraps.filter((s) => s.recruitStatus === '마감').length,
    }),
    [scraps]
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-1">
      <ScreenHeader title="스크랩" />
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
        keyExtractor={(item) => String(item.projectId)}
        contentContainerClassName="px-5 pb-8 pt-1"
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => <ProjectCard project={item} />}
      />
    </SafeAreaView>
  );
}
