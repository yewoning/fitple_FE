import { apiClient, mockDelay, USE_MOCK } from './client';
import { mockUser } from './mockData';

export async function getProfile() {
  if (USE_MOCK) {
    return mockDelay({
      profileImageUrl: mockUser.profileImageUrl,
      name: mockUser.name,
      profileSummary: mockUser.profileSummary,
      createdByAI: mockUser.createdByAI,
    });
  }
  const { data } = await apiClient.get('/api/profile');
  return data;
}

export async function regenerateProfile(previousProfile: string, additionalPrompt: string) {
  if (USE_MOCK) {
    return mockDelay({ profileSummary: `${previousProfile} ${additionalPrompt}` });
  }
  const { data } = await apiClient.post('/api/profile/regenerate', { previousProfile, additionalPrompt });
  return data;
}

export async function editProfile(payload: { name: string; profileSummary: string; profileImage?: string }) {
  if (USE_MOCK) {
    return mockDelay({ message: '프로필이 수정되었습니다.' });
  }
  const { data } = await apiClient.put('/api/profile', payload);
  return data;
}
