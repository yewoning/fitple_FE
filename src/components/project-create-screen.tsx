import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CommonLayout } from '@/components/layout';
import { PrimaryButton } from '@/components/primary-button';

export function ProjectCreateScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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
                onPress={() => {
                  // AI 생성은 API 연동 후 구현
                }}
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
                // 파일 첨부는 API 연동 후 구현
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
    </CommonLayout>
  );
}
