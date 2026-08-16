import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CommonLayout, type BottomNavKey } from '@/components/layout';
import { ProjectCarousel } from '@/components/project-carousel';
import { ProjectGridSection } from '@/components/project-grid-section';
import {
  MOCK_IN_PROGRESS_PROJECTS,
  MOCK_RECOMMENDED_PROJECTS,
  MOCK_TODAY_TASKS,
  MOCK_USER,
} from '@/components/home-screen.mock';

export function HomeScreen() {
  const [activeTab, setActiveTab] = useState<BottomNavKey>('home');

  return (
    <CommonLayout
      header={{ title: '홈', showBack: false }}
      bottomNav={{ activeTab, onTabPress: setActiveTab }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-5 pt-4">
          <Text className="font-sans text-lg font-semibold leading-6 text-black">
            AI가 {MOCK_USER.nickname}님에게 추천하는{' '}
            <Text className="font-sans text-lg font-semibold text-sky-blue">프로젝트</Text>를
            모았어요!
          </Text>
        </View>

        <ProjectCarousel projects={MOCK_RECOMMENDED_PROJECTS} />

        <ProjectGridSection
          title={`${MOCK_USER.nickname}님의 현재 진행중인 프로젝트`}
          data={MOCK_IN_PROGRESS_PROJECTS}
          variant="progress"
        />

        <ProjectGridSection title="AI 오늘의 과제" data={MOCK_TODAY_TASKS} variant="task" />
      </ScrollView>
    </CommonLayout>
  );
}
