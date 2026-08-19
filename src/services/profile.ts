import { Platform } from 'react-native';
import { getDemoUser } from '@/mocks/fixtures';
import { demoStore, getDemoProfile } from '@/mocks/demo-store';
import { requestRaw } from '@/services/api-client';
import { withDemoFallback } from '@/services/demo-fallback';
import type {
  ProfileDetail,
  ProfileFile,
  ProfileGenerateRequest,
  ProfileResponse,
  ProfileUpdateRequest,
  ProfileUploadAsset,
} from '@/types/profile';

export function getProfile() {
  return withDemoFallback(
    () => requestRaw<ProfileDetail>('/api/profile'),
    () => getDemoProfile(),
  );
}

export function generateProfile(payload: ProfileGenerateRequest) {
  return withDemoFallback(
    () =>
      requestRaw<ProfileResponse>('/api/profile/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    () => ({ profileSummary: buildDemoProfileSummary(payload) }),
  );
}

export function regenerateProfile(payload: ProfileGenerateRequest) {
  return withDemoFallback(
    () =>
      requestRaw<ProfileResponse>('/api/profile/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    () => ({ profileSummary: buildDemoProfileSummary(payload) }),
  );
}

export function updateProfile(payload: ProfileUpdateRequest) {
  return withDemoFallback(
    () =>
      requestRaw<{ message: string }>('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    () => {
      demoStore.getState().updateProfile(getDemoUser().memberId, payload);
      return { message: '프로필이 저장되었습니다.' };
    },
  );
}

export function uploadProfileFile(memberId: number, asset: ProfileUploadAsset) {
  const formData = new FormData();

  if (Platform.OS === 'web' && asset.file) {
    formData.append('file', asset.file);
  } else {
    formData.append(
      'file',
      {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/octet-stream',
      } as unknown as Blob,
    );
  }

  return withDemoFallback(
    () =>
      requestRaw<ProfileFile>(
        `/api/profile/files?memberId=${encodeURIComponent(String(memberId))}`,
        {
          method: 'POST',
          body: formData,
        },
      ),
    () => demoStore.getState().addProfileFile(asset),
  );
}

function buildDemoProfileSummary(payload: ProfileGenerateRequest) {
  const source = payload.profileSummary.trim() || '업로드한 경험 자료';
  return `${source}\n\n프로젝트 목표를 빠르게 이해하고 팀원들과 책임감 있게 협업하는 사람입니다.`;
}
