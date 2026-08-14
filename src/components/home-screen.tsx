import { Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COMPACT_HEIGHT = 760;

// 좌측 상단 sky-blue 블롭
const BLUE_BLOB_SIZE_RATIO = 0.9;
const BLUE_BLOB_OFFSET_RATIO = 0.38;
const BLUE_BLOB_BLUR = 90;
const BLUE_BLOB_OPACITY = 0.55;

// 우측 중단 yellow-2 블롭
const YELLOW_BLOB_SIZE_RATIO = 0.6;
const YELLOW_BLOB_OFFSET_RATIO = 0.4;
const YELLOW_BLOB_TOP_RATIO = 0.38;
const YELLOW_BLOB_BLUR = 65;
const YELLOW_BLOB_OPACITY = 0.6;

export function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const compactHeight = height < COMPACT_HEIGHT;

  const blueBlobSize = width * BLUE_BLOB_SIZE_RATIO;
  const yellowBlobSize = width * YELLOW_BLOB_SIZE_RATIO;

  return (
    <View className="flex-1 bg-gray-1">
      <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
        <View
          className="absolute rounded-full bg-sky-blue"
          style={{
            width: blueBlobSize,
            height: blueBlobSize,
            top: -blueBlobSize * BLUE_BLOB_OFFSET_RATIO,
            left: -blueBlobSize * BLUE_BLOB_OFFSET_RATIO,
            opacity: BLUE_BLOB_OPACITY,
            filter: `blur(${BLUE_BLOB_BLUR}px)`,
          }}
        />
        <View
          className="absolute rounded-full bg-yellow-2"
          style={{
            width: yellowBlobSize,
            height: yellowBlobSize,
            top: height * YELLOW_BLOB_TOP_RATIO - yellowBlobSize * YELLOW_BLOB_OFFSET_RATIO,
            right: -yellowBlobSize * YELLOW_BLOB_OFFSET_RATIO,
            opacity: YELLOW_BLOB_OPACITY,
            filter: `blur(${YELLOW_BLOB_BLUR}px)`,
          }}
        />
      </View>

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
    </View>
  );
}
