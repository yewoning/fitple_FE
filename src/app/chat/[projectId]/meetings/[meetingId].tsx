import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { CommonLayout } from '@/components/layout';
import { useMeetingMinuteDetailQuery } from '@/hooks/useChat';

export default function MeetingDetailScreen() {
  const { projectId: projectIdParam, meetingId: meetingIdParam } = useLocalSearchParams<{
    projectId: string;
    meetingId: string;
  }>();
  const projectId = Number(projectIdParam);
  const meetingMinuteId = Number(meetingIdParam);
  const { data: detail } = useMeetingMinuteDetailQuery(projectId, meetingMinuteId);

  if (!detail) {
    return (
      <CommonLayout header={{ title: '회의록', showBack: true }} bottomNav={false}>
        <View className="flex-1 items-center justify-center bg-gray-1">
          <ActivityIndicator color="#4876ee" />
        </View>
      </CommonLayout>
    );
  }

  return (
    <CommonLayout header={{ title: `${detail.meetingNumber}차 회의록`, showBack: true }} bottomNav={false}>
      <ScrollView className="bg-gray-1" contentContainerClassName="gap-3 p-5">
        <Text className="font-sans-bold text-[13px] text-gray-6">{detail.projectName}</Text>
        <Text className="font-sans text-[11px] text-gray-4">{detail.meetingDate}</Text>
        <Text className="mb-2 mt-1 font-sans-bold text-lg text-black">{detail.topic}</Text>

        <InfoBlock label="주요 논의 내용" value={detail.content.mainDiscussion} />
        <InfoBlock label="결정 사항" value={detail.content.decisions} />
        <InfoBlock label="역할 분담 및 다음 할 일" value={detail.content.rolesAndNextTasks} />
      </ScrollView>
    </CommonLayout>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1 rounded-2xl bg-white p-4">
      <Text className="font-sans text-[13px] font-bold text-sky-blue">{label}</Text>
      <Text className="font-sans text-[15px] leading-[21px] text-black">{value}</Text>
    </View>
  );
}
