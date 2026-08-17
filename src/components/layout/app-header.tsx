import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface TranslationControl {
  enabled: boolean;
  onChange: (next: boolean) => void;
}

export interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  translation?: TranslationControl;
  showMore?: boolean;
  onMorePress?: () => void;
}

const BACK_SLOT_WIDTH = 56;
const TRANSLATION_WIDTH = 84;
const MORE_WIDTH = 32;
const RIGHT_GAP = 4;

export function AppHeader({
  title,
  showBack = true,
  onBackPress,
  translation,
  showMore = false,
  onMorePress,
}: HeaderProps) {
  const router = useRouter();
  const rightSlotWidth =
    (translation ? TRANSLATION_WIDTH : 0) +
    (showMore ? MORE_WIDTH : 0) +
    (translation && showMore ? RIGHT_GAP : 0);
  const titleInset = Math.max(showBack ? BACK_SLOT_WIDTH : 0, rightSlotWidth) + 8;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView edges={['top']} className="bg-white">
      <View className="h-14 flex-row items-center bg-white px-2">
        <View className="z-10 h-full w-12 items-start justify-center">
          {showBack ? (
            <Pressable
              accessibilityLabel="이전 화면으로 돌아가기"
              accessibilityRole="button"
              className="h-11 w-11 items-center justify-center"
              hitSlop={4}
              onPress={handleBackPress}
            >
              <Text className="font-sans text-[36px] font-normal leading-[40px] text-gray-4">←</Text>
            </Pressable>
          ) : null}
        </View>

        <View
          pointerEvents="none"
          className="absolute bottom-0 top-0 items-center justify-center"
          style={{ left: titleInset, right: titleInset }}
        >
          <Text
            className="font-sans text-xl font-normal leading-7 text-gray-6"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        <View className="z-10 ml-auto flex-row items-center" style={{ gap: RIGHT_GAP }}>
          {translation ? (
            <Pressable
              accessibilityLabel={`번역 ${translation.enabled ? '켜짐' : '꺼짐'}`}
              accessibilityRole="switch"
              accessibilityState={{ checked: translation.enabled }}
              className="h-9 flex-row items-center rounded-full bg-white-dark-sky-blue p-1 pl-3"
              onPress={() => translation.onChange(!translation.enabled)}
              style={{ width: TRANSLATION_WIDTH }}
            >
              <Text className="mr-2 font-sans text-xs font-normal text-gray-6">번역</Text>
              <View
                className={`h-7 flex-1 items-center justify-center rounded-full ${
                  translation.enabled ? 'bg-dark-blue' : 'bg-sky-blue'
                }`}
              >
                <Text
                  className={`font-sans-medium text-sm ${
                    translation.enabled ? 'text-gray-2' : 'text-gray-5'
                  }`}
                >
                  {translation.enabled ? 'ON' : 'OFF'}
                </Text>
              </View>
            </Pressable>
          ) : null}

          {showMore ? (
            <Pressable
              accessibilityLabel="더보기"
              accessibilityRole="button"
              accessibilityState={{ disabled: !onMorePress }}
              className="h-11 items-center justify-center"
              disabled={!onMorePress}
              onPress={onMorePress}
              style={{ width: MORE_WIDTH }}
            >
              <Text className="font-sans-bold text-[32px] leading-8 text-dark-blue">⋮</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
