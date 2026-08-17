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
