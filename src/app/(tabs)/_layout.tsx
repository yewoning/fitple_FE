import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4876ee',
        tabBarInactiveTintColor: '#a8adbe',
        tabBarStyle: { borderTopColor: '#e1e4ee', height: 68, paddingBottom: 14, paddingTop: 6 },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarLabelStyle: { fontFamily: 'Pretendard', fontSize: 11, lineHeight: 16 },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: '채팅',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size - 2} color={color} />
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                fontFamily: focused ? 'Pretendard-SemiBold' : 'Pretendard',
                fontSize: 11,
                lineHeight: 16,
                color,
              }}
            >
              채팅
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size - 2} color={color} />,
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                fontFamily: focused ? 'Pretendard-SemiBold' : 'Pretendard',
                fontSize: 11,
                lineHeight: 16,
                color,
              }}
            >
              마이페이지
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
