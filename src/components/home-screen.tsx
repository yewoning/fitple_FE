import { useEffect, useState } from 'react';
import { type Href, useRouter } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { CommonLayout, type BottomNavKey } from '@/components/layout';
import { ProjectCarousel } from '@/components/project-carousel';
import { ProjectGridSection } from '@/components/project-grid-section';
import { DEMO_TODAY_TASKS, getDemoUser } from '@/mocks/fixtures';
import { getMyProfile } from '@/services/member';
import { getMyProjects, getRecommendedProjects, toMyProjectCardData, toProjectCardData } from '@/services/project';
import { useAuthStore } from '@/store/auth-store';
import type { ProjectCardData } from '@/types/project';

export function HomeScreen() {
  const router = useRouter();
  const memberId = useAuthStore((state) => state.memberId);
  const [activeTab, setActiveTab] = useState<BottomNavKey>('home');
  const [nickname, setNickname] = useState(getDemoUser().name);
  const [recommendedProjects, setRecommendedProjects] = useState<ProjectCardData[]>([]);
  const [inProgressProjects, setInProgressProjects] = useState<ProjectCardData[]>([]);

  useEffect(() => {
    if (memberId === null) return;

    getMyProfile(memberId)
      .then((profile) => setNickname(profile.name))
      .catch(() => {
        // 실패 시 폴백 닉네임 유지
      });

    getRecommendedProjects(memberId)
      .then((items) => setRecommendedProjects(items.map(toProjectCardData)))
      .catch(() => setRecommendedProjects([]));

    getMyProjects(memberId)
      .then((items) => setInProgressProjects(items.map(toMyProjectCardData)))
      .catch(() => setInProgressProjects([]));
  }, [memberId]);

  function handleTabPress(tab: BottomNavKey) {
    if (tab === activeTab) return;
    if (tab === 'projects') {
      router.push('/projects' as Href);
      return;
    }
    if (tab === 'chat') {
      router.push('/chat' as Href);
      return;
    }
    if (tab === 'mypage') {
      router.push('/mypage' as Href);
      return;
    }
    setActiveTab(tab);
  }

  function handleProjectPress(id: string) {
    router.push(`/project/${id}` as Href);
  }

  return (
    <CommonLayout header={false} bottomNav={{ activeTab, onTabPress: handleTabPress }}>
      <View className="min-h-0 flex-1">
        <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
          <View
            className="absolute rounded-full"
            style={{
              width: 281,
              height: 267,
              top: 81,
              left: 11,
              opacity: 0.2,
              backgroundColor: '#7A7AEB',
              filter: 'blur(100px)',
            }}
          />
          <View
            className="absolute rounded-full"
            style={{
              width: 281,
              height: 267,
              top: 116,
              left: 125,
              opacity: 0.2,
              backgroundColor: '#FFFA63',
              filter: 'blur(100px)',
            }}
          />
          <View
            className="absolute rounded-full"
            style={{
              width: 281,
              height: 267,
              top: 74,
              left: 144,
              opacity: 0.12,
              backgroundColor: '#75AEFF',
              filter: 'blur(100px)',
            }}
          />
        </View>

        <View className="items-center px-5 pt-4">
          <View className="flex-row items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm shadow-gray-3">
            <Image
              source={require('../../assets/icons/magicwand.png')}
              resizeMode="contain"
              style={{ width: 14, height: 14 }}
            />
            <Text className="font-sans-semibold text-sm leading-5 text-black">
              AI가 {nickname}님에게 추천하는{' '}
              <Text className="font-sans-semibold text-sm text-dark-blue">프로젝트</Text>를
              모았어요!
            </Text>
          </View>
        </View>

        <ProjectCarousel projects={recommendedProjects} onProjectPress={handleProjectPress} />

        <ProjectGridSection
          title={`${nickname}님의 현재 진행중인 프로젝트`}
          data={inProgressProjects}
          variant="progress"
          visibleRows={2}
          onProjectPress={handleProjectPress}
        />

        <ProjectGridSection
          title="AI 오늘의 과제"
          data={DEMO_TODAY_TASKS}
          variant="task"
          visibleRows={1}
        />
      </View>
    </CommonLayout>
  );
}
