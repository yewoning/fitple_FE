import { useEffect, useRef, useState } from 'react';
import { type Href, useRouter } from 'expo-router';
import {
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

const MOCK_AI_RESULT = {
  summary:
    '외국인 교환학생과 한국인 재학생이 문화 차이를 주제로 숏폼 콘텐츠를 제작합니다. 인터뷰를 바탕으로 기획부터 촬영·편집까지 진행합니다.',
  info: [
    { label: '모집 인원', value: '4명' },
    { label: '모집 역할', value: '기획 · 촬영 · 영상 편집' },
    { label: '진행 기간', value: '~ 9월 31일' },
    { label: '회의 일정', value: '주 1회 오프라인' },
    { label: '모집 마감', value: '~26.08.08' },
  ],
};

const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 0.5;

export function ProjectCreateScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showAiResult, setShowAiResult] = useState(false);
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

  function openAiResult() {
    setShowAiResult(true);
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
                <Image
                  source={require('../../assets/images/fitple-gray.png')}
                  accessibilityLabel="기본 프로젝트 이미지"
                  resizeMode="contain"
                  style={{ width: 72, height: 72 }}
                />
              </View>

              <Pressable
                accessibilityLabel="대표 이미지 변경"
                accessibilityRole="button"
                className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full bg-white"
                onPress={() => {
                  // 이미지 선택은 API 연동 후 구현
                }}
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
              onChangeText={setTitle}
              placeholder="프로젝트 제목을 입력해주세요"
              placeholderTextColor="#828797"
              value={title}
            />
          </View>

          <View className="mt-6 px-5">
            <Text className="font-sans-medium text-base text-gray-6">프로젝트 소개글</Text>
            <View className="mt-2 rounded-2xl bg-white p-4">
              <TextInput
                accessibilityLabel="프로젝트 소개글"
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
                onPress={openAiResult}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text className="font-sans text-xs text-gray-5">↻</Text>
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
              accessibilityLabel="파일 첨부로 AI에게 분석 맡기기"
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-4"
              onPress={() => {
                // 파일 선택기는 백엔드 연동 후 구현 (파일 찾기 창만 열림)
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
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
                <Text className="mt-0.5 font-sans text-xs text-gray-4">
                  PDF, jpg, png (최대 20MB)
                </Text>
              </View>
            </Pressable>
          </View>

          <View className="mt-8 px-5">
            <PrimaryButton
              label="완료하기"
              onPress={() => {
                // 다음 단계(AI 생성 결과 화면)는 미구현
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showAiResult ? (
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
              {MOCK_AI_RESULT.summary}
            </Text>
            <View className="mt-3 border-t border-dashed border-gray-3" />
            <View className="mt-3 gap-1.5">
              {MOCK_AI_RESULT.info.map((row) => (
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
              onPress={() => {
                // AI 다시 생성은 API 연동 후 구현, mock이라 동일 결과 유지
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className="font-sans text-xs text-gray-5">↻</Text>
              <Text className="font-sans-medium text-xs text-gray-5">AI 다시 생성</Text>
            </Pressable>
          </View>

          <View className="mt-5">
            <PrimaryButton
              label="완료하기"
              onPress={() => router.push('/project-complete' as Href)}
            />
          </View>
          </View>
          </View>
        </Animated.View>
      ) : null}
    </CommonLayout>
  );
}
