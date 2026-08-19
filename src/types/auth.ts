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

export interface SignupResponse {
  success: boolean;
  memberId: number;
  message: string;
}

export interface SigninResponse {
  success: boolean;
  message: string;
  memberId?: number;
}
