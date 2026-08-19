import { MainScreen } from '@/components/main-screen';
import { useAuthStore } from '@/store/auth-store';
import { Redirect, type Href } from 'expo-router';

export default function IndexRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginId = useAuthStore((state) => state.loginId);
  const memberId = useAuthStore((state) => state.memberId);

  if (isAuthenticated && loginId && memberId !== null) {
    return <Redirect href={'/home' as Href} />;
  }

  return <MainScreen />;
}
