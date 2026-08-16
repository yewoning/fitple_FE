export interface ApiResponse<TData = undefined> {
  success: boolean;
  message: string;
  data?: TData;
}

export interface CheckLoginIdData {
  available: boolean;
}

export interface SignupRequest {
  name: string;
  loginId: string;
  password: string;
  passwordConfirm: string;
}

export interface SigninRequest {
  loginId: string;
  password: string;
}
