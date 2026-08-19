import { useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
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

        <InfoBlock label="주요 논의">
          <Text className="font-sans text-[15px] leading-[21px] text-black">
            {detail.content.mainDiscussion}
          </Text>
        </InfoBlock>

        <InfoBlock label="결정 사항">
          {detail.content.decisions.map((line, index) => (
            <Text key={index} className="font-sans text-[15px] leading-[21px] text-black">
              {line}
            </Text>
          ))}
        </InfoBlock>

        <InfoBlock label="역할 및 다음 할 일">
          {detail.content.rolesAndNextTasks.map((item) => (
            <View key={item.name} className="flex-row gap-2">
              <Text className="w-16 font-sans-semibold text-[15px] text-black">{item.name}</Text>
              <Text className="flex-1 font-sans text-[15px] text-gray-6">{item.task}</Text>
            </View>
          ))}
        </InfoBlock>
      </ScrollView>
    </CommonLayout>
  );
}

function InfoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="gap-1.5 rounded-2xl bg-white p-4">
      <Text className="font-sans-bold text-[13px] text-sky-blue">{label}</Text>
      {children}
    </View>
  );
}
