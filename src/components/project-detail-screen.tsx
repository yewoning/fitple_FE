import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type Href, useRouter } from 'expo-router';
import { ActivityIndicator, Animated, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { PrimaryButton } from '@/components/primary-button';
import { StatusBadge } from '@/components/project-card';
import { mypageKeys, useApplicationsQuery } from '@/hooks/useMypage';
import { ApiError } from '@/services/api-client';
import {
  API_STATUS_TO_PROJECT_STATUS,
  addScrap,
  deleteProject,
  getProject,
  getScraps,
  removeScrap,
  resolveDDay,
} from '@/services/project';
import { useAuthStore } from '@/store/auth-store';
import { useProjectInviteStore } from '@/store/project-invite-store';
import { formatDDayValue, formatShortDateLabel, getDDayLabel } from '@/utils/dday';
import type { ProjectDetailInfoRow, ProjectDetailResponse } from '@/types/project';

export interface ProjectDetailScreenProps {
  projectId?: string;
}

const MENU_DISMISS_Y = 400;
const FALLBACK_ICON = require('../../assets/icons/idea.webp');
const LOAD_ERROR_MESSAGE = '프로젝트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';

/**
 * 서버가 D-day를 안 줘도 상세 화면은 deadline을 갖고 있으므로 직접 계산해 보여준다.
 * (예전에는 D-day가 없으면 'D+NaN'이 그대로 노출됐다.)
 * 마감일마저 비어 있으면 표시할 게 없으므로 아무것도 그리지 않는다.
 */
function getDetailDDayText(project: ProjectDetailResponse): string | null {
  const dDay = resolveDDay(project);
  return typeof dDay === 'number' ? formatDDayValue(dDay) : getDDayLabel(project.deadline);
}

export function ProjectDetailScreen({ projectId }: ProjectDetailScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const memberId = useAuthStore((state) => state.memberId);
  const cachedInvite = useProjectInviteStore((state) =>
    projectId ? state.invites[projectId] : undefined
  );

  const { data: myApplications } = useApplicationsQuery(memberId);

  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkUpdating, setIsBookmarkUpdating] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [menuMode, setMenuMode] = useState<'actions' | 'confirmDelete'>('actions');
  const [menuError, setMenuError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuTranslateY = useRef(new Animated.Value(MENU_DISMISS_Y)).current;

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setLoadError(null);
    setIsBookmarked(false);

    try {
      const detail = await getProject(projectId);
      setProject(detail);

    } catch (error) {
      setProject(null);
      setLoadError(error instanceof ApiError ? error.message : LOAD_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // 상세 화면엔 "내가 이미 스크랩했는지" 알려주는 필드가 따로 없어서, 진짜 상태를
  // 스크랩 목록에서 직접 확인해 버튼 색을 맞춥니다. 이걸 안 하면 이미 스크랩한 프로젝트인데도
  // 버튼이 항상 흰색으로 보여서, 다시 누르면 "이미 스크랩한 프로젝트입니다"로 막히기만 합니다.
  useEffect(() => {
    if (!project || memberId === null) return;
    let cancelled = false;
    getScraps(memberId)
      .then((items) => {
        if (!cancelled) {
          setIsBookmarked(items.some((item) => item.projectId === project.projectId));
        }
      })
      .catch(() => {
        // 실패해도 상세 화면 자체는 그대로 보여주고, 버튼은 안 눌린 상태로 둡니다.
      });
    return () => {
      cancelled = true;
    };
  }, [project, memberId]);

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
    setMenuError(null);
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

  async function handleConfirmDelete() {
    if (!project || memberId === null) return;
    setIsDeleting(true);
    setMenuError(null);

    try {
      await deleteProject(project.projectId, memberId);
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
    } catch (error) {
      setMenuError(error instanceof ApiError ? error.message : '삭제하지 못했습니다.');
    } finally {
      setIsDeleting(false);
    }
  }

  // 스크랩 버튼을 다시 누르면 취소도 되도록 토글로 동작합니다. 성공하면 마이페이지 >
  // 스크랩 화면 캐시도 같이 갱신해서, 스크랩하자마자/취소하자마자 거기에 바로 반영됩니다.
  async function handleBookmarkPress() {
    if (!project || memberId === null || isBookmarkUpdating) return;
    const previousIsBookmarked = isBookmarked;
    const nextIsBookmarked = !previousIsBookmarked;
    setIsBookmarkUpdating(true);
    setBookmarkError(null);
    setIsBookmarked(nextIsBookmarked);

    try {
      if (nextIsBookmarked) {
        await addScrap(memberId, project.projectId);
      } else {
        await removeScrap(memberId, project.projectId);
      }
      queryClient.invalidateQueries({ queryKey: mypageKeys.scraps });
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        queryClient.invalidateQueries({ queryKey: mypageKeys.scraps });
        return;
      }
      setIsBookmarked(previousIsBookmarked);
      setBookmarkError(
        error instanceof ApiError
          ? error.message
          : nextIsBookmarked
            ? '스크랩하지 못했습니다.'
            : '스크랩 취소하지 못했습니다.'
      );
    } finally {
      setIsBookmarkUpdating(false);
    }
  }

  function handleSharePress() {
    if (!projectId || !cachedInvite) return;
    router.push(
      `/project-complete?projectId=${projectId}&inviteLink=${encodeURIComponent(
        cachedInvite.inviteLink
      )}&qrCodeUrl=${encodeURIComponent(cachedInvite.qrCodeUrl)}` as Href
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-1">
        <ActivityIndicator color="#828797" />
      </View>
    );
  }

  if (!project) {
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
          <View className="flex-1 items-center justify-center gap-3 px-5">
            <Text className="text-center font-sans text-sm text-gray-5">
              {loadError ?? LOAD_ERROR_MESSAGE}
            </Text>
            <Pressable accessibilityRole="button" onPress={loadProject}>
              <Text className="font-sans-medium text-sm text-sky-blue">다시 시도</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const status = API_STATUS_TO_PROJECT_STATUS[project.status] ?? 'recruiting';
  const imageSource = project.imageUrl ? { uri: project.imageUrl } : FALLBACK_ICON;
  const isOwner = memberId !== null && project.memberId === memberId;
  // 백엔드가 409로 막는 조건이 PENDING/ACCEPTED라, 거절된 건은 재지원을 허용한다.
  const hasApplied = (myApplications ?? []).some(
    (application) =>
      application.projectId === project.projectId && application.status !== 'REJECTED',
  );

  const infoRows: ProjectDetailInfoRow[] = [
    { label: '모집 인원', value: `${project.recruitCount}명` },
    { label: '모집 역할', value: project.roles.join(' · ') || '미정' },
    { label: '진행 기간', value: formatShortDateLabel(project.periodEnd) },
    { label: '회의 일정', value: project.meetingSchedule },
    { label: '모집 마감', value: formatShortDateLabel(project.deadline) },
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
              <StatusBadge status={status} />

              {isOwner ? (
                <Pressable
                  accessibilityLabel="더보기"
                  accessibilityRole="button"
                  className="h-8 w-8 items-center justify-center"
                  hitSlop={4}
                  onPress={openMenu}
                >
                  <Text className="font-sans-bold text-2xl text-dark-blue">⋮</Text>
                </Pressable>
              ) : null}
            </View>
            <Text className="mt-1.5 font-sans-bold text-xl text-black">{project.title}</Text>
            <View className="mt-1.5 flex-row items-center gap-2">
              <Text className="font-sans-semibold text-xs text-dark-blue">
                {getDetailDDayText(project)}
              </Text>
              <Text className="font-sans text-xs text-gray-5">
                모집기간 {formatShortDateLabel(project.deadline)}
              </Text>
              {project.memberName ? (
                <Text className="ml-auto font-sans text-xs text-gray-5" numberOfLines={1}>
                  {project.memberName}
                </Text>
              ) : null}
            </View>

            <View className="mt-4 h-48 items-center justify-center overflow-hidden rounded-2xl bg-white">
              <Image source={imageSource} resizeMode="contain" style={{ width: 88, height: 88 }} />
            </View>

            <Text className="mt-6 font-sans-medium text-base text-gray-6">프로젝트 제목</Text>
            <View className="mt-2 h-[52px] justify-center rounded-2xl bg-white px-4">
              <Text className="font-sans text-sm text-black" numberOfLines={1}>
                {project.title}
              </Text>
            </View>

            <Text className="mt-6 font-sans-medium text-base text-gray-6">프로젝트 소개글</Text>
            <View className="mt-2 rounded-2xl bg-white p-4">
              <Text className="font-sans text-sm leading-5 text-gray-6">{project.introText}</Text>
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

            {bookmarkError ? (
              <Text className="mt-4 font-sans text-xs text-red-600">{bookmarkError}</Text>
            ) : null}

            <View className="mt-6 flex-row items-center gap-2">
              <Pressable
                accessibilityLabel="북마크"
                accessibilityRole="button"
                accessibilityState={{ disabled: isBookmarkUpdating, selected: isBookmarked }}
                className="h-[52px] w-[52px] items-center justify-center rounded-full bg-white"
                disabled={isBookmarkUpdating}
                onPress={handleBookmarkPress}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Image
                  source={require('../../assets/icons/bookmark.png')}
                  resizeMode="contain"
                  style={{ width: 22, height: 22, tintColor: isBookmarked ? '#4876ee' : undefined }}
                />
              </Pressable>

              <Pressable
                accessibilityLabel="공유하기"
                accessibilityRole="button"
                className="h-[52px] w-[52px] items-center justify-center rounded-full bg-white"
                onPress={handleSharePress}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Ionicons name="share-outline" size={22} color="#484d5a" />
              </Pressable>

              <View className="flex-1">
                {/* 게시자는 자기 프로젝트에 지원할 수 없으므로, 그 자리를 지원자 관리 진입점으로 쓴다. */}
                {isOwner ? (
                  <PrimaryButton
                    label="지원자 관리"
                    variant="accent"
                    onPress={() =>
                      router.push(`/project-applicants?id=${project.projectId}` as Href)
                    }
                  />
                ) : hasApplied ? (
                  <PrimaryButton label="이미 지원함" disabled onPress={() => {}} />
                ) : (
                  <PrimaryButton
                    label="지원하기"
                    onPress={() =>
                      router.push(
                        `/project-apply?id=${project.projectId}&title=${encodeURIComponent(
                          project.title
                        )}` as Href
                      )
                    }
                  />
                )}
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
                      router.push(`/project-edit?id=${project.projectId}` as Href);
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
                  {menuError ? (
                    <Text className="mt-2 text-center font-sans text-xs text-red-600">
                      {menuError}
                    </Text>
                  ) : null}

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
                      <PrimaryButton
                        label="삭제"
                        loading={isDeleting}
                        onPress={handleConfirmDelete}
                      />
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
