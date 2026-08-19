import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommonLayout } from '@/components/layout';
import { PrimaryButton } from '@/components/primary-button';
import { useGenerateRoadmapMutation, useRoadmapQuery } from '@/hooks/useChat';
import { RoadmapPhase } from '@/types';
import { getDDayLabel } from '@/utils/dday';

// team-ready-members.tsx의 "다음" 버튼에서 넘어오는 마지막 화면.
// 봇 안내 문구 아래에 roadmap.tsx와 동일한 리스트 패턴을 재사용한다.
// title은 project-detail-screen → project-apply-screen → team-ready-members를 거쳐
// params로 그대로 전달받는다. (여기서 getProject를 다시 호출하지 않는 이유: api-first에서
// 실 백엔드가 이 데모 프로젝트 id를 모르면 404가 나서 헤더 제목이 빈 값으로 떨어진다.)
export default function TeamReadyRoadmapScreen() {
  const router = useRouter();
  const { projectId: projectIdParam, title } = useLocalSearchParams<{
    projectId: string;
    title: string;
  }>();
  const projectId = Number(projectIdParam);
  const { data } = useRoadmapQuery(projectId);
  const generateRoadmapMutation = useGenerateRoadmapMutation(projectId);
  const phases: RoadmapPhase[] = data?.phases ?? [];
  const [translateOn, setTranslateOn] = useState(true);

  useEffect(() => {
    generateRoadmapMutation.mutate();
    // 화면 진입 시 1회만 로드맵을 재생성한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleNext() {
    router.replace({ pathname: '/project/[id]', params: { id: projectIdParam } });
  }

  return (
    <CommonLayout
      header={{
        title: title || '프로젝트 제목',
        showBack: true,
        translation: { enabled: translateOn, onChange: setTranslateOn },
        showMore: true,
        onMorePress: () =>
          router.push({ pathname: '/chat/[projectId]/settings', params: { projectId: projectIdParam } }),
      }}
      bottomNav={false}
    >
      <View className="min-h-0 flex-1 bg-gray-1">
        <View className="mb-[22px] mt-6 pl-[45px]">
          <Image
            source={require('../../../../assets/images/logo.webp')}
            accessibilityLabel="fitple"
            resizeMode="contain"
            style={{ width: 42, height: 62, marginLeft: -22, marginBottom: -22 }}
          />
          <Text className="font-sans text-[24px] leading-[29px] text-black">
            <Text className="font-sans font-bold">팀원들이 다 모였어요!</Text>
            {'\n'}원활한 <Text className="font-sans font-bold">팀플</Text>을 위해{'\n'}핏봇이
            도와줄게요.
          </Text>
        </View>

        <View className="gap-2 px-5 pb-2">
          <BotMessage text="팀원들의 프로필을 분석해 각자에게 잘 맞는 역할을 배정했어요!" />
          <BotMessage text="핏봇이 목표를 달성하기 위한 최적의 로드맵을 생성했어요!" />
        </View>

        <FlatList
          className="flex-1"
          data={phases}
          keyExtractor={(item) => String(item.phaseId)}
          contentContainerClassName="px-5 py-4"
          renderItem={({ item, index }) => (
            <View className="flex-row">
              <View className="mr-3 items-center" style={{ width: 32 }}>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-dark-blue">
                  <Text className="font-sans-bold text-xs text-white">
                    {String(item.order).padStart(2, '0')}
                  </Text>
                </View>
                {index !== phases.length - 1 ? (
                  <View className="mt-1 w-[2px] flex-1 bg-gray-2" />
                ) : null}
              </View>

              <View className="mb-4 flex-1 flex-row items-start justify-between rounded-2xl bg-white p-4">
                <View className="min-w-0 flex-1 pr-3">
                  <Text className="font-sans-bold text-[15px] text-black" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="mt-1 font-sans-medium text-xs text-dark-blue" numberOfLines={1}>
                    담당 {item.assignee}
                  </Text>
                  <Text className="mt-1 font-sans text-xs text-gray-6" numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-sans-bold text-base text-dark-blue">
                    {getDDayLabel(item.deadline)}
                  </Text>
                  <Text className="mt-1 font-sans text-[11px] text-gray-4">{item.dueDate}</Text>
                </View>
              </View>
            </View>
          )}
        />

        <SafeAreaView edges={['bottom']} className="bg-gray-1 px-5 pt-2">
          <PrimaryButton label="다음" onPress={handleNext} />
        </SafeAreaView>
      </View>
    </CommonLayout>
  );
}

function BotMessage({ text }: { text: string }) {
  return (
    <View className="max-w-[90%] flex-row gap-2 self-center">
      <Image
        source={require('../../../../assets/icons/metalchat.webp')}
        accessibilityLabel="핏봇"
        resizeMode="contain"
        style={{ width: 28, height: 28 }}
      />
      <View className="shrink gap-1 rounded-2xl bg-white-dark-sky-blue p-3">
        <Text className="font-sans-bold text-[11px] text-dark-blue">핏봇</Text>
        <Text className="font-sans text-[15px] text-black">{text}</Text>
      </View>
    </View>
  );
}
