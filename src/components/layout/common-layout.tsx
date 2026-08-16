import type { ReactNode } from 'react';
import { View } from 'react-native';
import { AppHeader, type HeaderProps } from './app-header';
import { BottomNavbar, type BottomNavbarProps } from './bottom-navbar';

export interface CommonLayoutProps {
  children: ReactNode;
  header: HeaderProps | false;
  bottomNav: BottomNavbarProps | false;
}

export function CommonLayout({ children, header, bottomNav }: CommonLayoutProps) {
  return (
    <View className="flex-1 bg-gray-1">
      {header ? <AppHeader {...header} /> : null}
      <View className="flex-1">{children}</View>
      {bottomNav ? <BottomNavbar {...bottomNav} /> : null}
    </View>
  );
}
