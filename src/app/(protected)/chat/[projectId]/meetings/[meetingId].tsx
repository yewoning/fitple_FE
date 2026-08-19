import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { useMeetingMinuteDetailQuery } from '@/hooks/useChat';
import { formatMeetingDateLabel } from '@/utils/meeting-minute';

export default function MeetingDetailScreen() {
  const { projectId: projectIdParam, meetingId: meetingIdParam } = useLocalSearchParams<{
    projectId: string;
    meetingId: string;
  }>();
  const projectId = Number(projectIdParam);
  const meetingMinuteId = Number(meetingIdParam);
  const { data: detail, isError } = useMeetingMinuteDetailQuery(projectId, meetingMinuteId);

  if (!detail) {
    return (
      <CommonLayout header={{ title: '회의록', showBack: true }} bottomNav={false}>
        <View className="flex-1 items-center justify-center bg-gray-1">
          {isError ? (
            <Text className="font-sans text-[13px] text-gray-5">회의록을 불러오지 못했어요.</Text>
          ) : (
            <ActivityIndicator color="#4876ee" />
          )}
        </View>
      </CommonLayout>
    );
  }

  // 서버의 content는 구조가 없는 문자열 한 덩어리라, 저장된 줄바꿈 그대로 보여줍니다.
  return (
    <CommonLayout header={{ title: '회의록', showBack: true }} bottomNav={false}>
      <ScrollView className="bg-gray-1" contentContainerClassName="gap-3 p-5">
        <View>
          <Text className="font-sans-bold text-lg text-black">
            {detail.title || '제목 없는 회의록'}
          </Text>
          <Text className="mt-1 font-sans text-[11px] text-gray-4">
            {formatMeetingDateLabel(detail.createdAt)}
          </Text>
        </View>

        <View className="rounded-2xl bg-white p-4">
          <Text className="font-sans text-[15px] leading-[21px] text-black">{detail.content}</Text>
        </View>
      </ScrollView>
    </CommonLayout>
  );
}
