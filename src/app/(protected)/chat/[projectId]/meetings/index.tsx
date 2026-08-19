import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { useMeetingMinutesQuery } from '@/hooks/useChat';
import { formatMeetingDateLabel } from '@/utils/meeting-minute';

export default function MeetingListScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId: string }>();
  const projectId = Number(projectIdParam);
  const router = useRouter();
  // 서버는 래핑 없는 배열을 돌려줍니다(최신순 정렬은 api/chat.ts에서 처리).
  const { data: minutes = [], isLoading } = useMeetingMinutesQuery(projectId);

  return (
    <CommonLayout header={{ title: '지난 회의록', showBack: true }} bottomNav={false}>
      <View className="min-h-0 flex-1 bg-gray-1">
        <FlatList
          data={minutes}
          keyExtractor={(item) => String(item.meetingMinuteId)}
          contentContainerClassName="px-5 pt-1"
          ItemSeparatorComponent={() => <View className="h-px bg-gray-2" />}
          ListEmptyComponent={
            isLoading ? null : (
              <View className="items-center px-5 py-16">
                <Text className="text-center font-sans text-[13px] leading-5 text-gray-5">
                  아직 저장된 회의록이 없어요.{'\n'}채팅방에서 회의록을 만들어 보세요.
                </Text>
              </View>
            )
          }
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
              {/* 서버가 회의 회차를 주지 않아 'N차 회의록' 대신 저장된 제목을 씁니다. */}
              <View className="flex-1">
                <Text className="font-sans-semibold text-[15px] text-black" numberOfLines={1}>
                  {item.title || '제목 없는 회의록'}
                </Text>
                <Text className="mt-0.5 font-sans text-[13px] text-gray-6">
                  {formatMeetingDateLabel(item.createdAt)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#a8adbe" />
            </TouchableOpacity>
          )}
        />
      </View>
    </CommonLayout>
  );
}
