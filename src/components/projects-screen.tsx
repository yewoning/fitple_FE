import { useState } from 'react';
import { type Href, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CommonLayout, type BottomNavKey } from '@/components/layout';
import { RecruitingProjectCard } from '@/components/recruiting-project-card';
import { MOCK_RECRUITING_PROJECTS } from '@/components/projects-screen.mock';

export function ProjectsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BottomNavKey>('projects');

  function handleTabPress(tab: BottomNavKey) {
    if (tab === activeTab) return;
    if (tab === 'home') {
      router.push('/home' as Href);
      return;
    }
    setActiveTab(tab);
  }

  return (
    <CommonLayout header={false} bottomNav={{ activeTab, onTabPress: handleTabPress }}>
      <View className="min-h-0 flex-1">
        <View className="h-14 justify-center bg-white px-5">
          <Text
            className="font-sans-medium text-base text-gray-6"
            style={{ letterSpacing: 0.16 }}
          >
            현재 모집중인 프로젝트
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        >
          <View className="mt-3 flex-1 justify-between px-5">
            {MOCK_RECRUITING_PROJECTS.map((project) => (
              <RecruitingProjectCard key={project.id} data={project} />
            ))}
          </View>
        </ScrollView>

        <Pressable
          accessibilityLabel="새 프로젝트 만들기"
          accessibilityRole="button"
          className="absolute bottom-6 right-5 h-11 w-11 items-center justify-center rounded-full bg-sky-blue shadow-lg shadow-gray-5-overlay"
          onPress={() => router.push('/project-create' as Href)}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <View className="absolute h-[2px] w-4 rounded-full bg-white" />
          <View className="absolute h-4 w-[2px] rounded-full bg-white" />
        </Pressable>
      </View>
    </CommonLayout>
  );
}
