import { Ionicons } from '@expo/vector-icons';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { useResumeVersionsQuery } from '@/hooks/useMypage';
import { ResumeVersion } from '@/types';

export default function ResumeListScreen() {
  const { data } = useResumeVersionsQuery();
  const resumes: ResumeVersion[] = data?.resumes ?? [];

  return (
    <SafeAreaView className="flex-1 bg-gray-1">
      <ScreenHeader title="나의 역량" />
      <FlatList
        data={resumes}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="px-5 pt-1"
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <TouchableOpacity className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3.5">
            <Text className="font-sans text-[15px] text-black">{item.title}</Text>
            <Ionicons name="chevron-forward" size={18} color="#a8adbe" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
