import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import '../../global.css';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Pretendard: require('pretendard/dist/public/static/alternative/Pretendard-Regular.ttf'),
    'Pretendard-Medium': require('pretendard/dist/public/static/alternative/Pretendard-Medium.ttf'),
    'Pretendard-SemiBold': require('pretendard/dist/public/static/alternative/Pretendard-SemiBold.ttf'),
    'Pretendard-Bold': require('pretendard/dist/public/static/alternative/Pretendard-Bold.ttf'),
  });
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  // React Native엔 브라우저의 document.visibilityState가 없어서, 연결해주지 않으면
  // React Query는 앱이 백그라운드로 내려간 걸 모릅니다(=채팅 폴링이 계속 돕니다).
  // AppState를 focusManager에 물려주면 백그라운드에선 폴링이 멈추고,
  // 다시 포그라운드로 오면 최신 데이터를 즉시 다시 받아옵니다.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    });
    return () => subscription.remove();
  }, []);

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}
