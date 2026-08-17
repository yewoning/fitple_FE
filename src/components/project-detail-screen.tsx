import { useEffect, useRef, useState } from 'react';
import { type Href, useRouter } from 'expo-router';
import { Animated, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/primary-button';
import { StatusBadge } from '@/components/project-card';
import { MOCK_RECRUITING_PROJECTS } from '@/components/projects-screen.mock';
import { getDDayLabel } from '@/utils/dday';
import type { ProjectDetailInfoRow } from '@/types/project';

export interface ProjectDetailScreenProps {
  projectId?: string;
}

const MENU_DISMISS_Y = 400;

function formatRecruitPeriodLabel(deadline: string): string {
  return `~${deadline.slice(2).replace(/-/g, '.')}`;
}

export function ProjectDetailScreen({ projectId }: ProjectDetailScreenProps) {
  const router = useRouter();
  // 상세 조회 API 연동 전까지는 목데이터로 대체 표시
  const project =
    MOCK_RECRUITING_PROJECTS.find((item) => item.id === projectId) ?? MOCK_RECRUITING_PROJECTS[0];

  const [showMenu, setShowMenu] = useState(false);
  const [menuMode, setMenuMode] = useState<'actions' | 'confirmDelete'>('actions');
  const menuTranslateY = useRef(new Animated.Value(MENU_DISMISS_Y)).current;

  useEffect(() => {
    if (!showMenu) return;
    menuTranslateY.setValue(MENU_DISMISS_Y);
    Animated.timing(menuTranslateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [showMenu, menuTranslateY]);

  function openMenu() {
    setMenuMode('actions');
    setShowMenu(true);
  }

  function closeMenu() {
    Animated.timing(menuTranslateY, {
      toValue: MENU_DISMISS_Y,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setShowMenu(false);
      setMenuMode('actions');
      menuTranslateY.setValue(MENU_DISMISS_Y);
    });
  }

  function handleDeletePress() {
    setMenuMode('confirmDelete');
  }

  function handleConfirmDelete() {
    // 실제 삭제 API 연동은 추후 구현
    Animated.timing(menuTranslateY, {
      toValue: MENU_DISMISS_Y,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setShowMenu(false);
      setMenuMode('actions');
      menuTranslateY.setValue(MENU_DISMISS_Y);
      router.back();
    });
  }

  const infoRows: ProjectDetailInfoRow[] = [
    { label: '모집 인원', value: '4명' },
    { label: '모집 역할', value: project.subInfo ?? '미정' },
    { label: '진행 기간', value: '~ 9월 31일' },
    { label: '회의 일정', value: '주 1회 오프라인' },
    { label: '모집 마감', value: project.deadline ? formatRecruitPeriodLabel(project.deadline) : '미정' },
  ];

  return (
    <View className="flex-1 bg-gray-1">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="flex-row items-center px-3 pt-1">
          <Pressable
            accessibilityLabel="이전 화면으로 돌아가기"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center"
            hitSlop={4}
            onPress={() => router.back()}
          >
            <Text className="font-sans text-2xl text-gray-4">←</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
          <View className="px-5">
            <View className="flex-row items-center justify-between">
              <StatusBadge status={project.status} />

              <Pressable
                accessibilityLabel="더보기"
                accessibilityRole="button"
                className="h-8 w-8 items-center justify-center"
                hitSlop={4}
                onPress={openMenu}
              >
                <Text className="font-sans-bold text-2xl text-dark-blue">⋮</Text>
              </Pressable>
            </View>
            <Text className="mt-1.5 font-sans-bold text-xl text-black">{project.projectName}</Text>
            <View className="mt-1.5 flex-row items-center gap-2">
              {project.deadline ? (
                <>
                  <Text className="font-sans-semibold text-xs text-dark-blue">
                    {getDDayLabel(project.deadline)}
                  </Text>
                  <Text className="font-sans text-xs text-gray-5">
                    모집기간 {formatRecruitPeriodLabel(project.deadline)}
                  </Text>
                </>
              ) : null}
            </View>

            <View className="mt-4 h-48 items-center justify-center overflow-hidden rounded-2xl bg-white">
              <Image source={project.icon} resizeMode="contain" style={{ width: 88, height: 88 }} />
            </View>

            <Text className="mt-6 font-sans-medium text-base text-gray-6">프로젝트 제목</Text>
            <View className="mt-2 h-[52px] justify-center rounded-2xl bg-white px-4">
              <Text className="font-sans text-sm text-black" numberOfLines={1}>
                {project.projectName}
              </Text>
            </View>

            <Text className="mt-6 font-sans-medium text-base text-gray-6">프로젝트 소개글</Text>
            <View className="mt-2 rounded-2xl bg-white p-4">
              <Text className="font-sans text-sm leading-5 text-gray-6">
                {project.projectName}에 관심 있는 팀원을 모집하고 있어요. 함께 기획부터 실행까지
                즐겁게 진행해요.
              </Text>
              <View className="mt-3 border-t border-dashed border-gray-3" />
              <View className="mt-3 gap-1.5">
                {infoRows.map((row) => (
                  <View key={row.label} className="flex-row gap-2">
                    <Text className="font-sans-medium text-xs text-gray-6">{row.label}</Text>
                    <Text className="font-sans text-xs text-gray-6">{row.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-6 flex-row items-center gap-2">
              <Pressable
                accessibilityLabel="북마크"
                accessibilityRole="button"
                className="h-[52px] w-[52px] items-center justify-center rounded-full bg-white"
                onPress={() => {
                  // 북마크 저장은 API 연동 후 구현
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Image
                  source={require('../../assets/icons/bookmark.png')}
                  resizeMode="contain"
                  style={{ width: 22, height: 22 }}
                />
              </Pressable>

              <Pressable
                accessibilityLabel="공유하기"
                accessibilityRole="button"
                className="h-[52px] w-[52px] items-center justify-center rounded-full bg-white"
                onPress={() => {
                  // 공유하기는 API 연동 후 구현
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Image
                  source={require('../../assets/icons/share.png')}
                  resizeMode="contain"
                  style={{ width: 22, height: 22 }}
                />
              </Pressable>

              <View className="flex-1">
                <PrimaryButton
                  label="지원하기"
                  onPress={() => router.push(`/project-apply?id=${project.id}` as Href)}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {showMenu ? (
        <Animated.View
          className="absolute bottom-0 left-0 right-0 rounded-t-[28px]"
          style={{ transform: [{ translateY: menuTranslateY }] }}
        >
          <View className="overflow-hidden rounded-t-[28px] bg-[#ebeef5]">
            <View className="px-5 pb-8 pt-3">
              <View className="h-1 w-10 self-center rounded-full bg-gray-3" />

              {menuMode === 'actions' ? (
                <>
                  <Pressable
                    accessibilityLabel="게시물 수정"
                    accessibilityRole="button"
                    className="mt-4 flex-row items-center gap-2 rounded-2xl bg-white px-4 py-4"
                    onPress={() => {
                      closeMenu();
                      router.push(`/project-edit?id=${project.id}` as Href);
                    }}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <Text className="font-sans text-sm text-gray-6">✎</Text>
                    <Text className="font-sans-medium text-sm text-black">게시물 수정</Text>
                  </Pressable>

                  <Pressable
                    accessibilityLabel="삭제"
                    accessibilityRole="button"
                    className="mt-2 flex-row items-center gap-2 rounded-2xl bg-white px-4 py-4"
                    onPress={handleDeletePress}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  >
                    <Text className="font-sans text-sm text-gray-6">✕</Text>
                    <Text className="font-sans-medium text-sm text-black">삭제</Text>
                  </Pressable>

                  <View className="mt-5">
                    <PrimaryButton label="닫기" onPress={closeMenu} />
                  </View>
                </>
              ) : (
                <>
                  <Text className="mt-5 text-center font-sans-bold text-lg text-black">
                    정말 삭제하시겠어요?
                  </Text>
                  <Text className="mt-1 text-center font-sans text-sm text-gray-5">
                    삭제한 게시물은 다시 되돌릴 수 없어요
                  </Text>

                  <View className="mt-5 flex-row gap-2">
                    <Pressable
                      accessibilityLabel="취소"
                      accessibilityRole="button"
                      className="h-[55px] flex-1 items-center justify-center rounded-full bg-white"
                      onPress={closeMenu}
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                    >
                      <Text className="font-sans-semibold text-base text-gray-6">취소</Text>
                    </Pressable>

                    <View className="flex-1">
                      <PrimaryButton label="삭제" onPress={handleConfirmDelete} />
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
