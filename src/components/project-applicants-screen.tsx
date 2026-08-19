import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { CommonLayout } from '@/components/layout';
import { PrimaryButton } from '@/components/primary-button';
import { ApiError } from '@/services/api-client';
import {
  acceptApplication,
  getProjectApplications,
  rejectApplication,
} from '@/services/application';
import { useAuthStore } from '@/store/auth-store';
import type { ProjectApplicationItem } from '@/types/application';

const LOAD_ERROR_MESSAGE = '지원자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: '수락됨',
  REJECTED: '거절됨',
};

export interface ProjectApplicantsScreenProps {
  projectId?: string;
}

export function ProjectApplicantsScreen({ projectId }: ProjectApplicantsScreenProps) {
  const memberId = useAuthStore((state) => state.memberId);

  const [applicants, setApplicants] = useState<ProjectApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // 처리 중인 지원서만 버튼을 잠근다. 목록 전체를 잠그면 다른 지원자도 못 누르게 된다.
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadApplicants = useCallback(async () => {
    if (!projectId || memberId === null) return;
    setIsLoading(true);
    setLoadError(null);

    try {
      const items = await getProjectApplications(projectId, memberId);
      setApplicants(items);
    } catch (error) {
      setApplicants([]);
      setLoadError(error instanceof ApiError ? error.message : LOAD_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, memberId]);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  async function handleDecision(applicationId: number, decision: 'accept' | 'reject') {
    if (!projectId || memberId === null || processingId !== null) return;
    setProcessingId(applicationId);
    setActionError(null);

    try {
      if (decision === 'accept') {
        await acceptApplication(projectId, applicationId, memberId);
      } else {
        await rejectApplication(projectId, applicationId, memberId);
      }
      await loadApplicants();
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : decision === 'accept'
            ? '수락하지 못했습니다.'
            : '거절하지 못했습니다.',
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <CommonLayout header={{ title: '지원자 관리', showBack: true }} bottomNav={false}>
      <View className="min-h-0 flex-1 bg-gray-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#828797" />
          </View>
        ) : loadError ? (
          <View className="flex-1 items-center justify-center gap-3 px-5">
            <Text className="text-center font-sans text-sm text-gray-5">{loadError}</Text>
            <Pressable accessibilityRole="button" onPress={loadApplicants}>
              <Text className="font-sans-medium text-sm text-sky-blue">다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text className="px-5 pb-2 pt-4 font-sans-bold text-[13px] text-gray-6">
              지원자 {applicants.length}명
            </Text>

            {actionError ? (
              <Text className="px-5 pb-2 font-sans text-xs text-red-600">{actionError}</Text>
            ) : null}

            <FlatList
              className="flex-1"
              data={applicants}
              keyExtractor={(item) => String(item.applicationId)}
              contentContainerClassName="px-5 pb-5"
              ItemSeparatorComponent={() => <View className="h-3" />}
              ListEmptyComponent={
                <Text className="mt-16 text-center font-sans text-sm text-gray-5">
                  아직 지원자가 없어요
                </Text>
              }
              renderItem={({ item }) => {
                const isPending = item.status === 'PENDING';
                const isProcessing = processingId === item.applicationId;

                return (
                  <View className="rounded-2xl bg-white p-4">
                    <View className="flex-row items-start gap-3">
                      {/* people.png 원본이 15x20이라 확대하면 깨진다. 원형 배경으로 크기를 만들고
                          이미지는 원본 크기 그대로 둔다. */}
                      <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-2">
                        <Image
                          source={require('../../assets/icons/people.png')}
                          accessibilityLabel={item.memberName}
                          resizeMode="contain"
                          style={{ width: 15, height: 20 }}
                        />
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text className="font-sans-semibold text-[15px] text-black">
                          {item.memberName}
                        </Text>
                        <Text className="mt-1 font-sans text-[13px] leading-5 text-gray-6">
                          {item.introText}
                        </Text>
                      </View>
                    </View>

                    {isPending ? (
                      <View className="mt-4 flex-row gap-2">
                        <Pressable
                          accessibilityLabel={`${item.memberName} 거절`}
                          accessibilityRole="button"
                          className="h-[55px] flex-1 items-center justify-center rounded-full border border-gray-2 bg-gray-1"
                          disabled={processingId !== null}
                          onPress={() => handleDecision(item.applicationId, 'reject')}
                          style={({ pressed }) => ({
                            opacity: pressed || processingId !== null ? 0.7 : 1,
                          })}
                        >
                          <Text className="font-sans-semibold text-sm text-gray-6">거절</Text>
                        </Pressable>

                        <View className="flex-1">
                          <PrimaryButton
                            label="수락"
                            loading={isProcessing}
                            disabled={processingId !== null && !isProcessing}
                            onPress={() => handleDecision(item.applicationId, 'accept')}
                          />
                        </View>
                      </View>
                    ) : (
                      <Text className="mt-3 self-end font-sans-medium text-xs text-gray-5">
                        {STATUS_LABEL[item.status] ?? item.status}
                      </Text>
                    )}
                  </View>
                );
              }}
            />
          </>
        )}
      </View>
    </CommonLayout>
  );
}
