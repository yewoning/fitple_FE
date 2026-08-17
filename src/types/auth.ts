export interface ApiResponse<TData = undefined> {
  success: boolean;
  message: string;
  data?: TData;
}

export interface CheckLoginIdResponse {
  available: boolean;
  message: string;
}

export interface SignupRequest {
  name: string;
  loginId: string;
  password: string;
  passwordConfirm: string;
}

export interface SigninRequest {
  login_id: string;
  password: string;
}

/** `GET /api/profile` 응답. ApiResponse 봉투를 쓰지 않는 평평한 객체다. */
export interface ProfileResponse {
  profileImageUrl?: string | null;
  name?: string | null;
  profileSummary?: string | null;
  createdByAI?: boolean;
}
