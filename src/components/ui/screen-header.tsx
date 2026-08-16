import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export function ScreenHeader({
  title,
  showBack = true,
  right,
}: {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <View className="h-[52px] flex-row items-center px-4">
      <View className="w-11">
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color="#3f3f3f" />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text className="flex-1 text-center font-sans text-lg font-bold text-black" numberOfLines={1}>
        {title}
      </Text>
      <View className="w-11 items-end">{right}</View>
    </View>
  );
}
