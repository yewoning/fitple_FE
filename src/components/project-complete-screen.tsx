import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { type Href, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '@/components/screen-background';

const MOCK_INVITE_URL = 'fitple.app/invite/7K3M9P';
const DEFAULT_PROJECT_ID = 'recruit-1';

export interface ProjectCompleteScreenProps {
  projectId?: string;
}

export function ProjectCompleteScreen({ projectId }: ProjectCompleteScreenProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(MOCK_INVITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleClose() {
    router.replace(`/project/${projectId ?? DEFAULT_PROJECT_ID}` as Href);
  }

  return (
    <View className="flex-1 bg-gray-1">
      <ScreenBackground />

      <SafeAreaView className="flex-1">
        <View className="px-5 pt-2">
          <Pressable
            accessibilityLabel="닫기"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center"
            hitSlop={4}
            onPress={handleClose}
          >
            <Text className="font-sans text-2xl text-gray-6">✕</Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center px-10 pt-8">
          <Text className="text-center font-sans-bold text-2xl leading-8 text-black">
            프로젝트 준비가{`\n`}모두 완료되었어요!
          </Text>

          <Text className="mt-3 text-center font-sans text-sm leading-5 text-gray-6">
            이제 함께할 팀원을 초대해 볼까요?{`\n`}QR코드나 링크를 공유해 주세요.
          </Text>

          <View className="mt-10 items-center justify-center rounded-2xl bg-white p-4">
            <QRCode
              value={`https://${MOCK_INVITE_URL}`}
              size={168}
              backgroundColor="white"
              color="black"
            />
          </View>

          <View className="mt-10 w-full max-w-80 flex-row items-center gap-2">
            <View className="h-[52px] flex-1 justify-center rounded-full bg-white px-5">
              <Text className="font-sans text-sm text-gray-6" numberOfLines={1}>
                {MOCK_INVITE_URL}
              </Text>
            </View>

            <Pressable
              accessibilityLabel="초대 링크 복사"
              accessibilityRole="button"
              className="h-[52px] items-center justify-center rounded-full bg-sky-blue px-5"
              onPress={handleCopy}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Text className="font-sans-semibold text-sm text-gray-1">
                {copied ? '복사됨' : '복사'}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
