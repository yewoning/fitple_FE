import { Platform } from 'react-native';
import { requestRaw } from '@/services/api-client';
import type {
  ProfileDetail,
  ProfileFile,
  ProfileGenerateRequest,
  ProfileResponse,
  ProfileUpdateRequest,
  ProfileUploadAsset,
} from '@/types/profile';

export function getProfile() {
  return requestRaw<ProfileDetail>('/api/profile');
}

export function generateProfile(payload: ProfileGenerateRequest) {
  return requestRaw<ProfileResponse>('/api/profile/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function regenerateProfile(payload: ProfileGenerateRequest) {
  return requestRaw<ProfileResponse>('/api/profile/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function updateProfile(payload: ProfileUpdateRequest) {
  return requestRaw<{ message: string }>('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
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

  return requestRaw<ProfileFile>(
    `/api/profile/files?memberId=${encodeURIComponent(String(memberId))}`,
    {
      method: 'POST',
      body: formData,
    },
  );
}
