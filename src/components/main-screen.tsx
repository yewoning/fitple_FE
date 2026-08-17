import { type Href, useRouter } from 'expo-router';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '@/components/screen-background';

const COMPACT_HEIGHT = 760;

const LOGO_ASPECT_RATIO = 212 / 129;
const LOGO_WIDTH = 190;

export function MainScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const compactHeight = height < COMPACT_HEIGHT;

  return (
    <View className="flex-1 bg-gray-1">
      <ScreenBackground />

      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center px-10">
          <View
            className="w-full max-w-80 items-center"
            style={{ paddingTop: compactHeight ? 110 : 212 }}
          >
            <Text className="font-sans-bold text-[26px] leading-8 text-black">
              환영합니다!
            </Text>

            <Text className="mt-3 font-sans text-center text-[17px] leading-[22px] text-gray-6">
              프로젝트의 시작부터{`\n`}끝까지{' '}
              <Text className="font-sans-bold text-gray-6">AI 하나로</Text>
            </Text>

            <View className="mt-12 h-44 w-full items-center justify-center">
              <Image
                source={require('../../assets/images/fitple.webp')}
                accessibilityLabel="fitple"
                resizeMode="contain"
                style={{ width: LOGO_WIDTH, height: LOGO_WIDTH / LOGO_ASPECT_RATIO }}
              />
            </View>
          </View>

          <View
            className="absolute bottom-4 left-10 right-10 items-center"
            style={{ paddingBottom: compactHeight ? 0 : 8 }}
          >
            <Pressable
              accessibilityRole="button"
              className="h-[52px] w-full max-w-80 items-center justify-center rounded-full bg-sky-blue shadow-lg shadow-gray-5-overlay"
              onPress={() => router.push('/login' as Href)}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Text className="font-sans-semibold text-base text-gray-1">로그인하기</Text>
            </Pressable>

            <View className="mt-7 items-center gap-1">
              <Text className="font-sans text-[15px] leading-5 text-gray-4">
                아직 회원이 아니신가요?
              </Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => router.push('/signup' as Href)}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text className="font-sans-semibold text-[15px] leading-5 text-gray-6">
                  회원가입
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
