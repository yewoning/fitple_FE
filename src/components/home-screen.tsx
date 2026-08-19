import { useCallback, useState } from 'react';
import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';
import { CommonLayout, type BottomNavKey } from '@/components/layout';
import { ProjectCarousel } from '@/components/project-carousel';
import { ProjectGridSection } from '@/components/project-grid-section';
import { getMyProfile } from '@/services/member';
import { getMyProjects, getRecommendedProjects, toMyProjectCardData, toProjectCardData } from '@/services/project';
import { getTodayTasks, toTodayTaskCardData } from '@/services/task';
import { useAuthStore } from '@/store/auth-store';
import type { ProjectCardData } from '@/types/project';

interface SectionState {
  data: ProjectCardData[];
  isLoading: boolean;
  errorMessage: string | null;
}

const INITIAL_SECTION: SectionState = { data: [], isLoading: true, errorMessage: null };

const RECOMMENDED_ERROR = '추천 프로젝트를 불러오지 못했어요';
const IN_PROGRESS_ERROR = '진행중인 프로젝트를 불러오지 못했어요';
const TODAY_TASK_ERROR = '오늘의 과제를 불러오지 못했어요';

// 홈은 요약 화면이다. 원래 디자인의 노출량(진행중 2행, 과제 1행)을 카드 수 상한으로 유지한다.
// 과제는 서버가 D-day 임박순으로 주므로 앞에서 자르면 가장 급한 것들이 남는다.
const IN_PROGRESS_MAX_ITEMS = 4;
const TODAY_TASK_MAX_ITEMS = 2;

/**
 * 섹션 하나를 조회해 상태로 반영한다.
 * 실패를 빈 배열로 삼키지 않고 문구를 남겨, 사용자가 '0건'과 '조회 실패'를 구분할 수 있게 한다.
 * isActive는 화면을 벗어난 뒤 늦게 도착한 응답이 최신 상태를 덮어쓰지 않게 막는다.
 */
async function loadSection(
  fetchData: () => Promise<ProjectCardData[]>,
  apply: (state: SectionState) => void,
  errorMessage: string,
  isActive: () => boolean,
) {
  try {
    const data = await fetchData();
    if (isActive()) apply({ data, isLoading: false, errorMessage: null });
  } catch {
    if (isActive()) apply({ data: [], isLoading: false, errorMessage });
  }
}

export function HomeScreen() {
  const router = useRouter();
  const memberId = useAuthStore((state) => state.memberId);
  const [activeTab, setActiveTab] = useState<BottomNavKey>('home');
  const [nickname, setNickname] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<SectionState>(INITIAL_SECTION);
  const [inProgress, setInProgress] = useState<SectionState>(INITIAL_SECTION);
  const [todayTasks, setTodayTasks] = useState<SectionState>(INITIAL_SECTION);

  // 화면에 들어올 때마다 다시 조회한다. expo-router Stack은 홈을 언마운트하지 않아서
  // 프로젝트 생성·지원이나 마이페이지의 과제 체크 결과가 마운트 시 1회 조회로는 반영되지 않는다.
  useFocusEffect(
    useCallback(() => {
      if (memberId === null) return;

      let isActive = true;
      const alive = () => isActive;

      getMyProfile(memberId)
        .then((profile) => {
          if (alive()) setNickname(profile.name);
        })
        .catch(() => {
          // 닉네임은 실패해도 화면을 막지 않는다. 이름 없는 문구로 표시된다.
        });

      loadSection(
        () => getRecommendedProjects(memberId).then((items) => items.map(toProjectCardData)),
        setRecommended,
        RECOMMENDED_ERROR,
        alive,
      );

      // /api/projects/my는 모집중·완료까지 포함한 '내 프로젝트 전체'를 준다.
      // 이 섹션은 '현재 진행중인' 프로젝트만 보여줘야 하므로 여기서 걸러낸다.
      loadSection(
        () =>
          getMyProjects(memberId).then((items) =>
            items.map(toMyProjectCardData).filter((project) => project.status === 'in-progress'),
          ),
        setInProgress,
        IN_PROGRESS_ERROR,
        alive,
      );

      loadSection(
        () => getTodayTasks(memberId).then((items) => items.map(toTodayTaskCardData)),
        setTodayTasks,
        TODAY_TASK_ERROR,
        alive,
      );

      return () => {
        isActive = false;
      };
    }, [memberId]),
  );

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

  // 과제 카드는 프로젝트 상세가 아니라 해당 프로젝트의 과제 화면으로 보낸다.
  function handleTaskPress(projectId: string) {
    router.push(`/chat/${projectId}/tasks` as Href);
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        >
          <View className="items-center px-5 pt-4">
            <View className="flex-row items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm shadow-gray-3">
              <Image
                source={require('../../assets/icons/magicwand.png')}
                resizeMode="contain"
                style={{ width: 14, height: 14 }}
              />
              <Text className="font-sans-semibold text-sm leading-5 text-black">
                {nickname ? `AI가 ${nickname}님에게 추천하는` : 'AI가 추천하는'}{' '}
                <Text className="font-sans-semibold text-sm text-dark-blue">프로젝트</Text>를
                모았어요!
              </Text>
            </View>
          </View>

          <ProjectCarousel
            projects={recommended.data}
            isLoading={recommended.isLoading}
            errorMessage={recommended.errorMessage}
            emptyMessage="아직 추천할 프로젝트가 없어요"
            onProjectPress={handleProjectPress}
          />

          <ProjectGridSection
            title={nickname ? `${nickname}님의 현재 진행중인 프로젝트` : '현재 진행중인 프로젝트'}
            data={inProgress.data}
            variant="progress"
            maxItems={IN_PROGRESS_MAX_ITEMS}
            isLoading={inProgress.isLoading}
            errorMessage={inProgress.errorMessage}
            emptyMessage="현재 진행중인 프로젝트가 없어요"
            onProjectPress={handleProjectPress}
          />

          <ProjectGridSection
            title="AI 오늘의 과제"
            data={todayTasks.data}
            variant="task"
            maxItems={TODAY_TASK_MAX_ITEMS}
            isLoading={todayTasks.isLoading}
            errorMessage={todayTasks.errorMessage}
            emptyMessage="예정된 과제가 없어요"
            onProjectPress={handleTaskPress}
          />
        </ScrollView>
      </View>
    </CommonLayout>
  );
}
