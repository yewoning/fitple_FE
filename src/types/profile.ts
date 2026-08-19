export interface ProfileFile {
  fileId: number;
  fileUrl: string;
  originalName: string;
}

export interface ProfileGenerateRequest {
  profileSummary: string;
  usedFiles: ProfileFile[];
  editable: boolean;
}

export interface ProfileResponse {
  profileSummary: string;
}

export interface ProfileDetail {
  profileImage?: string;
  name?: string;
  profileSummary?: string;
}

export interface ProfileUpdateRequest {
  name: string;
  profileSummary: string;
  profileImage?: string;
}

export interface ProfileUploadAsset {
  uri: string;
  name: string;
  mimeType?: string | null;
  file?: File;
}
