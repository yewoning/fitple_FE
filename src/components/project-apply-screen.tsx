import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CommonLayout } from '@/components/layout';
import { PrimaryButton } from '@/components/primary-button';
import { ApiError } from '@/services/api-client';
import { generateApplicationIntro, submitApplication } from '@/services/application';
import { getMyProfile } from '@/services/member';
import { useAuthStore } from '@/store/auth-store';

interface IntroTemplate {
  id: string;
  label: string;
  text: string;
}

const INTRO_TEMPLATES: IntroTemplate[] = [
  {
    id: 'default',
    label: '기본 소개용',
    text: '안녕하세요! 다양한 프로젝트 경험을 바탕으로 맡은 역할에 책임감 있게 임하는 팀원입니다. 함께 좋은 결과 만들어가고 싶습니다.',
  },
  {
    id: 'contest',
    label: '공모전 지원용',
    text: '여러 공모전에서 기획부터 발표까지 참여한 경험이 있습니다. 아이디어를 구체적인 결과물로 만드는 과정에 강점이 있습니다.',
  },
  {
    id: 'team-project-final',
    label: '팀플지원용_최종본',
    text: '팀 프로젝트에서 일정 관리와 커뮤니케이션을 담당했던 경험이 많습니다. 원활한 협업으로 마감을 지키는 것을 중요하게 생각합니다.',
  },
  {
    id: 'presentation',
    label: '발표 기획 강조용',
    text: '발표 자료 기획과 스토리라인 구성에 강점이 있습니다. 청중에게 명확하게 전달되는 발표를 만드는 데 자신 있습니다.',
  },
  {
    id: 'collaboration',
    label: '협업 경험 추가 버전',
    text: '다양한 전공의 팀원들과 협업한 경험이 풍부합니다. 서로 다른 의견을 조율하며 시너지를 만드는 역할을 주로 맡았습니다.',
  },
  {
    id: 'hackathon',
    label: '해커톤 지원용',
    text: '제한된 시간 안에 아이디어를 빠르게 구체화하고 구현하는 해커톤 경험이 있습니다. 실행력 있게 결과물을 만들어냅니다.',
  },
  {
    id: 'event-operation',
    label: '행사 운영 경험 강조용',
    text: '행사 기획 및 운영을 담당하며 일정 조율과 현장 대응 능력을 키웠습니다. 꼼꼼한 진행 관리가 강점입니다.',
  },
  {
    id: 'data-analysis-final',
    label: '데이터 분석형_찐최종본',
    text: '데이터를 기반으로 문제를 정의하고 인사이트를 도출하는 것을 좋아합니다. 분석 결과를 팀에 명확히 전달하려 노력합니다.',
  },
];

const SHEET_DISMISS_Y = 500;

// 내 프로필 조회(2-1) API 연동 실패 시 표시할 폴백 이름.
const FALLBACK_NAME = '민지';

export interface ProjectApplyScreenProps {
  projectId?: string;
}

