import type { UserSettings } from '@/types';
import { withDemoFallback } from '@/services/demo-fallback';

import { apiClient, mockDelay } from './client';

const mockSettingsByMember = new Map<number, UserSettings>();

function normalizeSettings(data: Partial<UserSettings> | null | undefined): UserSettings {
  return {
    ...(typeof data?.fontSize === 'string' ? { fontSize: data.fontSize } : {}),
    ...(typeof data?.notificationEnabled === 'boolean'
      ? { notificationEnabled: data.notificationEnabled }
      : {}),
    translationEnabled: data?.translationEnabled === true,
  };
}

function getMockSettings(memberId: number): UserSettings {
  return mockSettingsByMember.get(memberId) ?? { translationEnabled: false };
}

export async function getUserSettings(memberId: number): Promise<UserSettings> {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get('/api/settings', { params: { memberId } });
      return normalizeSettings(data);
    },
    () => mockDelay(getMockSettings(memberId))
  );
}

export async function updateUserSettings(
  memberId: number,
  settings: UserSettings
): Promise<UserSettings> {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.put('/api/settings', settings, { params: { memberId } });
      return normalizeSettings({ ...settings, ...(data ?? {}) });
    },
    () => {
      const next = normalizeSettings({ ...getMockSettings(memberId), ...settings });
      mockSettingsByMember.set(memberId, next);
      return mockDelay(next);
    }
  );
}
