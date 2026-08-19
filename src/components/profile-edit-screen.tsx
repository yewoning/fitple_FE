import { CommonLayout } from '@/components/layout';
import { PrimaryButton } from '@/components/primary-button';
import { ApiError } from '@/services/api-client';
import { getProfile, regenerateProfile, updateProfile } from '@/services/profile';
import { useAuthStore } from '@/store/auth-store';
import { useProfileEditStore } from '@/store/profile-edit-store';
import { useQueryClient } from '@tanstack/react-query';
import { Redirect, type Href, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROFILE_ERROR_MESSAGE = '프로필을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.';
const SHEET_DISMISS_Y = 720;
const SHEET_DISMISS_DISTANCE = 100;
const SHEET_DISMISS_VELOCITY = 0.5;

export function ProfileEditScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginId = useAuthStore((state) => state.loginId);
  const draft = useProfileEditStore((state) => state.draft);
  const clearDraft = useProfileEditStore((state) => state.clearDraft);

  const [name, setName] = useState(draft?.name ?? '');
  const [profileSummary, setProfileSummary] = useState(draft?.profileSummary ?? '');
  const [profileImage, setProfileImage] = useState(draft?.profileImage);
  const [isLoading, setIsLoading] = useState(!draft);
  const [profileMissing, setProfileMissing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [regenerationSheetOpen, setRegenerationSheetOpen] = useState(false);
  const [regenerationPrompt, setRegenerationPrompt] = useState('');
  const [regenerationError, setRegenerationError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const isRegeneratingRef = useRef(false);
  const sheetTranslateY = useRef(new Animated.Value(SHEET_DISMISS_Y)).current;

  useEffect(() => {
    if (!isAuthenticated || !loginId || draft) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    setProfileMissing(false);

    void getProfile()
      .then((profile) => {
        if (!isMounted) {
          return;
        }

        if (!profile.profileSummary?.trim()) {
          setProfileMissing(true);
          return;
        }

        setName(profile.name ?? '');
        setProfileSummary(profile.profileSummary);
        setProfileImage(profile.profileImage);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setProfileMissing(true);
          return;
        }

        setLoadError(error instanceof ApiError ? error.message : PROFILE_ERROR_MESSAGE);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [draft, isAuthenticated, loadAttempt, loginId]);

  useEffect(() => {
    if (!regenerationSheetOpen) {
      return;
    }

    sheetTranslateY.setValue(SHEET_DISMISS_Y);
    Animated.timing(sheetTranslateY, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [regenerationSheetOpen, sheetTranslateY]);

  const hideRegenerationSheet = useCallback(() => {
    Animated.timing(sheetTranslateY, {
      toValue: SHEET_DISMISS_Y,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setRegenerationSheetOpen(false);
      sheetTranslateY.setValue(SHEET_DISMISS_Y);
    });
  }, [sheetTranslateY]);

  const requestCloseRegenerationSheet = useCallback(() => {
    if (isRegeneratingRef.current) {
      return;
    }

    Keyboard.dismiss();
    hideRegenerationSheet();
  }, [hideRegenerationSheet]);

  useEffect(() => {
    if (!regenerationSheetOpen) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      requestCloseRegenerationSheet();
      return true;
    });

    return () => subscription.remove();
  }, [regenerationSheetOpen, requestCloseRegenerationSheet]);

  const dragHandlePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        !isRegeneratingRef.current && gesture.dy > 4,
      onPanResponderMove: (_, gesture) => {
        if (!isRegeneratingRef.current && gesture.dy > 0) {
          sheetTranslateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (
          gesture.dy > SHEET_DISMISS_DISTANCE ||
          gesture.vy > SHEET_DISMISS_VELOCITY
        ) {
          requestCloseRegenerationSheet();
          return;
        }

        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  if (!isAuthenticated || !loginId) {
    return <Redirect href={'/login' as Href} />;
  }

  if (profileMissing) {
    return <Redirect href={'/profile-setup' as Href} />;
  }

  const handleOpenRegenerationSheet = () => {
    setRegenerationPrompt('');
    setRegenerationError(null);
    setSaveError(null);
    Keyboard.dismiss();
    setRegenerationSheetOpen(true);
  };

  const handleRegenerate = async () => {
    const prompt = regenerationPrompt.trim();

    if (!prompt || isRegenerating) {
      if (!prompt) {
        setRegenerationError('원하는 수정 방향을 입력해주세요.');
      }
      return;
    }

    isRegeneratingRef.current = true;
    setIsRegenerating(true);
    setRegenerationError(null);

    try {
      const response = await regenerateProfile({
        profileSummary: prompt,
        usedFiles: [],
        editable: true,
      });
      const regeneratedSummary = response.profileSummary.trim();

      if (!regeneratedSummary) {
        throw new ApiError(PROFILE_ERROR_MESSAGE);
      }

      setProfileSummary(regeneratedSummary);
      setRegenerationPrompt('');
      Keyboard.dismiss();
      hideRegenerationSheet();
    } catch (error) {
      setRegenerationError(error instanceof ApiError ? error.message : PROFILE_ERROR_MESSAGE);
    } finally {
      isRegeneratingRef.current = false;
      setIsRegenerating(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedSummary = profileSummary.trim();

    if (!trimmedName || !trimmedSummary) {
      setSaveError('이름과 소개글을 모두 입력해주세요.');
      return;
    }

    if (isSaving || isRegenerating) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await updateProfile({
        name: trimmedName,
        profileSummary: trimmedSummary,
        ...(profileImage ? { profileImage } : {}),
      });
      await queryClient.invalidateQueries({ queryKey: ['mypage', 'profile'] });
      clearDraft();
      router.replace('/home' as Href);
    } catch (error) {
      setSaveError(error instanceof ApiError ? error.message : PROFILE_ERROR_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  };

  const regenerationPromptReady = regenerationPrompt.trim().length > 0;

  return (
    <CommonLayout
      header={{
        title: '프로필 편집',
        showBack: true,
        onBackPress: regenerationSheetOpen
          ? requestCloseRegenerationSheet
          : () => router.back(),
      }}
      bottomNav={false}
    >
      <View className="relative min-h-0 flex-1 overflow-hidden">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 bg-gray-1"
          keyboardVerticalOffset={56}
        >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#4876EE" />
            <Text className="mt-3 font-sans text-sm text-gray-5">프로필을 불러오고 있어요.</Text>
          </View>
        ) : loadError ? (
          <View className="mx-auto w-full max-w-md flex-1 items-center justify-center px-7">
            <Text className="text-center font-sans text-sm leading-5 text-red-600">{loadError}</Text>
            <Pressable
              accessibilityRole="button"
              className="mt-4 rounded-full bg-sky-blue px-5 py-3"
              onPress={() => setLoadAttempt((current) => current + 1)}
            >
              <Text className="font-sans-semibold text-sm text-white">다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="mx-auto w-full max-w-md flex-1 px-7 pt-16">
              <View className="items-center">
                <View className="h-28 w-28 overflow-hidden rounded-full bg-white">
                  <Image
                    accessibilityLabel="프로필 이미지"
                    resizeMode="cover"
                    source={
                      profileImage
                        ? { uri: profileImage }
                        : require('../../assets/icons/profile.png')
                    }
                    style={{ width: 112, height: 112 }}
                  />
                </View>
              </View>

              <View className="mt-3">
                <Text className="mb-1.5 font-sans-semibold text-xs text-gray-6">이름</Text>
                <View className="h-[46px] flex-row items-center rounded-full bg-white px-5">
                  <Image
                    accessibilityIgnoresInvertColors
                    resizeMode="contain"
                    source={require('../../assets/icons/people.png')}
                    style={{ width: 16, height: 16, tintColor: '#484D5A' }}
                  />
                  <TextInput
                    accessibilityLabel="이름"
                    className="ml-2 flex-1 font-sans text-[13px] text-gray-6"
                    editable={!isSaving && !isRegenerating}
                    onChangeText={(value) => {
                      setName(value);
                      if (saveError) {
                        setSaveError(null);
                      }
                    }}
                    placeholder="이름을 입력해주세요"
                    placeholderTextColor="#828797"
                    value={name}
                  />
                </View>
              </View>

              <View className="mt-3">
                <Text className="mb-1.5 font-sans-semibold text-xs text-gray-6">소개글</Text>
                <View className="min-h-[318px] rounded-[32px] bg-white px-7 pb-4 pt-5">
                  <View className="flex-row items-center gap-2">
                    <Image
                      accessibilityIgnoresInvertColors
                      resizeMode="contain"
                      source={require('../../assets/icons/magicwand.png')}
                      style={{ width: 15, height: 15 }}
                    />
                    <Text className="font-sans-semibold text-[13px] text-gray-6">
                      AI가 작성한 프로필
                    </Text>
                  </View>

                  <TextInput
                    accessibilityLabel="프로필 소개글"
                    className="mt-3 min-h-[220px] flex-1 font-sans text-[13px] leading-[21px] text-gray-6"
                    editable={!isSaving && !isRegenerating}
                    multiline
                    onChangeText={(value) => {
                      setProfileSummary(value);
                      if (saveError) {
                        setSaveError(null);
                      }
                    }}
                    placeholder="프로필 소개글을 입력해주세요"
                    placeholderTextColor="#828797"
                    textAlignVertical="top"
                    value={profileSummary}
                  />

                  <Pressable
                    accessibilityLabel="AI 프로필 다시 생성"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isSaving || isRegenerating }}
                    className="mt-2 flex-row items-center gap-1 self-end rounded-full bg-white-dark-sky-blue px-3 py-2"
                    disabled={isSaving || isRegenerating}
                    onPress={handleOpenRegenerationSheet}
                    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                  >
                    <Text className="font-sans text-xs text-gray-5">↻</Text>
                    <Text className="font-sans-medium text-xs text-gray-5">AI 다시 생성</Text>
                  </Pressable>
                </View>
              </View>

              {saveError ? (
                <Text className="mt-3 font-sans text-xs leading-4 text-red-600">{saveError}</Text>
              ) : null}

              <View className="mt-7">
                <PrimaryButton
                  label="완료하기"
                  loading={isSaving}
                  loadingLabel="저장 중..."
                  disabled={isRegenerating}
                  onPress={handleSave}
                />
              </View>
            </View>
          </ScrollView>
        )}
        </KeyboardAvoidingView>

        {regenerationSheetOpen ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={56}
            pointerEvents="box-none"
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0 }}
          >
          <Pressable
            accessibilityLabel="AI 프로필 다시 생성 닫기"
            accessibilityRole="button"
            className="absolute bottom-0 left-0 right-0 top-0"
            disabled={isRegenerating}
            onPress={requestCloseRegenerationSheet}
            style={{ backgroundColor: 'rgba(246,248,251,0.08)' }}
          />

          <View className="flex-1 justify-end">
            <Animated.View
              className="rounded-t-[32px]"
              style={{
                backgroundColor: '#EEF2F8',
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                overflow: 'hidden',
                transform: [{ translateY: sheetTranslateY }],
              }}
            >
              <SafeAreaView edges={['bottom']}>
                <View className="mx-auto w-full max-w-md px-7 pb-5 pt-3">
                  <View {...dragHandlePanResponder.panHandlers} className="pb-3 pt-1">
                    <View className="h-1 w-10 self-center rounded-full bg-gray-3" />
                    <Text className="mt-5 text-center font-sans-semibold text-xl text-gray-6">
                      AI 프로필 다시 생성
                    </Text>
                    <Text className="mt-2 text-center font-sans text-xs text-gray-5">
                      원하는 방향으로 다시 수정해주세요
                    </Text>
                  </View>

                  <TextInput
                    accessibilityLabel="AI 프로필 수정 방향"
                    className="mt-3 min-h-[220px] rounded-[32px] bg-white px-6 py-5 font-sans text-[13px] leading-5 text-gray-6"
                    editable={!isRegenerating}
                    multiline
                    onChangeText={(value) => {
                      setRegenerationPrompt(value);
                      if (regenerationError) {
                        setRegenerationError(null);
                      }
                    }}
                    placeholder="원하는 내용을 자유롭게 입력해주세요"
                    placeholderTextColor="#828797"
                    textAlignVertical="top"
                    value={regenerationPrompt}
                  />

                  {regenerationError ? (
                    <Text className="mt-3 font-sans text-xs leading-4 text-red-600">
                      {regenerationError}
                    </Text>
                  ) : null}

                  <View className="mt-5">
                    <PrimaryButton
                      label="다시 생성하기"
                      loading={isRegenerating}
                      loadingLabel="생성 중..."
                      disabled={!regenerationPromptReady}
                      onPress={handleRegenerate}
                    />
                  </View>
                </View>
              </SafeAreaView>
            </Animated.View>
          </View>
          </KeyboardAvoidingView>
        ) : null}
      </View>
    </CommonLayout>
  );
}