export function ProjectApplyScreen({ projectId }: ProjectApplyScreenProps) {
  const router = useRouter();
  const memberId = useAuthStore((state) => state.memberId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const sheetTranslateY = useRef(new Animated.Value(SHEET_DISMISS_Y)).current;

  useEffect(() => {
    if (memberId === null) return;

    getMyProfile(memberId)
      .then((profile) => setName(profile.name))
      .catch(() => setName(FALLBACK_NAME));
  }, [memberId]);

  async function handleGenerateIntro() {
    if (isGenerating) return;
    setIsGenerating(true);
    setSubmitError(null);

    try {
      const result = await generateApplicationIntro({ rawIntroText: description });
      setDescription(result.introText);
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'AI 소개글 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmitApplication() {
    if (isSubmitting || !projectId || memberId === null) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitApplication(projectId, memberId, { introText: description });
      router.back();
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : '지원서 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!showTemplateModal) return;
    sheetTranslateY.setValue(SHEET_DISMISS_Y);
    Animated.timing(sheetTranslateY, {
      toValue: 0,
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [showTemplateModal, sheetTranslateY]);

  function openTemplateModal() {
    setShowTemplateModal(true);
  }

  function closeTemplateModal() {
    Animated.timing(sheetTranslateY, {
      toValue: SHEET_DISMISS_Y,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setShowTemplateModal(false);
      sheetTranslateY.setValue(SHEET_DISMISS_Y);
    });
  }

  function handleApplyTemplate() {
    const template = INTRO_TEMPLATES.find((item) => item.id === selectedTemplateId);
    if (!template) return;
    setDescription(template.text);
    closeTemplateModal();
  }

  const dragHandlePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) sheetTranslateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100 || gesture.vy > 0.5) {
          closeTemplateModal();
        } else {
          Animated.timing(sheetTranslateY, {
            toValue: 0,
            duration: 180,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <CommonLayout header={{ title: '지원하기', showBack: true }} bottomNav={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center pt-6">
            <View className="h-28 w-28 overflow-hidden rounded-full">
              <Image
                source={require('../../assets/icons/profile.png')}
                resizeMode="cover"
                style={{ width: 112, height: 112 }}
              />
            </View>
          </View>

          <View className="mt-8 px-5">
            <Text className="font-sans-medium text-base text-gray-6">이름</Text>
            <View className="mt-2 h-[52px] flex-row items-center gap-2 rounded-2xl bg-white px-4">
              <Image
                source={require('../../assets/icons/people.png')}
                resizeMode="contain"
                style={{ width: 16, height: 16 }}
              />
              <TextInput
                accessibilityLabel="이름"
                className="flex-1 font-sans text-sm text-black"
                onChangeText={setName}
                placeholder="이름을 입력해주세요"
                placeholderTextColor="#828797"
                value={name}
              />
            </View>
          </View>

          <View className="mt-6 px-5">
            <Text className="font-sans-medium text-base text-gray-6">소개글</Text>
            <View className="mt-2 rounded-2xl bg-white p-4">
              <TextInput
                accessibilityLabel="소개글"
                className="min-h-[140px] font-sans text-sm text-black"
                multiline
                onChangeText={setDescription}
                placeholder="원하는 내용을 자유롭게 입력해주세요"
                placeholderTextColor="#828797"
                textAlignVertical="top"
                value={description}
              />

              <Pressable
                accessibilityLabel="AI 생성하기"
                accessibilityRole="button"
                className="mt-2 flex-row items-center gap-1 self-end rounded-full bg-white-dark-sky-blue px-3 py-1.5"
                disabled={isGenerating}
                onPress={handleGenerateIntro}
                style={({ pressed }) => ({ opacity: pressed || isGenerating ? 0.7 : 1 })}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#828797" size="small" />
                ) : (
                  <Text className="font-sans text-xs text-gray-5">↻</Text>
                )}
                <Text className="font-sans-medium text-xs text-gray-5">AI 생성하기</Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-6 flex-row items-center gap-3 px-5">
            <View className="h-[1px] flex-1 bg-gray-3" />
            <Text className="font-sans text-xs text-gray-4">또는</Text>
            <View className="h-[1px] flex-1 bg-gray-3" />
          </View>

          <View className="mt-6 px-5">
            <Pressable
              accessibilityLabel="기존 프로필 소개글 불러오기"
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-4"
              onPress={openTemplateModal}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Image
                source={require('../../assets/icons/fi-rs-sign-in.png')}
                resizeMode="contain"
                style={{ width: 20, height: 20, tintColor: '#828797' }}
              />
              <View className="min-w-0 flex-1">
                <Text className="font-sans-medium text-sm text-gray-6">
                  기존 프로필 소개글 불러오기
                </Text>
                <Text className="mt-0.5 font-sans text-xs text-gray-4">
                  기존에 작성한 소개글을 간편하게 불러오세요
                </Text>
              </View>
            </Pressable>
          </View>

          {submitError ? (
            <Text className="mx-5 mt-4 font-sans text-xs text-red-600">{submitError}</Text>
          ) : null}

          <View className="mt-8 px-5">
            <PrimaryButton
              label="완료하기"
              loading={isSubmitting}
              onPress={handleSubmitApplication}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showTemplateModal ? (
        <>
          <Pressable
            accessibilityLabel="소개글 선택 닫기"
            className="absolute bottom-0 left-0 right-0 top-0"
            onPress={closeTemplateModal}
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          />
          <Animated.View
            className="absolute bottom-0 left-0 right-0 rounded-t-[28px]"
            style={{ transform: [{ translateY: sheetTranslateY }] }}
          >
            <View className="overflow-hidden rounded-t-[28px] bg-[#ebeef5]">
              <View className="px-5 pb-8 pt-3">
                <View {...dragHandlePanResponder.panHandlers} className="pb-2 pt-1">
                  <View className="h-1 w-10 self-center rounded-full bg-gray-3" />
                  <Text className="mt-4 font-sans-bold text-base text-black">
                    원하는 소개글을 선택해주세요
                  </Text>
                </View>

                <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                  {INTRO_TEMPLATES.map((template) => {
                    const selected = template.id === selectedTemplateId;
                    return (
                      <Pressable
                        key={template.id}
                        accessibilityLabel={template.label}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        className="flex-row items-center justify-between py-3"
                        onPress={() => setSelectedTemplateId(template.id)}
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                      >
                        <Text className="font-sans text-sm text-black">{template.label}</Text>
                        <View
                          className={`h-[18px] w-[18px] items-center justify-center rounded-[4px] ${
                            selected ? 'bg-sky-blue' : 'border border-gray-3'
                          }`}
                        >
                          {selected ? (
                            <Text className="font-sans-bold text-[11px] text-white">✓</Text>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View className="mt-5">
                  <PrimaryButton
                    disabled={!selectedTemplateId}
                    label="완료하기"
                    onPress={handleApplyTemplate}
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        </>
      ) : null}
    </CommonLayout>
  );
}
