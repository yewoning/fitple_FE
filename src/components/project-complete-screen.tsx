import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { type Href, useRouter } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '@/components/screen-background';

export interface ProjectCompleteScreenProps {
  projectId?: string;
  inviteLink?: string;
  qrCodeUrl?: string;
}

export function ProjectCompleteScreen({ projectId, inviteLink, qrCodeUrl }: ProjectCompleteScreenProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!inviteLink) return;
    await Clipboard.setStringAsync(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleClose() {
    if (projectId) {
      router.replace(`/project/${projectId}` as Href);
      return;
    }
    router.replace('/projects' as Href);
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
          <View className="mt-16 h-[168px] w-[168px] items-center justify-center rounded-2xl bg-white p-4">
            {qrCodeUrl ? (
              <Image
                source={{ uri: qrCodeUrl }}
                resizeMode="contain"
                style={{ width: '100%', height: '100%' }}
              />
            ) : null}
          </View>

          <View className="mt-10 w-full max-w-80 flex-row items-center gap-2">
            <View className="h-[52px] flex-1 justify-center rounded-full bg-white px-5">
              <Text className="font-sans text-sm text-gray-6" numberOfLines={1}>
                {inviteLink ?? ''}
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
