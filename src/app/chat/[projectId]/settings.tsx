import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { PrimaryButton } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useChatRoomQuery } from '@/hooks/useChat';

const MENU = [
  { key: 'members', icon: 'person-outline', title: '팀원 목록', desc: '팀원 정보 및 역할 확인' },
  { key: 'files', icon: 'folder-outline', title: '공유 파일', desc: '프로젝트 관련 파일 확인' },
  { key: 'meetings', icon: 'pin-outline', title: '지난 회의록', desc: '핏봇이 정리한 회의 내용 보기' },
  { key: 'roadmap', icon: 'map-outline', title: '프로젝트 로드맵', desc: '진행 사항 및 일정 확인' },
  { key: 'tasks', icon: 'checkbox-outline', title: '오늘의 과제', desc: '핏봇이 정리한 과제를 확인하세요' },
  { key: 'settings', icon: 'settings-outline', title: '환경설정', desc: '채팅방 환경설정' },
] as const;

export default function ChatRoomSettingsScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId: string }>();
  const projectId = Number(projectIdParam);
  const router = useRouter();
  const { data: room } = useChatRoomQuery(projectId);

  const handlePress = (key: (typeof MENU)[number]['key']) => {
    if (key === 'members') router.push({ pathname: '/chat/[projectId]/members', params: { projectId: projectIdParam } });
    else if (key === 'meetings')
      router.push({ pathname: '/chat/[projectId]/meetings', params: { projectId: projectIdParam } });
    else if (key === 'tasks') router.push({ pathname: '/chat/[projectId]/tasks', params: { projectId: projectIdParam } });
    else Alert.alert('알림', '준비 중인 기능입니다.');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-1">
      <ScreenHeader title="채팅방 설정" />
      <ScrollView contentContainerClassName="gap-5 p-5">
        <View className="flex-row items-center gap-3">
          <Avatar uri={room?.projectIconUrl} size={52} />
          <View className="flex-1">
            <Text className="font-sans text-lg font-bold text-black" numberOfLines={1}>
              {room?.projectName ?? ''}
            </Text>
            <Text className="mt-0.5 font-sans text-[13px] text-sky-blue">팀원 {room?.memberCount ?? 0}명</Text>
          </View>
        </View>

        <View className="overflow-hidden rounded-2xl bg-white">
          {MENU.map((item) => (
            <TouchableOpacity
              key={item.key}
              className="flex-row items-center gap-3 border-b border-gray-1 px-4 py-3.5"
              onPress={() => handlePress(item.key)}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon as any} size={20} color="#3f3f3f" />
              <View className="flex-1">
                <Text className="font-sans text-[15px] font-semibold text-black">{item.title}</Text>
                <Text className="mt-0.5 font-sans text-[11px] text-gray-6">{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#a8adbe" />
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton label="프로젝트 나가기" onPress={() => Alert.alert('알림', '프로젝트를 나가시겠어요?')} />
      </ScrollView>
    </SafeAreaView>
  );
}
