import { Image, type ImageSourcePropType, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type BottomNavKey = 'home' | 'projects' | 'chat' | 'mypage';

export interface BottomNavbarProps {
  activeTab: BottomNavKey;
  onTabPress: (tab: BottomNavKey) => void;
}

interface NavItem {
  key: BottomNavKey;
  label: string;
  icon: ImageSourcePropType;
  width: number;
}

const ACTIVE_COLOR = '#0169FF';
const INACTIVE_COLOR = '#484D5A';

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '홈', icon: require('../../../assets/icons/home.png'), width: 20 },
  { key: 'projects', label: '프로젝트', icon: require('../../../assets/icons/folder.png'), width: 20 },
  { key: 'chat', label: '채팅', icon: require('../../../assets/icons/chat.png'), width: 20 },
  { key: 'mypage', label: '마이페이지', icon: require('../../../assets/icons/people.png'), width: 15 },
];

export function BottomNavbar({ activeTab, onTabPress }: BottomNavbarProps) {
  return (
    <SafeAreaView edges={['bottom']} className="bg-gray-1">
      <View className="h-16 flex-row bg-gray-1">
        {NAV_ITEMS.map((item) => {
          const selected = item.key === activeTab;
          const color = selected ? ACTIVE_COLOR : INACTIVE_COLOR;

          return (
            <Pressable
              key={item.key}
              accessibilityLabel={`${item.label} 탭`}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className="h-full flex-1 items-center justify-center gap-1"
              onPress={() => onTabPress(item.key)}
            >
              <Image
                resizeMode="contain"
                source={item.icon}
                style={{ width: item.width, height: 20, tintColor: color }}
              />
              <Text className="font-sans text-xs font-normal" style={{ color }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
