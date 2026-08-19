import { useEffect, useRef, useState } from 'react';
import { type Href, useRouter } from 'expo-router';
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
import { createProject, generateProjectIntro, uploadProjectImage } from '@/services/project';
import { useAuthStore } from '@/store/auth-store';
import { useProjectInviteStore } from '@/store/project-invite-store';
import { formatShortDateLabel } from '@/utils/dday';
import { pickImageFile } from '@/utils/image-picker';
import type { ProjectAiGenerateResponse, ProjectDetailInfoRow } from '@/types/project';

const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 0.5;

function toInfoRows(result: ProjectAiGenerateResponse): ProjectDetailInfoRow[] {
  return [
    { label: '모집 인원', value: `${result.recruitCount}명` },
    { label: '모집 역할', value: result.roles.join(' · ') },
    { label: '진행 기간', value: formatShortDateLabel(result.periodEnd) },
    { label: '회의 일정', value: result.meetingSchedule },
    { label: '모집 마감', value: formatShortDateLabel(result.deadline) },
  ];
}

export function ProjectCreateScreen() {
  const router = useRouter();
  const memberId = useAuthStore((state) => state.memberId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [showAiResult, setShowAiResult] = useState(false);
  const [aiResult, setAiResult] = useState<ProjectAiGenerateResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const sheetTranslateY = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    if (!showAiResult) return;
    sheetTranslateY.setValue(800);
    Animated.timing(sheetTranslateY, {
      toValue: 0,
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [showAiResult, sheetTranslateY]);

  function validateFields() {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    setTitleError(trimmedTitle ? null : '프로젝트 제목을 입력해주세요.');
    setDescriptionError(trimmedDescription ? null : '프로젝트 소개글을 입력해주세요.');

    return Boolean(trimmedTitle && trimmedDescription);
  }

  async function handlePickImage() {
    const file = await pickImageFile();
    if (!file) return;

    setImageUri(file.uri);
    setIsUploadingImage(true);
    setFormError(null);

    try {
      const result = await uploadProjectImage(file);
      setImageUrl(result.imageUrl);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function generateAndStore(file?: { uri: string; name: string; type: string }) {
    if (!validateFields()) return null;

    setIsGenerating(true);
    setFormError(null);

    try {
      const result = await generateProjectIntro({ title, rawIntroText: description, file });
      setAiResult(result);
      return result;
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'AI 생성에 실패했습니다.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateClick() {
    const result = await generateAndStore();
    if (result) setShowAiResult(true);
  }

  async function handleFileAttachClick() {
    const file = await pickImageFile();
    if (!file) return;

    const result = await generateAndStore(file);
    if (result) setShowAiResult(true);
  }

  async function handleRegenerateClick() {
    await generateAndStore();
  }

  async function createProjectAndNavigate(result: ProjectAiGenerateResponse) {
    if (memberId === null) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const created = await createProject(
        {
          title,
          introText: result.introText,
          recruitCount: result.recruitCount,
          roles: result.roles,
          periodEnd: result.periodEnd,
          meetingSchedule: result.meetingSchedule,
          deadline: result.deadline,
          imageUrl,
        },
        memberId
      );

      useProjectInviteStore.getState().setInvite(String(created.projectId), {
        inviteLink: created.inviteLink,
        qrCodeUrl: created.qrCodeUrl,
      });

      router.push(
        `/project-complete?projectId=${created.projectId}&inviteLink=${encodeURIComponent(
          created.inviteLink
        )}&qrCodeUrl=${encodeURIComponent(created.qrCodeUrl)}` as Href
      );
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : '프로젝트 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit() {
    if (!validateFields()) return;

    const result = aiResult ?? (await generateAndStore());
    if (!result) return;

    await createProjectAndNavigate(result);
  }

  async function handleSheetSubmit() {
    if (!aiResult) return;
    await createProjectAndNavigate(aiResult);
  }

  function closeAiResult() {
    Animated.timing(sheetTranslateY, {
      toValue: 800,
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      setShowAiResult(false);
      sheetTranslateY.setValue(800);
    });
  }

  const dragHandlePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) sheetTranslateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) {
          closeAiResult();
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

  const isBusy = isGenerating || isSubmitting || isUploadingImage;

  return (
    <CommonLayout header={{ title: '프로젝트 만들기', showBack: true }} bottomNav={false}>
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
            <View className="relative h-28 w-28">
              <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white">
                {isUploadingImage ? (
                  <ActivityIndicator color="#828797" />
                ) : (
                  <Image
                    source={
                      imageUri
                        ? { uri: imageUri }
                        : require('../../assets/images/fitple-gray.png')
                    }
                    accessibilityLabel="기본 프로젝트 이미지"
                    resizeMode={imageUri ? 'cover' : 'contain'}
                    style={
                      imageUri ? { width: 112, height: 112 } : { width: 72, height: 72 }
                    }
                  />
                )}
              </View>

              <Pressable
                accessibilityLabel="대표 이미지 변경"
                accessibilityRole="button"
                className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-white"
                disabled={isBusy}
                onPress={handlePickImage}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <View className="absolute h-[1.5px] w-2.5 rounded-full bg-gray-5" />
                <View className="absolute h-2.5 w-[1.5px] rounded-full bg-gray-5" />
              </Pressable>
            </View>
          </View>

          <View className="mt-8 px-5">
            <Text className="font-sans-medium text-base text-gray-6">프로젝트 제목</Text>
            <TextInput
              accessibilityLabel="프로젝트 제목"
              className="mt-2 h-[52px] rounded-2xl bg-white px-4 font-sans text-sm text-black"
              onChangeText={(value) => {
                setTitle(value);
                if (titleError) setTitleError(null);
              }}
              placeholder="프로젝트 제목을 입력해주세요"
              placeholderTextColor="#828797"
              value={title}
            />
            {titleError ? (
              <Text className="ml-3 mt-1 font-sans text-[12px] leading-4 text-red-600">
                {titleError}
              </Text>
            ) : null}
          </View>

          <View className="mt-6 px-5">
            <Text className="font-sans-medium text-base text-gray-6">프로젝트 소개글</Text>
            <View className="mt-2 rounded-2xl bg-white p-4">
              <TextInput
                accessibilityLabel="프로젝트 소개글"
                className="min-h-[140px] font-sans text-sm text-black"
                multiline
                onChangeText={(value) => {
                  setDescription(value);
                  if (descriptionError) setDescriptionError(null);
                }}
                placeholder="원하는 내용을 자유롭게 입력해주세요"
                placeholderTextColor="#828797"
                textAlignVertical="top"
                value={description}
              />

              <Pressable
                accessibilityLabel="AI 생성하기"
                accessibilityRole="button"
                className="mt-2 flex-row items-center gap-1 self-end rounded-full bg-white-dark-sky-blue px-3 py-1.5"
                disabled={isBusy}
                onPress={handleGenerateClick}
                style={({ pressed }) => ({ opacity: pressed || isBusy ? 0.7 : 1 })}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#828797" size="small" />
                ) : (
                  <Text className="font-sans text-xs text-gray-5">↻</Text>
                )}
                <Text className="font-sans-medium text-xs text-gray-5">AI 생성하기</Text>
              </Pressable>
            </View>
            {descriptionError ? (
              <Text className="ml-3 mt-1 font-sans text-[12px] leading-4 text-red-600">
                {descriptionError}
              </Text>
            ) : null}
          </View>

          <View className="mt-6 flex-row items-center gap-3 px-5">
            <View className="h-[1px] flex-1 bg-gray-3" />
            <Text className="font-sans text-xs text-gray-4">또는</Text>
            <View className="h-[1px] flex-1 bg-gray-3" />
          </View>

          <View className="mt-6 px-5">
            <Pressable
              accessibilityLabel="파일 첨부로 AI에게 분석 맡기기"
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-4"
              disabled={isBusy}
              onPress={handleFileAttachClick}
              style={({ pressed }) => ({ opacity: pressed || isBusy ? 0.7 : 1 })}
            >
              <Image
                source={require('../../assets/icons/fi-rs-sign-in.png')}
                resizeMode="contain"
                style={{ width: 20, height: 20, tintColor: '#828797' }}
              />
              <View className="min-w-0 flex-1">
                <Text className="font-sans-medium text-sm text-gray-6">
                  파일 첨부로 AI에게 분석을 맡겨보세요
                </Text>
                <Text className="mt-0.5 font-sans text-xs text-gray-4">이미지(jpg, png)</Text>
              </View>
            </Pressable>
          </View>

          {formError ? (
            <Text className="mx-5 mt-4 font-sans text-[12px] leading-4 text-red-600">
              {formError}
            </Text>
          ) : null}

          <View className="mt-8 px-5">
            <PrimaryButton label="완료하기" loading={isSubmitting} onPress={handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showAiResult && aiResult ? (
        <Animated.View
          className="absolute bottom-0 left-0 right-0 rounded-t-[28px]"
          style={{ transform: [{ translateY: sheetTranslateY }] }}
        >
          <View className="overflow-hidden rounded-t-[28px] bg-[#ebeef5]">
          <View className="px-5 pb-8 pt-3">
          <View {...dragHandlePanResponder.panHandlers} className="pb-3 pt-1">
            <View className="h-1 w-10 self-center rounded-full bg-gray-3" />
            <Text className="mt-4 text-center font-sans-bold text-xl text-black">
              AI 프로젝트 다시 생성
            </Text>
            <Text className="mt-1 text-center font-sans text-sm text-gray-5">
              AI가 분석하고 작성한 결과예요
            </Text>
          </View>

          <View className="mt-5 rounded-2xl bg-white p-4">
            <View className="flex-row items-center gap-1.5">
              <Image
                source={require('../../assets/icons/magicwand.png')}
                resizeMode="contain"
                style={{ width: 14, height: 14 }}
              />
              <Text className="font-sans-semibold text-sm text-black">AI가 작성한 프로젝트</Text>
            </View>
            <Text className="mt-2 font-sans text-sm leading-5 text-gray-6">
              {aiResult.introText}
            </Text>
            <View className="mt-3 border-t border-dashed border-gray-3" />
            <View className="mt-3 gap-1.5">
              {toInfoRows(aiResult).map((row) => (
                <View key={row.label} className="flex-row gap-2">
                  <Text className="font-sans-medium text-xs text-gray-6">{row.label}</Text>
                  <Text className="font-sans text-xs text-gray-6">{row.value}</Text>
                </View>
              ))}
            </View>
            <Pressable
              accessibilityLabel="AI 다시 생성"
              accessibilityRole="button"
              className="mt-3 flex-row items-center gap-1 self-end rounded-full bg-white-dark-sky-blue px-3 py-1.5"
              disabled={isGenerating}
              onPress={handleRegenerateClick}
              style={({ pressed }) => ({ opacity: pressed || isGenerating ? 0.7 : 1 })}
            >
              {isGenerating ? (
                <ActivityIndicator color="#828797" size="small" />
              ) : (
                <Text className="font-sans text-xs text-gray-5">↻</Text>
              )}
              <Text className="font-sans-medium text-xs text-gray-5">AI 다시 생성</Text>
            </Pressable>
          </View>

          {formError ? (
            <Text className="mt-3 font-sans text-[12px] leading-4 text-red-600">{formError}</Text>
          ) : null}

          <View className="mt-5">
            <PrimaryButton label="완료하기" loading={isSubmitting} onPress={handleSheetSubmit} />
          </View>
          </View>
          </View>
        </Animated.View>
      ) : null}
    </CommonLayout>
  );
}
