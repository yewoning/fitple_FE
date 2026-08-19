import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { useMeetingMinutesQuery } from '@/hooks/useChat';
import { MeetingMinuteSummary } from '@/types';

export default function MeetingListScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId: string }>();
  const projectId = Number(projectIdParam);
  const router = useRouter();
  const { data } = useMeetingMinutesQuery(projectId);
  const minutes: MeetingMinuteSummary[] = data?.meetingMinutes ?? [];

  return (
    <CommonLayout header={{ title: '지난 회의록', showBack: true }} bottomNav={false}>
      <View className="min-h-0 flex-1 bg-gray-1">
        <FlatList
          data={minutes}
          keyExtractor={(item) => String(item.meetingMinuteId)}
          contentContainerClassName="px-5 pt-1"
          ItemSeparatorComponent={() => <View className="h-px bg-gray-2" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center py-3.5"
              onPress={() =>
                router.push({
                  pathname: '/chat/[projectId]/meetings/[meetingId]',
                  params: { projectId: projectIdParam, meetingId: String(item.meetingMinuteId) },
                })
              }
            >
              <View className="flex-1">
                <Text className="font-sans-semibold text-[15px] text-black">{item.meetingNumber}차 회의록</Text>
                <Text className="mt-0.5 font-sans text-[13px] text-gray-6">{item.meetingDate}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#a8adbe" />
            </TouchableOpacity>
          )}
        />
      </View>
    </CommonLayout>
  );
}
