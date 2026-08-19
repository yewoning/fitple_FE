import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

export function Avatar({ uri, size = 44 }: { uri?: string | null; size?: number }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
      />
    );
  }
  return (
    <View
      className="items-center justify-center rounded-full bg-gray-2"
      style={{ width: size, height: size }}
    >
      <Ionicons name="person" size={size * 0.55} color="#a8adbe" />
    </View>
  );
}
