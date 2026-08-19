import { withDemoFallback } from '@/services/demo-fallback';

import { apiClient, mockDelay } from './client';
import { mockUser } from './mockData';

export async function getProfile() {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.get('/api/profile');
      return data;
    },
    () =>
      mockDelay({
      profileImageUrl: mockUser.profileImageUrl,
      name: mockUser.name,
      profileSummary: mockUser.profileSummary,
      createdByAI: mockUser.createdByAI,
      })
  );
}

export async function regenerateProfile(previousProfile: string, additionalPrompt: string) {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.post('/api/profile/regenerate', {
        previousProfile,
        additionalPrompt,
      });
      return data;
    },
    () => mockDelay({ profileSummary: `${previousProfile} ${additionalPrompt}` })
  );
}

export async function editProfile(payload: { name: string; profileSummary: string; profileImage?: string }) {
  return withDemoFallback(
    async () => {
      const { data } = await apiClient.put('/api/profile', payload);
      return data;
    },
    () => mockDelay({ message: '프로필이 수정되었습니다.' })
  );
}
