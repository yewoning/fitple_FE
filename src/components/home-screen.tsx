import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

export function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center gap-2 p-6">
        <Text className="text-3xl font-bold text-gray-900">Fitple</Text>
        <Text className="text-center text-base text-gray-600">
          Expo 앱 준비가 완료되었습니다.
        </Text>
      </View>
    </SafeAreaView>
  );
}
