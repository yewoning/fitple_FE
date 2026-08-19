import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommonLayout } from '@/components/layout';
import { PrimaryButton } from '@/components/primary-button';
import type { AssignedRole } from '@/types/project';

// 지원자가 마지막으로 합류해 모집 인원이 다 찼을 때(project-apply-screen)만 도달하는 첫 화면.
// AI 역할 배정 결과(assignments)와 프로젝트 제목(title)을 라우트 params로 그대로 전달받아
// 다시 호출하지 않고 그대로 표시한다. "다음"을 누르면 같은 params를 team-ready-roadmap으로 넘긴다.
export default function TeamReadyMembersScreen() {
  const router = useRouter();
  const {
    projectId: projectIdParam,
    title,
    assignments: assignmentsParam,
  } = useLocalSearchParams<{
    projectId: string;
    title: string;
    assignments: string;
  }>();
  const [translateOn, setTranslateOn] = useState(true);

  let members: AssignedRole[] = [];
  try {
    members = assignmentsParam ? (JSON.parse(assignmentsParam) as AssignedRole[]) : [];
  } catch {
    members = [];
  }

  function handleNext() {
    router.push({
      pathname: '/chat/[projectId]/team-ready-roadmap',
      params: { projectId: projectIdParam, title, assignments: assignmentsParam },
    });
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
            source={require('../../../../../assets/images/logo.webp')}
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
        </View>

        <Text className="mb-2 px-5 pt-3 font-sans-bold text-[13px] text-gray-6">
          팀원 {members.length}명
        </Text>
        <FlatList
          className="flex-1"
          data={members}
          keyExtractor={(item) => String(item.memberId)}
          contentContainerClassName="px-5 pb-5"
          ItemSeparatorComponent={() => <View className="h-px bg-gray-2" />}
          renderItem={({ item }) => (
            <View className="flex-row items-start gap-3 py-3">
              {/* people.png 원본이 15x20이라 확대하면 깨진다. 원형 배경으로 크기를 만들고
                  이미지는 원본 크기 그대로 둔다. */}
              <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-2">
                <Image
                  source={require('../../../../../assets/icons/people.png')}
                  accessibilityLabel={item.name}
                  resizeMode="contain"
                  style={{ width: 15, height: 20 }}
                />
              </View>
              <View className="flex-1">
                <Text className="font-sans-semibold text-[15px] text-black">{item.name}</Text>
                <Text className="mt-0.5 font-sans text-[13px] text-sky-blue">담당 {item.role}</Text>
                <Text className="mt-0.5 font-sans text-[13px] text-gray-6">{item.reason}</Text>
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
        source={require('../../../../../assets/icons/metalchat.webp')}
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
