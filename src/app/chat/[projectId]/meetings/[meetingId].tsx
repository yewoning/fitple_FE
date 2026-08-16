import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/screen-header';
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
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-1">
        <ActivityIndicator color="#4876ee" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-1">
      <ScreenHeader title={`${detail.meetingNumber}차 회의록`} />
      <ScrollView contentContainerClassName="gap-3 p-5">
        <Text className="font-sans text-[13px] font-bold text-gray-6">{detail.projectName}</Text>
        <Text className="font-sans text-[11px] text-gray-4">{detail.meetingDate}</Text>
        <Text className="mb-2 mt-1 font-sans text-lg font-bold text-black">{detail.topic}</Text>

        <InfoBlock label="주요 논의 내용" value={detail.content.mainDiscussion} />
        <InfoBlock label="결정 사항" value={detail.content.decisions} />
        <InfoBlock label="역할 분담 및 다음 할 일" value={detail.content.rolesAndNextTasks} />
      </ScrollView>
    </SafeAreaView>
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
