import type { PropsWithChildren, ReactNode } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthScreenLayoutProps extends PropsWithChildren {
  title: ReactNode;
  description?: string;
  showBackButton?: boolean;
}

export function AuthScreenLayout({
  children,
  title,
  description,
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
    <SafeAreaView className="flex-1 bg-gray-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mx-auto w-full max-w-md flex-1 px-6 pb-10 pt-4">
            {showBackButton ? (
              <Pressable
                accessibilityLabel="뒤로 가기"
                accessibilityRole="button"
                className="mb-10 h-11 w-11 items-center justify-center rounded-full"
                hitSlop={8}
                onPress={handleBack}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Text className="font-sans text-3xl text-gray-6">‹</Text>
              </Pressable>
            ) : null}

            <View className="mb-8">
              <Text className="font-sans text-[32px] font-bold leading-10 text-black">{title}</Text>
              {description ? (
                <Text className="mt-3 font-sans text-base leading-6 text-gray-5">
                  {description}
                </Text>
              ) : null}
            </View>

            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
