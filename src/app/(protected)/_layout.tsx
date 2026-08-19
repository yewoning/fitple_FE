import { useAuthStore } from '@/store/auth-store';
import { Redirect, Stack, type Href } from 'expo-router';

export default function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginId = useAuthStore((state) => state.loginId);
  const memberId = useAuthStore((state) => state.memberId);

  if (!isAuthenticated || !loginId || memberId === null) {
    return <Redirect href={'/login' as Href} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
