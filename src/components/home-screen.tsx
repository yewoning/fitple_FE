import { LinearGradient } from 'expo-linear-gradient';
import { Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COMPACT_HEIGHT = 760;
const GRADIENT_COLORS = ['#e3eaf4', '#f6f8fb', '#ffffbe', '#f6f8fb', '#f6f8fb'] as const;

export function HomeScreen() {
  const { height } = useWindowDimensions();
  const compactHeight = height < COMPACT_HEIGHT;

  return (
    <LinearGradient
      colors={GRADIENT_COLORS}
      locations={[0, 0.28, 0.48, 0.68, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center px-10">
          <View
            className="w-full max-w-80 items-center"
            style={{ paddingTop: compactHeight ? 110 : 212 }}
          >
            <Text className="font-sans text-[26px] font-bold leading-8 text-black">
              환영합니다!
            </Text>

            <Text className="mt-3 font-sans text-center text-[17px] leading-[22px] text-gray-6">
              프로젝트의 시작부터{`\n`}끝까지{' '}
              <Text className="font-sans font-bold text-gray-6">AI 하나로</Text>
            </Text>

            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              className="mt-12 h-44 w-full"
            />
          </View>

          <View
            className="absolute bottom-4 left-10 right-10 items-center"
            style={{ paddingBottom: compactHeight ? 0 : 8 }}
          >
            <View className="h-[52px] w-full max-w-80 items-center justify-center rounded-full bg-sky-blue shadow-lg shadow-gray-5-overlay">
              <Text className="font-sans text-base font-semibold text-gray-1">로그인하기</Text>
            </View>

            <View className="mt-7 items-center gap-1">
              <Text className="font-sans text-[15px] leading-5 text-gray-4">
                아직 회원이 아니신가요?
              </Text>
              <Text className="font-sans text-[15px] font-semibold leading-5 text-gray-6">
                회원가입
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
