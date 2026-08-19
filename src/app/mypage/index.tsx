import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { CommonLayout, type BottomNavKey } from '@/components/layout';
import { Avatar } from '@/components/ui/avatar';
import { useProfileQuery } from '@/hooks/useMypage';

const MENU = [
  { key: '/mypage/scrap', icon: 'bookmark-outline', title: '스크랩' },
  { key: '/mypage/tasks', icon: 'checkbox-outline', title: '오늘의 과제' },
  { key: '/mypage/applications', icon: 'mail-outline', title: '지원 현황' },
  { key: '/mypage/resumes', icon: 'id-card-outline', title: '나의 역량' },
  { key: 'app-settings', icon: 'settings-outline', title: '앱 설정' },
] as const;

export default function MyPageScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BottomNavKey>('mypage');
  const { data: profile } = useProfileQuery();

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
    if (tab === 'chat') {
      router.push('/chat' as Href);
      return;
    }
    setActiveTab(tab);
  }

  const handlePress = (key: (typeof MENU)[number]['key']) => {
    if (key === 'app-settings') {
      Alert.alert('알림', '준비 중인 화면입니다.');
      return;
    }
    router.push(key as Href);
  };

  return (
    <CommonLayout header={false} bottomNav={{ activeTab, onTabPress: handleTabPress }}>
      <View className="min-h-0 flex-1 bg-gray-1">
        <Text className="py-3 text-center font-sans-bold text-[22px] text-black">마이페이지</Text>
        <ScrollView contentContainerClassName="gap-5 px-5 pb-8">
          <View className="items-center gap-2 py-4">
            <Avatar uri={profile?.profileImageUrl} size={80} />
            <View className="flex-row items-center gap-1">
              <Text className="font-sans-bold text-lg text-black">{profile?.name ?? ''}님</Text>
              <Ionicons name="chevron-forward" size={16} color="#828797" />
            </View>
          </View>

          <View className="overflow-hidden rounded-2xl bg-white">
            {MENU.map((item) => (
              <TouchableOpacity
                key={item.key}
                className="flex-row items-center gap-3 border-b border-gray-1 px-4 py-3.5"
                activeOpacity={0.7}
                onPress={() => handlePress(item.key)}
              >
                <Ionicons name={item.icon as any} size={20} color="#3f3f3f" />
                <Text className="flex-1 font-sans-semibold text-[15px] text-black">{item.title}</Text>
                <Ionicons name="chevron-forward" size={18} color="#a8adbe" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </CommonLayout>
  );
}
