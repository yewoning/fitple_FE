import { type Href, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/primary-button';
import { useAuthStore } from '@/store/auth-store';

export function AuthCompleteScreen() {
  const router = useRouter();
  const loginId = useAuthStore((state) => state.loginId);
  const clearAuthentication = useAuthStore((state) => state.clearAuthentication);

  const handleLogout = () => {
    clearAuthentication();
    router.replace('/login' as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-1">
      <View className="mx-auto w-full max-w-md flex-1 items-center justify-center gap-4 px-6">
        <Text className="font-sans-bold text-3xl text-black">로그인 완료</Text>
        <Text className="font-sans text-base text-gray-6">{loginId}님, 환영합니다.</Text>
        <View className="mt-6 w-full">
          <PrimaryButton label="로그아웃" onPress={handleLogout} />
        </View>
      </View>
    </SafeAreaView>
  );
}
