import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
import { useMeetingMinutesQuery } from '@/hooks/useChat';
import { MeetingMinuteSummary } from '@/types';

export default function MeetingListScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId: string }>();
  const projectId = Number(projectIdParam);
  const router = useRouter();
  const { data } = useMeetingMinutesQuery(projectId);
  const minutes: MeetingMinuteSummary[] = data?.meetingMinutes ?? [];

  return (
    <SafeAreaView className="flex-1 bg-gray-1">
      <ScreenHeader title="지난 회의록" />
      <FlatList
        data={minutes}
        keyExtractor={(item) => String(item.meetingMinuteId)}
        contentContainerClassName="px-5 pt-3"
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center rounded-xl bg-white px-4 py-3.5"
            onPress={() =>
              router.push({
                pathname: '/chat/[projectId]/meetings/[meetingId]',
                params: { projectId: projectIdParam, meetingId: String(item.meetingMinuteId) },
              })
            }
          >
            <View className="flex-1">
              <Text className="font-sans text-[15px] font-semibold text-black">{item.meetingNumber}차 회의록</Text>
              <Text className="mt-0.5 font-sans text-[13px] text-gray-6">{item.meetingDate}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a8adbe" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
