import { useState } from 'react';
import { type Href, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';

import { CommonLayout, type BottomNavKey } from '@/components/layout';
import { Avatar } from '@/components/ui/avatar';
import { useChatProjectsQuery } from '@/hooks/useChat';
import { ChatProjectSummary } from '@/types';

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function ChatListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BottomNavKey>('chat');
  const { data, isLoading } = useChatProjectsQuery();
  const rooms: ChatProjectSummary[] = data?.projects ?? [];

  function handleTabPress(tab: BottomNavKey) {
    if (tab === activeTab) return;
    if (tab === 'home') {
      router.push('/home' as Href);
      return;
    }
    if (tab === 'projects') {
      router.push('/projects' as Href);
      return;
    }
    if (tab === 'mypage') {
      router.push('/mypage' as Href);
      return;
    }
    setActiveTab(tab);
  }

  return (
    <CommonLayout header={false} bottomNav={{ activeTab, onTabPress: handleTabPress }}>
      <View className="min-h-0 flex-1 bg-gray-1">
        <View className="h-14 justify-center bg-gray-1 px-5">
          <Text className="font-sans-bold text-[22px] text-black">채팅</Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#4876ee" />
          </View>
        ) : rooms.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="font-sans text-[13px] text-gray-4">참여 중인 프로젝트 채팅방이 없어요</Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => String(item.projectId)}
            contentContainerClassName="px-5"
            ItemSeparatorComponent={() => <View className="h-px bg-gray-2" />}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center gap-3 py-3"
                activeOpacity={0.8}
                onPress={() =>
                  router.push({ pathname: '/chat/[projectId]', params: { projectId: String(item.projectId) } })
                }
              >
                <Avatar uri={item.projectIconUrl} size={52} />
                <View className="flex-1 gap-1">
                  <View className="flex-row justify-between">
                    <Text
                      className="flex-shrink font-sans-semibold text-[15px] text-black"
                      numberOfLines={1}
                    >
                      {item.projectName}
                    </Text>
                    <Text className="font-sans text-[11px] text-gray-4">{formatTime(item.lastMessageAt)}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 font-sans text-[13px] text-gray-6" numberOfLines={1}>
                      {item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 ? (
                      <View className="ml-2 h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-blue px-1.5">
                        <Text className="font-sans-bold text-[11px] text-white">{item.unreadCount}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </CommonLayout>
  );
}
