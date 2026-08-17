import { Ionicons } from '@expo/vector-icons';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { useResumeVersionsQuery } from '@/hooks/useMypage';
import { ResumeVersion } from '@/types';

// 나의 역량 화면 스크린샷 기준: 카드 없이 헤어라인 구분선의 플랫 리스트, 오른쪽 chevron.
export default function ResumeListScreen() {
  const { data } = useResumeVersionsQuery();
  const resumes: ResumeVersion[] = data?.resumes ?? [];

  return (
    <CommonLayout header={{ title: '나의 역량', showBack: true }} bottomNav={false}>
      <View className="min-h-0 flex-1 bg-gray-1">
        <FlatList
          data={resumes}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-5 pt-1"
          ItemSeparatorComponent={() => <View className="h-px bg-gray-2" />}
          renderItem={({ item }) => (
            <TouchableOpacity className="flex-row items-center justify-between py-3.5">
              <Text className="font-sans text-[15px] text-black">{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#a8adbe" />
            </TouchableOpacity>
          )}
        />
      </View>
    </CommonLayout>
  );
}
