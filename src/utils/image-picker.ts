import * as ImagePicker from 'expo-image-picker';

export interface PickedImageFile {
  uri: string;
  name: string;
  type: string;
}

function inferFileName(uri: string, mimeType?: string | null): string {
  const extFromMime = mimeType?.split('/')[1];
  const extFromUri = uri.split('.').pop();
  const ext = extFromMime || extFromUri || 'jpg';
  return `upload-${Date.now()}.${ext}`;
}

/**
 * 갤러리에서 이미지 1장을 선택해 업로드용 파일 정보로 반환한다.
 * 권한이 없거나 사용자가 선택을 취소하면 null을 반환한다.
 */
export async function pickImageFile(): Promise<PickedImageFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName || inferFileName(asset.uri, asset.mimeType),
    type: asset.mimeType || 'image/jpeg',
  };
}
