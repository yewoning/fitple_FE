import { useLocalSearchParams } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useTeamMembersQuery } from '@/hooks/useChat';
import { TeamMember } from '@/types';

export default function TeamMembersScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId: string }>();
  const projectId = Number(projectIdParam);
  const { data } = useTeamMembersQuery(projectId);
  const members: TeamMember[] = data?.members ?? [];

  return (
    <SafeAreaView className="flex-1 bg-gray-1">
      <ScreenHeader title="팀원 목록" />
      <Text className="mb-2 px-5 font-sans text-[13px] font-bold text-gray-6">팀원 {members.length}명</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => String(item.memberId)}
        contentContainerClassName="px-5 pb-5"
        ItemSeparatorComponent={() => <View className="h-px bg-gray-2" />}
        renderItem={({ item }) => (
          <View className="flex-row items-start gap-3 py-3">
            <Avatar size={44} />
            <View className="flex-1">
              <Text className="font-sans text-[15px] font-semibold text-black">{item.name}</Text>
              <Text className="mt-0.5 font-sans text-[13px] text-sky-blue">담당 {item.role}</Text>
              <Text className="mt-0.5 font-sans text-[13px] text-gray-6">{item.description}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
