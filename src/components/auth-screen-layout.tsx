import type { PropsWithChildren, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '@/components/screen-background';

// 시안(393×852) 실측 기준 간격
const PAGE_PADDING_X = 26;
const BACK_BUTTON_SIZE = 44;
const BACK_BUTTON_OFFSET_X = -24; // 화살표 시각 좌표를 시안(x≈12)에 맞추기 위한 보정
const HEADER_MARGIN_TOP = 80; // 뒤로가기 버튼 아래 ~ 로고 상단
const CONTENT_MARGIN_TOP = 24; // 타이틀 아래 ~ 첫 입력 필드

// 타이틀 좌측에 걸치는 로고 마크 (에셋 원본 크기 그대로 사용)
const LOGO_WIDTH = 43;
const LOGO_HEIGHT = 63;
const LOGO_OFFSET_X = 9;
const TITLE_INDENT = 30;
const TITLE_MARGIN_TOP = 40;
const TITLE_FONT_SIZE = 36;
const TITLE_LINE_HEIGHT = 43;

interface AuthScreenLayoutProps extends PropsWithChildren {
  title: ReactNode;
  /** 화면 하단에 붙는 영역 (회원가입 시안의 "다음" 버튼) */
  footer?: ReactNode;
  showBackButton?: boolean;
}

export function AuthScreenLayout({
  children,
  title,
  footer,
  showBackButton = true,
}: AuthScreenLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  return (
    <View className="flex-1 bg-gray-1">
      <ScreenBackground />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow"
            keyboardShouldPersistTaps="handled"
          >
            <View
              className="mx-auto w-full max-w-md flex-1 pb-[10px]"
              style={{ paddingHorizontal: PAGE_PADDING_X }}
            >
              {showBackButton ? (
                <Pressable
                  accessibilityLabel="뒤로 가기"
                  accessibilityRole="button"
                  className="mt-1 items-center justify-center self-start"
                  hitSlop={8}
                  onPress={handleBack}
                  style={{
                    width: BACK_BUTTON_SIZE,
                    height: BACK_BUTTON_SIZE,
                    marginLeft: BACK_BUTTON_OFFSET_X,
                  }}
                >
                  <Text
                    className="font-sans text-gray-6"
                    style={{ fontSize: 32, lineHeight: 36 }}
                  >
                    ←
                  </Text>
                </Pressable>
              ) : null}

              <View style={{ marginTop: HEADER_MARGIN_TOP }}>
                <Image
                  source={require('../../assets/images/logo.webp')}
                  accessibilityLabel="fitple"
                  resizeMode="contain"
                  style={{
                    position: 'absolute',
                    left: LOGO_OFFSET_X,
                    top: 0,
                    width: LOGO_WIDTH,
                    height: LOGO_HEIGHT,
                  }}
                />
                <Text
                  className="font-sans text-black"
                  style={{
                    marginLeft: TITLE_INDENT,
                    marginTop: TITLE_MARGIN_TOP,
                    fontSize: TITLE_FONT_SIZE,
                    lineHeight: TITLE_LINE_HEIGHT,
                  }}
                >
                  {title}
                </Text>
              </View>

              <View style={{ marginTop: CONTENT_MARGIN_TOP }}>{children}</View>

              {footer}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
