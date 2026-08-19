import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
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
