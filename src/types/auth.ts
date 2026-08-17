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
  login_id: string;
  password: string;
}
